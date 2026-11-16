'use strict';

/**
 * Build-time Font Awesome subset.
 *
 * The theme only uses a few dozen icons, but loads the full Font Awesome CSS
 * and three ~100 KB webfonts from cdnjs. This filter:
 *
 *   1. collects every `fa-*` class used by the generated HTML/JS,
 *   2. resolves its glyph from Font Awesome's own CSS,
 *   3. subsets the solid/regular/brands fonts to just those glyphs,
 *   4. writes a tiny local CSS file and swaps the cdnjs <link> for it.
 *
 * Everything happens inside `public/`, after Hexo has written the pages.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const subsetFont = require('subset-font');

const FA_PACKAGE = '@fortawesome/fontawesome-free';
const FA_CSS = path.join(path.dirname(require.resolve(FA_PACKAGE + '/package.json')), 'css', 'all.css');

// Classes that are injected by theme JS rather than present in static HTML.
const SAFELIST = [
  'fa-algolia',
  'fa-angle-down',
  'fa-check-circle',
  'fa-copy',
  'fa-frown',
  'fa-search',
  'fa-times-circle'
];

function walk(dir, filter, result = []) {
  if (!fs.existsSync(dir)) return result;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, filter, result);
    else if (filter(full)) result.push(full);
  }

  return result;
}

function collectClassTokens(text, found) {
  const re = /(?<![\w-])fa-[a-z0-9-]+/g;
  let match;
  while ((match = re.exec(text))) found.add(match[0].slice(3));
}

function parseIconMap() {
  const css = fs.readFileSync(FA_CSS, 'utf8');
  const map = new Map();
  const re = /\.fa-([a-z0-9-]+)\s*\{\s*--fa:\s*"([^"]+)";/g;
  let match;

  while ((match = re.exec(css))) {
    const hex = match[2].replace(/[^0-9a-fA-F]/g, '');
    if (hex) map.set(match[1], String.fromCodePoint(parseInt(hex, 16)));
  }

  return map;
}

function fontFace(family, weight, file, version) {
  return '@font-face{font-family:"' + family + '";font-style:normal;font-weight:' + weight +
    ';font-display:swap;src:url("/fonts/' + file + '?v=' + version + '") format("woff2")}';
}

function buildCss(icons, version) {
  const rules = [
    fontFace('Font Awesome 7 Free', 900, 'fa-solid.woff2', version),
    fontFace('Font Awesome 7 Free', 400, 'fa-regular.woff2', version),
    fontFace('Font Awesome 7 Brands', 400, 'fa-brands.woff2', version),
    '.fa,.fas,.fa-solid{font-family:"Font Awesome 7 Free";font-weight:900}',
    '.far,.fa-regular{font-family:"Font Awesome 7 Free";font-weight:400}',
    '.fab,.fa-brands{font-family:"Font Awesome 7 Brands";font-weight:400}',
    '.fa,.fas,.fa-solid,.far,.fa-regular,.fab,.fa-brands{display:inline-block;font-style:normal;font-variant:normal;line-height:1;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}',
    '.fa-fw{text-align:center;width:1.25em}',
    '.fa-lg{font-size:1.33333em;line-height:.75em;vertical-align:-.0667em}',
    '.fa-5x{font-size:5em}',
    '.fa-pulse{animation:fa-spin 1s steps(8) infinite}',
    '.fa-spin{animation:fa-spin 2s linear infinite}',
    '@keyframes fa-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}'
  ];

  for (const [name, glyph] of icons) {
    const hex = glyph.codePointAt(0).toString(16);
    rules.push('.fa-' + name + '::before{content:"\\' + hex + '"}');
  }

  return rules.join('\n');
}

async function writeSubset(publicDir, sourceName, outName, text, version) {
  const input = fs.readFileSync(path.join(path.dirname(FA_CSS), '..', 'webfonts', sourceName));
  const output = await subsetFont(input, text, { targetFormat: 'woff2' });
  fs.writeFileSync(path.join(publicDir, 'fonts', outName), output);
  return output.length;
}

async function run(hexo) {
  const publicDir = hexo.public_dir;
  if (!publicDir || !fs.existsSync(publicDir)) return;

  const iconMap = parseIconMap();
  const used = new Set(SAFELIST);

  const htmlFiles = walk(publicDir, file => file.endsWith('.html'));
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    collectClassTokens(html, used);
  }

  for (const dir of [path.join(publicDir, 'js'), path.join(hexo.base_dir, 'source', 'js')]) {
    for (const file of walk(dir, name => name.endsWith('.js'))) {
      collectClassTokens(fs.readFileSync(file, 'utf8'), used);
    }
  }

  const icons = new Map();
  for (const name of used) {
    if (iconMap.has(name)) icons.set(name, iconMap.get(name));
  }

  if (!icons.size) return;

  const glyphs = [...new Set(icons.values())].join('');
  const css = buildCss(icons, 'pending');
  const version = crypto.createHash('sha1').update(css).digest('hex').slice(0, 8);
  const finalCss = buildCss(icons, version);

  fs.mkdirSync(path.join(publicDir, 'fonts'), { recursive: true });
  fs.mkdirSync(path.join(publicDir, 'css'), { recursive: true });

  const sizes = {};
  sizes.solid = await writeSubset(publicDir, 'fa-solid-900.woff2', 'fa-solid.woff2', glyphs, version);
  sizes.regular = await writeSubset(publicDir, 'fa-regular-400.woff2', 'fa-regular.woff2', glyphs, version);
  sizes.brands = await writeSubset(publicDir, 'fa-brands-400.woff2', 'fa-brands.woff2', glyphs, version);

  fs.writeFileSync(path.join(publicDir, 'css', 'fontawesome-subset.css'), finalCss);

  const faLink = /<link\b[^>]*href="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/font-awesome\/[^"]*\/css\/all\.min\.css"[^>]*>/g;
  let rewritten = 0;
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    if (!faLink.test(html)) continue;
    faLink.lastIndex = 0;
    const next = html.replace(faLink, '<link rel="stylesheet" href="/css/fontawesome-subset.css?v=' + version + '">');
    if (next !== html) {
      fs.writeFileSync(file, next);
      rewritten += 1;
    }
  }

  hexo.log.info(
    'Font Awesome subset: %d icons, solid %d B, regular %d B, brands %d B, %d pages',
    icons.size, sizes.solid, sizes.regular, sizes.brands, rewritten
  );
}

let generated = false;

hexo.on('generateAfter', () => {
  generated = true;
});

// `after_generate` runs before Hexo writes files to `public`, so wait until the
// CLI is about to exit (same point the image optimizer uses).
hexo.extend.filter.register('before_exit', async function () {
  if (!generated) return;
  generated = false;
  await run(this);
}, 200);
