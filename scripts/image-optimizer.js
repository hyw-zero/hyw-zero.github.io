'use strict';

/**
 * Build-time image optimizer.
 *
 * For every raster image in the generated site it creates responsive WebP
 * variants next to the original file, then rewrites the generated HTML so the
 * browser can pick the smallest suitable version:
 *
 *   <img src="/uploads/foo.png" loading="lazy">
 *   ->
 *   <img src="/uploads/foo-w1280.webp"
 *        srcset="/uploads/foo-w640.webp 640w, /uploads/foo-w1280.webp 1280w"
 *        sizes="(max-width: 767px) calc(100vw - 65px), ..."
 *        data-src="/uploads/foo.png"
 *        width="..." height="..." loading="lazy" decoding="async">
 *
 * The original files stay untouched. `data-src` keeps the full-resolution
 * image available for Fancybox / lightbox zooming.
 *
 * Everything is cached in `.image-cache/`, so `hexo clean && hexo generate`
 * only re-encodes images that actually changed.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');

let sharp = null;
try {
  sharp = require('sharp');
} catch (err) {
  // The build should still work when dependencies are installed with
  // `npm install --omit=dev`; the optimizer simply becomes a no-op.
  sharp = null;
}

const IMAGE_EXT = /\.(png|jpe?g|gif)$/i;
const GENERATED_EXT = /-w\d+\.webp$/i;
const HTML_EXT = /\.html$/i;

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getConfig(hexo) {
  const raw = (hexo.config && hexo.config.image_optimizer) || {};
  const widths = Array.isArray(raw.widths) && raw.widths.length
    ? raw.widths.map(Number).filter(n => Number.isFinite(n) && n > 0).sort((a, b) => a - b)
    : [640, 1280];

  return {
    enable: raw.enable !== false,
    widths: widths.length ? widths : [640, 1280],
    quality: Number(raw.quality) || 82,
    gifQuality: Number(raw.gif_quality) || 60,
    minWidth: Number(raw.min_width) || 300,
    minBytes: Number(raw.min_bytes) || 8 * 1024,
    concurrency: Math.max(1, Number(raw.concurrency) || 4),
    sizes: raw.sizes || '(max-width: 767px) calc(100vw - 65px), (max-width: 991px) calc(100vw - 50px), 780px'
  };
}

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch (err) {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walk(full));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function toUrl(relativePath) {
  return encodeURI('/' + toPosix(relativePath));
}

function getAttr(tag, name) {
  const re = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const match = tag.match(re);
  if (!match) return null;
  return match[1] !== undefined ? match[1] : (match[2] !== undefined ? match[2] : match[3]);
}

function hasAttr(tag, name) {
  return new RegExp(`\\s${name}(\\s|=|/?>)`, 'i').test(tag);
}

function setAttr(tag, name, value) {
  const escaped = String(value).replace(/"/g, '&quot;');
  const re = new RegExp(`(\\s${name}\\s*=\\s*)(?:"[^"]*"|'[^']*'|[^\\s>]+)`, 'i');
  if (re.test(tag)) return tag.replace(re, `$1"${escaped}"`);
  return tag.replace(/\s*\/?>$/, match => ` ${name}="${escaped}"${match}`);
}

function normalizeImagePath(hexo, src) {
  if (!src) return null;

  let value = src.trim();
  if (!value || /^(data:|blob:|#|javascript:)/i.test(value)) return null;

  if (/^https?:\/\//i.test(value)) {
    const site = String(hexo.config.url || '').replace(/\/+$/, '');
    if (!site || !value.startsWith(site + '/')) return null;
    value = value.slice(site.length);
  }

  value = value.split('#')[0].split('?')[0];
  try {
    value = decodeURIComponent(value);
  } catch (err) {
    // Keep the raw path when it is not valid percent-encoding.
  }

  if (!value.startsWith('/')) return null;
  return value;
}

function rewriteTag(tag, manifest, config) {
  const src = getAttr(tag, 'src');
  if (!src) return tag;
  if (/\.(webp|avif)(?:$|[?#])/i.test(src)) return tag;

  // Do not interfere with lazy-load libraries or manually authored responsive
  // images. They already know what they are doing.
  if (getAttr(tag, 'srcset')) return tag;

  const className = getAttr(tag, 'class') || '';
  if (/site-author-image|site-brand-image|brand-image|emoji/i.test(className)) return tag;
  if (/\/images\/(?:favicon|logo)/i.test(src)) return tag;

  const key = normalizeImagePath({ config: { url: config.siteUrl } }, src);
  if (!key) return tag;

  const entry = manifest.get(key);
  if (!entry) return tag;

  let out = tag;
  out = setAttr(out, 'src', entry.src);
  if (entry.srcset) {
    out = setAttr(out, 'srcset', entry.srcset);
    out = setAttr(out, 'sizes', config.sizes);
  }
  if (!hasAttr(out, 'data-src')) out = setAttr(out, 'data-src', entry.original);
  out = setAttr(out, 'width', String(entry.width));
  out = setAttr(out, 'height', String(entry.height));
  if (!hasAttr(out, 'loading')) out = setAttr(out, 'loading', 'lazy');
  if (!hasAttr(out, 'decoding')) out = setAttr(out, 'decoding', 'async');
  return out;
}

async function optimizeImage(hexo, file, relativePath, config, cacheDir) {
  const stat = await fsp.stat(file);
  if (stat.size < config.minBytes) return null;

  const ext = path.extname(file).toLowerCase();
  const animated = ext === '.gif';

  let metadata;
  try {
    metadata = await sharp(file, { animated }).metadata();
  } catch (err) {
    hexo.log.debug('Image optimizer: cannot read %s (%s)', relativePath, err.message);
    return null;
  }

  const width = metadata.width || 0;
  const height = animated ? (metadata.pageHeight || metadata.height) : metadata.height;
  if (!width || !height || width < config.minWidth) return null;

  let widths;
  if (width <= config.widths[0]) {
    widths = [width];
  } else {
    widths = [config.widths[0]];
    const largest = Math.min(width, config.widths[config.widths.length - 1]);
    if (largest > config.widths[0]) widths.push(largest);
  }
  widths = Array.from(new Set(widths)).sort((a, b) => a - b);

  const dir = path.dirname(relativePath);
  const base = path.basename(relativePath, path.extname(relativePath));
  const variants = [];

  for (const targetWidth of widths) {
    const outRelative = path.join(dir, `${base}-w${targetWidth}.webp`);
    const outFile = path.join(hexo.public_dir, outRelative);
    const outUrl = toUrl(outRelative);

    let needEncode = true;
    try {
      const outStat = await fsp.stat(outFile);
      if (outStat.size > 0 && outStat.mtimeMs >= stat.mtimeMs) needEncode = false;
    } catch (err) {
      // Missing output; encode it below.
    }

    if (needEncode) {
      const cacheKey = crypto.createHash('sha256')
        .update([
          relativePath,
          targetWidth,
          stat.size,
          stat.mtimeMs,
          config.quality,
          config.gifQuality
        ].join('|'))
        .digest('hex');
      const cacheFile = path.join(cacheDir, `${cacheKey}.webp`);

      let cached = false;
      try {
        const cacheStat = await fsp.stat(cacheFile);
        if (cacheStat.size > 0) cached = true;
      } catch (err) {
        // Cache miss.
      }

      if (cached) {
        await fsp.mkdir(path.dirname(outFile), { recursive: true });
        await fsp.copyFile(cacheFile, outFile);
      } else {
        let pipeline = sharp(file, { animated });
        if (!animated && metadata.hasAlpha) {
          // The post CSS already paints images on a white card. Flattening
          // here removes an unnecessary alpha channel and helps compression.
          pipeline = pipeline.flatten({ background: '#ffffff' });
        }
        pipeline = pipeline.resize({ width: targetWidth, withoutEnlargement: true });
        pipeline = animated
          ? pipeline.webp({ quality: config.gifQuality, effort: 5 })
          : pipeline.webp({ quality: config.quality, effort: 5, smartSubsample: true, alphaQuality: 100 });

        const buffer = await pipeline.toBuffer();
        await fsp.mkdir(cacheDir, { recursive: true });
        await fsp.writeFile(cacheFile, buffer);
        await fsp.mkdir(path.dirname(outFile), { recursive: true });
        await fsp.writeFile(outFile + '.tmp', buffer);
        await fsp.rename(outFile + '.tmp', outFile);
      }
    }

    let outputBytes = 0;
    try {
      const outStat = await fsp.stat(outFile);
      outputBytes = outStat.size;
    } catch (err) {
      // Should not happen after the code above.
    }

    variants.push({ url: outUrl, width: targetWidth, bytes: outputBytes, file: outFile });
  }

  // A WebP variant is only useful when it is meaningfully smaller than the
  // original. Some already-optimized PNGs become larger after conversion; in
  // that case keep the original file in the candidate list instead.
  const usable = variants.filter(variant => variant.bytes > 0 && variant.bytes < stat.size * 0.95);

  if (!usable.length) {
    for (const variant of variants) {
      await fsp.unlink(variant.file).catch(() => {});
    }
    return null;
  }

  const candidates = usable.slice();
  const largestUsable = candidates[candidates.length - 1];

  // The next step up is not smaller than the original. Offer the original
  // itself as the widest candidate so desktop browsers do not download a
  // larger WebP file than the PNG they already have.
  if (largestUsable.width < width) {
    candidates.push({
      url: toUrl(relativePath),
      width,
      bytes: stat.size
    });
  }

  candidates.sort((a, b) => a.width - b.width);
  const largest = candidates[candidates.length - 1];

  // Remove generated variants that did not make it into the final srcset so
  // public/ only contains files that are actually referenced.
  const usedUrls = new Set(candidates.map(candidate => candidate.url));
  for (const variant of variants) {
    if (!usedUrls.has(variant.url)) {
      await fsp.unlink(variant.file).catch(() => {});
    }
  }

  return {
    key: '/' + toPosix(relativePath),
    src: largest.url,
    srcset: candidates.length > 1
      ? candidates.map(candidate => `${candidate.url} ${candidate.width}w`).join(', ')
      : null,
    width,
    height,
    original: toUrl(relativePath),
    originalBytes: stat.size,
    largestBytes: largest.bytes
  };
}

async function run(hexo, config) {
  if (!sharp) {
    hexo.log.warn('Image optimizer: sharp is not installed; skipping image optimization.');
    return;
  }

  const publicDir = hexo.public_dir;
  const cacheDir = path.join(hexo.base_dir, '.image-cache');
  const files = await walk(publicDir);

  const candidates = files.filter(file => {
    if (!IMAGE_EXT.test(file) || GENERATED_EXT.test(file)) return false;
    const relative = toPosix(path.relative(publicDir, file));
    // Background/favicon/logo assets live in /images and are handled by the
    // stylesheet; the avatar is small and is used in several layouts.
    if (relative.startsWith('images/')) return false;
    if (relative === 'uploads/avatar.jpg') return false;
    return true;
  });

  if (!candidates.length) return;

  const started = Date.now();
  const entries = await mapLimit(candidates, config.concurrency, async file => {
    const relative = path.relative(publicDir, file);
    try {
      return await optimizeImage(hexo, file, relative, config, cacheDir);
    } catch (err) {
      hexo.log.warn('Image optimizer: failed on %s (%s)', toPosix(relative), err.message);
      return null;
    }
  });

  const manifest = new Map();
  let originalBytes = 0;
  let largestBytes = 0;
  let optimizedCount = 0;

  for (const entry of entries) {
    if (!entry) continue;
    manifest.set(entry.key, entry);
    originalBytes += entry.originalBytes;
    largestBytes += entry.largestBytes;
    optimizedCount++;
  }

  if (!optimizedCount) return;

  const htmlFiles = files.filter(file => HTML_EXT.test(file));
  let rewrittenFiles = 0;
  let rewrittenImages = 0;

  for (const file of htmlFiles) {
    const html = await fsp.readFile(file, 'utf8');
    let count = 0;
    const next = html.replace(/<img\b[^>]*>/gi, tag => {
      const updated = rewriteTag(tag, manifest, { ...config, siteUrl: hexo.config.url });
      if (updated !== tag) count++;
      return updated;
    });

    if (count > 0) {
      await fsp.writeFile(file, next);
      rewrittenFiles++;
      rewrittenImages += count;
    }
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  hexo.log.info(
    'Image optimizer: %d images -> WebP, %s -> %s (largest variant), %d tags in %d pages, %ss',
    optimizedCount,
    formatBytes(originalBytes),
    formatBytes(largestBytes),
    rewrittenImages,
    rewrittenFiles,
    seconds
  );
}

let generated = false;

hexo.on('generateAfter', () => {
  generated = true;
});

// `after_generate` runs before the CLI writes the generated files to `public`,
// so the image optimizer has to wait until the command is about to exit.
// `before_exit` is still awaited by Hexo, which lets us rewrite the files that
// were just written.
hexo.extend.filter.register('before_exit', async function () {
  if (!generated) return;
  generated = false;

  const config = getConfig(this);
  if (!config.enable) return;
  await run(this, config);
}, 100);
