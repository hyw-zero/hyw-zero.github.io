'use strict';

/**
 * PDF library generator.
 *
 * Scans `source/pdf/` (configurable) and generates:
 *   /pdf/          - a catalog page listing every PDF file
 *   /pdf/viewer/   - an online reader that embeds the selected file
 *
 * Drop PDF files into `source/pdf/` (subdirectories are supported), run
 * `hexo generate`, and they show up on the catalog page automatically.
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const DEFAULTS = {
  dir: 'pdf',
  title: 'PDF 阅读',
  description: '课程讲义、技术手册与学习笔记，支持在线预览和下载。'
};

function getConfig(hexo) {
  const raw = (hexo.config && hexo.config.pdf_library) || {};
  const dir = String(raw.dir || DEFAULTS.dir).replace(/^\/+|\/+$/g, '') || DEFAULTS.dir;
  return {
    enable: raw.enable !== false,
    dir,
    title: raw.title || DEFAULTS.title,
    description: raw.description || DEFAULTS.description
  };
}

async function collectPdfs(root) {
  const out = [];

  async function walk(dir) {
    let entries;
    try {
      entries = await fsp.readdir(dir, { withFileTypes: true });
    } catch (err) {
      return;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else if (entry.isFile() && /\.pdf$/i.test(entry.name)) {
        out.push(full);
      }
    }
  }

  await walk(root);
  return out;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}

function encodePath(relativePath) {
  return relativePath.split('/').map(encodeURIComponent).join('/');
}

function formatSize(bytes) {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function renderEmpty() {
  return [
    '<div class="pdf-empty">',
    '  <i class="far fa-file-pdf" aria-hidden="true"></i>',
    '  <p>还没有 PDF 文件</p>',
    '  <p>把 PDF 放到 <code>source/pdf/</code>（支持子目录），重新生成后会自动出现在这里。</p>',
    '</div>'
  ].join('\n');
}

function renderCatalog(items, baseUrl) {
  if (!items.length) return renderEmpty();

  const totalBytes = items.reduce((sum, item) => sum + item.bytes, 0);
  const cards = items.map(item => {
    const viewerUrl = `${baseUrl}viewer/?file=${encodeURIComponent(item.file)}`;
    const folder = item.folder ? `${escapeHtml(item.folder)} · ` : '';
    return [
      '<article class="pdf-card">',
      '  <div class="pdf-card-heading">',
      '    <span class="pdf-card-icon" aria-hidden="true"><i class="far fa-file-pdf"></i></span>',
      '    <div>',
      `      <a class="pdf-card-title" href="${escapeHtml(viewerUrl)}">${escapeHtml(item.title)}</a>`,
      `      <div class="pdf-card-meta">${folder}${formatSize(item.bytes)}</div>`,
      '    </div>',
      '  </div>',
      '  <div class="pdf-card-actions">',
      `    <a class="pdf-card-button is-primary" href="${escapeHtml(viewerUrl)}">在线阅读</a>`,
      `    <a class="pdf-card-button" href="${escapeHtml(item.url)}" download target="_blank" rel="noopener">下载</a>`,
      '  </div>',
      '</article>'
    ].join('\n');
  }).join('\n');

  return [
    `<p class="pdf-library-summary">共 ${items.length} 个文件 · ${formatSize(totalBytes)}</p>`,
    '<div class="pdf-library">',
    cards,
    '</div>'
  ].join('\n');
}

function renderViewer(baseUrl) {
  const base = JSON.stringify(baseUrl);
  return [
    '<div class="pdf-viewer">',
    '  <div class="pdf-viewer-toolbar">',
    `    <a class="pdf-card-button" href="${escapeHtml(baseUrl)}"><i class="fa fa-arrow-left" aria-hidden="true"></i> 返回目录</a>`,
    '    <span class="pdf-viewer-name" id="pdf-viewer-name">正在加载…</span>',
    '    <span class="pdf-viewer-actions">',
    '      <a class="pdf-card-button" id="pdf-viewer-download" href="#" download>下载</a>',
    '      <a class="pdf-card-button" id="pdf-viewer-open" href="#" target="_blank" rel="noopener">新窗口打开</a>',
    '    </span>',
    '  </div>',
    '  <iframe class="pdf-viewer-frame" id="pdf-viewer-frame" title="PDF 在线预览"></iframe>',
    '  <p class="pdf-viewer-hint">若浏览器不支持内嵌预览，请使用「下载」或「新窗口打开」。</p>',
    '</div>',
    '<script>',
    '(function () {',
    `  var BASE = ${base};`,
    "  var params = new URLSearchParams(window.location.search);",
    "  var file = params.get('file') || '';",
    "  var frame = document.getElementById('pdf-viewer-frame');",
    "  var name = document.getElementById('pdf-viewer-name');",
    "  var download = document.getElementById('pdf-viewer-download');",
    "  var open = document.getElementById('pdf-viewer-open');",
    "  var valid = file.indexOf(BASE) === 0 && /\\.pdf$/i.test(file) && file.indexOf('..') === -1;",
    '  if (!valid) {',
    "    frame.style.display = 'none';",
    '    name.innerHTML = \'没有找到要打开的 PDF，<a href="\' + BASE + \'">返回目录</a>\';',
    '    return;',
    '  }',
    '  var src = file.split(\'/\').map(encodeURIComponent).join(\'/\');',
    '  frame.src = src;',
    '  download.href = src;',
    '  open.href = src;',
    "  var label = file.split('/').pop();",
    '  try { label = decodeURIComponent(label); } catch (err) {}',
    "  label = label.replace(/\\.pdf$/i, '');",
    '  name.textContent = label;',
    "  document.title = label + ' | PDF 阅读';",
    '})();',
    '</script>'
  ].join('\n');
}

hexo.extend.generator.register('pdf_library', async function () {
  const config = getConfig(this);
  if (!config.enable) return [];

  const sourceRoot = path.join(this.source_dir, config.dir);
  const files = await collectPdfs(sourceRoot);
  const root = this.config.root || '/';
  const baseUrl = `${root}${config.dir}/`.replace(/\/{2,}/g, '/');

  const items = await Promise.all(files.map(async file => {
    const relative = path.relative(sourceRoot, file).split(path.sep).join('/');
    const folder = path.posix.dirname(relative);
    const stat = await fsp.stat(file);
    return {
      title: path.posix.basename(relative).replace(/\.pdf$/i, ''),
      folder: folder === '.' ? '' : folder,
      bytes: stat.size,
      file: baseUrl + relative,
      url: baseUrl + encodePath(relative)
    };
  }));

  items.sort((a, b) => a.title.localeCompare(b.title, 'zh-CN'));

  return [
    {
      path: `${config.dir}/index.html`,
      layout: 'page',
      data: {
        title: config.title,
        description: config.description,
        comments: false,
        content: renderCatalog(items, baseUrl)
      }
    },
    {
      path: `${config.dir}/viewer/index.html`,
      layout: 'page',
      data: {
        title: 'PDF 阅读器',
        comments: false,
        content: renderViewer(baseUrl)
      }
    }
  ];
});
