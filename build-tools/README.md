# Oracle Learning Library - Build Tools

This directory contains performance optimization tools for the Oracle Learning Library.

## Quick Start

1. **Install dependencies**:
   ```bash
   cd build-tools
   npm install
   ```

2. **Run complete optimization**:
   ```bash
   ./optimize.sh
   ```

## Individual Optimization Scripts

### Image Optimization
```bash
node optimize-images.js
```
- Compresses images 60-80%
- Creates responsive variants (400w, 800w, 1200w)
- Converts to modern formats (WebP)
- Generates picture elements for HTML

### CSS/JS Bundling
```bash
npm run build
```
- Bundles and minifies CSS/JavaScript
- Removes unused code (tree shaking)
- Creates production-ready assets
- Generates source maps

### Performance Analysis
```bash
npm run analyze
```
- Analyzes bundle sizes
- Identifies optimization opportunities
- Generates performance reports

## File Structure

```
build-tools/
├── package.json              # Dependencies and scripts
├── webpack.config.js         # Bundling configuration
├── optimize-images.js        # Image optimization script
├── optimize.sh              # Master optimization script
├── src/
│   ├── ziplab.js            # Modern JavaScript entry point
│   └── shared/              # Shared utilities
└── README.md               # This file
```

## Expected Results

After optimization, you should see:

- **60-80% reduction** in image sizes
- **40-50% reduction** in CSS bundle size
- **50-70% reduction** in JavaScript bundle size
- **2-4 seconds faster** First Contentful Paint
- **5-8 seconds faster** Largest Contentful Paint

## Manual Optimization Commands

If you prefer manual control:

### Images
```bash
# Install sharp for image processing
npm install -g sharp-cli

# Optimize PNG files
find . -name "*.png" -exec sharp {} --output={.}-optimized.png --png-quality=90 \;

# Convert to WebP
find . -name "*.png" -exec sharp {} --output={.}.webp --webp-quality=80 \;
```

### CSS
```bash
# Install cssnano for CSS minification
npm install -g cssnano-cli

# Minify CSS
cssnano input.css output.min.css
```

### JavaScript
```bash
# Install terser for JS minification
npm install -g terser

# Minify JavaScript
terser input.js -o output.min.js -c -m
```

## Monitoring Performance

After optimization, monitor improvements with:

- **Lighthouse**: Built into Chrome DevTools
- **WebPageTest**: https://webpagetest.org
- **Core Web Vitals**: Chrome extension
- **GTmetrix**: https://gtmetrix.com

## Troubleshooting

### Common Issues

1. **Node.js not found**: Install Node.js 16+ from https://nodejs.org
2. **Permission denied**: Run `chmod +x optimize.sh`
3. **Out of memory**: Increase Node.js memory with `--max-old-space-size=4096`
4. **Sharp installation fails**: Install build tools for your platform

### Large Repository Handling

For repositories >2GB:
- Process images in batches
- Use `--max-old-space-size=8192` for Node.js
- Consider cloud-based optimization services

## Contributing

To add new optimizations:

1. Create script in this directory
2. Add to `optimize.sh` main function
3. Update package.json scripts
4. Test thoroughly before committing

## License

This optimization toolset is licensed under the same terms as the Oracle Learning Library (UPL-1.0).