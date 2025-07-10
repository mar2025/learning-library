const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const sharp = require('sharp');

(async () => {
  const imgPatterns = [
    'workshops/common-content/images/**/*.{png,jpg,jpeg}',
    'ziplabs/common/img/**/*.{png,jpg,jpeg}'
  ];

  for (const pattern of imgPatterns) {
    const files = await glob(pattern, { nodir: true });
    for (const file of files) {
      const dest = file.replace(/\.(png|jpe?g)$/i, '.webp');
      try {
        const buffer = await sharp(file)
          .webp({ quality: 80 })
          .toBuffer();
        await fs.writeFile(dest, buffer);
        console.log(`Converted ${file} → ${dest}`);
      } catch (err) {
        console.error('Failed to convert', file, err);
      }
    }
  }
})();