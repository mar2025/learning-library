const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');
const showdown  = require('showdown');

const converter = new showdown.Converter({ tables: true, ghCompatibleHeaderId: true });

(async () => {
  const mdFiles = await glob('workshops/**/*.md', { nodir: true });

  await Promise.all(mdFiles.map(async (file) => {
    const src = await fs.readFile(file, 'utf8');
    const html = converter.makeHtml(src);
    const dest = file.replace(/\.md$/, '.html');
    await fs.writeFile(dest, html, 'utf8');
    console.log(`Rendered ${file} → ${dest}`);
  }));
})();