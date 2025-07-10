#!/usr/bin/env node

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

// Configuration
const CONFIG = {
  quality: {
    webp: 80,
    jpeg: 85,
    png: 90
  },
  sizes: [400, 800, 1200], // Responsive image sizes
  maxFileSize: 1024 * 1024, // 1MB threshold for optimization
  formats: ['webp', 'original'],
  inputDir: '../',
  outputDir: '../optimized',
  extensions: ['jpg', 'jpeg', 'png', 'gif']
};

class ImageOptimizer {
  constructor(config) {
    this.config = config;
    this.stats = {
      processed: 0,
      optimized: 0,
      sizeSaved: 0,
      errors: 0
    };
  }

  async findImages() {
    const patterns = this.config.extensions.map(ext => 
      `${this.config.inputDir}/**/*.${ext}`
    );
    
    let images = [];
    for (const pattern of patterns) {
      const files = await new Promise((resolve, reject) => {
        glob(pattern, { ignore: '**/node_modules/**' }, (err, files) => {
          if (err) reject(err);
          else resolve(files);
        });
      });
      images.push(...files);
    }
    
    return images;
  }

  async getFileInfo(imagePath) {
    const stats = await fs.stat(imagePath);
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    return {
      path: imagePath,
      size: stats.size,
      width: metadata.width,
      height: metadata.height,
      format: metadata.format
    };
  }

  async shouldOptimize(fileInfo) {
    // Skip if already optimized (in output directory)
    if (fileInfo.path.includes(this.config.outputDir)) {
      return false;
    }
    
    // Optimize large files or create responsive versions for all images
    return fileInfo.size > this.config.maxFileSize || fileInfo.width > 800;
  }

  async optimizeImage(fileInfo) {
    try {
      const outputDir = path.join(
        this.config.outputDir,
        path.dirname(fileInfo.path.replace(this.config.inputDir, ''))
      );
      
      await fs.mkdir(outputDir, { recursive: true });
      
      const baseName = path.parse(fileInfo.path).name;
      const image = sharp(fileInfo.path);
      
      let totalSizeSaved = 0;
      
      // Generate responsive sizes
      for (const size of this.config.sizes) {
        if (fileInfo.width <= size) continue; // Skip if original is smaller
        
        for (const format of this.config.formats) {
          const outputPath = path.join(
            outputDir,
            `${baseName}-${size}w.${format === 'webp' ? 'webp' : path.parse(fileInfo.path).ext.slice(1)}`
          );
          
          let processedImage = image.resize(size, null, {
            withoutEnlargement: true,
            fit: 'inside'
          });
          
          if (format === 'webp') {
            processedImage = processedImage.webp({ 
              quality: this.config.quality.webp,
              effort: 6
            });
          } else if (fileInfo.format === 'jpeg' || fileInfo.format === 'jpg') {
            processedImage = processedImage.jpeg({ 
              quality: this.config.quality.jpeg,
              progressive: true
            });
          } else if (fileInfo.format === 'png') {
            processedImage = processedImage.png({ 
              quality: this.config.quality.png,
              compressionLevel: 9
            });
          }
          
          await processedImage.toFile(outputPath);
          
          const optimizedStats = await fs.stat(outputPath);
          totalSizeSaved += (fileInfo.size - optimizedStats.size);
          
          console.log(`✓ ${outputPath} (${this.formatBytes(optimizedStats.size)})`);
        }
      }
      
      // Also create optimized version at original size
      if (fileInfo.size > this.config.maxFileSize) {
        const optimizedPath = path.join(
          outputDir,
          `${baseName}-optimized.${fileInfo.format === 'jpeg' ? 'jpg' : fileInfo.format}`
        );
        
        let processedImage = image;
        
        if (fileInfo.format === 'jpeg' || fileInfo.format === 'jpg') {
          processedImage = processedImage.jpeg({ 
            quality: this.config.quality.jpeg,
            progressive: true
          });
        } else if (fileInfo.format === 'png') {
          processedImage = processedImage.png({ 
            quality: this.config.quality.png,
            compressionLevel: 9
          });
        }
        
        await processedImage.toFile(optimizedPath);
        
        const optimizedStats = await fs.stat(optimizedPath);
        totalSizeSaved += (fileInfo.size - optimizedStats.size);
        
        console.log(`✓ ${optimizedPath} (${this.formatBytes(optimizedStats.size)})`);
      }
      
      this.stats.optimized++;
      this.stats.sizeSaved += totalSizeSaved;
      
      return totalSizeSaved;
      
    } catch (error) {
      console.error(`✗ Error optimizing ${fileInfo.path}:`, error.message);
      this.stats.errors++;
      return 0;
    }
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async generatePictureElements() {
    // Generate HTML snippets for responsive images
    const images = await this.findImages();
    const pictureElements = [];
    
    for (const imagePath of images) {
      const fileInfo = await this.getFileInfo(imagePath);
      const baseName = path.parse(imagePath).name;
      const relativePath = path.relative(this.config.inputDir, imagePath);
      
      if (await this.shouldOptimize(fileInfo)) {
        const webpSources = this.config.sizes
          .filter(size => fileInfo.width > size)
          .map(size => `${baseName}-${size}w.webp ${size}w`)
          .join(', ');
          
        const fallbackSources = this.config.sizes
          .filter(size => fileInfo.width > size)
          .map(size => `${baseName}-${size}w.${path.parse(imagePath).ext.slice(1)} ${size}w`)
          .join(', ');
        
        const pictureElement = `
<picture>
  <source srcset="${webpSources}" type="image/webp">
  <source srcset="${fallbackSources}" type="image/${fileInfo.format}">
  <img src="${baseName}-800w.${path.parse(imagePath).ext.slice(1)}" 
       alt="Description" 
       loading="lazy" 
       width="${Math.min(fileInfo.width, 800)}" 
       height="auto">
</picture>`;
        
        pictureElements.push({
          original: relativePath,
          optimized: pictureElement
        });
      }
    }
    
    await fs.writeFile(
      'picture-elements.json',
      JSON.stringify(pictureElements, null, 2)
    );
    
    console.log(`\n📄 Generated ${pictureElements.length} picture elements in picture-elements.json`);
  }

  async run() {
    console.log('🖼️  Starting image optimization...\n');
    
    const images = await this.findImages();
    console.log(`Found ${images.length} images to analyze\n`);
    
    for (const imagePath of images) {
      try {
        const fileInfo = await this.getFileInfo(imagePath);
        this.stats.processed++;
        
        console.log(`📊 ${fileInfo.path} (${this.formatBytes(fileInfo.size)}) ${fileInfo.width}x${fileInfo.height}`);
        
        if (await this.shouldOptimize(fileInfo)) {
          await this.optimizeImage(fileInfo);
        } else {
          console.log(`⏭️  Skipped (already optimized or small file)\n`);
        }
        
      } catch (error) {
        console.error(`❌ Error processing ${imagePath}:`, error.message);
        this.stats.errors++;
      }
    }
    
    // Generate responsive image HTML
    await this.generatePictureElements();
    
    // Print final statistics
    console.log('\n📈 Optimization Summary:');
    console.log(`├── Images processed: ${this.stats.processed}`);
    console.log(`├── Images optimized: ${this.stats.optimized}`);
    console.log(`├── Total size saved: ${this.formatBytes(this.stats.sizeSaved)}`);
    console.log(`├── Errors: ${this.stats.errors}`);
    console.log(`└── Success rate: ${((this.stats.optimized / this.stats.processed) * 100).toFixed(1)}%`);
    
    if (this.stats.sizeSaved > 0) {
      const percentageSaved = (this.stats.sizeSaved / (2 * 1024 * 1024 * 1024)) * 100; // Assuming 2GB original
      console.log(`\n🎉 Estimated bandwidth savings: ${percentageSaved.toFixed(1)}%`);
    }
  }
}

// CLI execution
if (require.main === module) {
  const optimizer = new ImageOptimizer(CONFIG);
  optimizer.run().catch(console.error);
}

module.exports = ImageOptimizer;