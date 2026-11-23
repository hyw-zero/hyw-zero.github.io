/* NEMO · Live2D mascot bootstrap (self-hosted, no CDN) */
(function () {
  'use strict';

  if (window.__nemoLive2DLoaded) return;
  window.__nemoLive2DLoaded = true;

  // Widget, tips and models all live under /lib/live2d/. The model bundle is
  // based on the self-hosted layout from alink/live2d-widget and fghrsh's
  // live2d_api; only the default costumes are kept to limit the payload.
  var BASE = '/lib/live2d/';

  function loadResource(url, type) {
    return new Promise(function (resolve, reject) {
      var tag = document.createElement(type === 'css' ? 'link' : 'script');
      if (type === 'css') {
        tag.rel = 'stylesheet';
        tag.href = url;
      } else {
        tag.src = url;
        tag.async = false;
      }
      tag.onload = function () { resolve(url); };
      tag.onerror = function () { reject(new Error('failed: ' + url)); };
      document.head.appendChild(tag);
    });
  }

  function init() {
    try {
      // The offline model list has a different order from the former online
      // one. Reset returning visitors once so stale model indices cannot point
      // at the wrong model. Index 1 is Tia, the site's default mascot.
      if (localStorage.getItem('nemo-live2d-version') !== '3') {
        localStorage.setItem('modelId', '1');
        localStorage.setItem('modelTexturesId', '0');
        localStorage.setItem('nemo-live2d-version', '3');
      }
      localStorage.removeItem('waifu-display');
    } catch (e) {}

    window.initWidget({
      waifuPath: BASE + 'waifu-tips.json',
      cdnPath: BASE,
      tools: ['switch-model', 'photo', 'info', 'quit']
    });
  }

  function boot() {
    // The three widget files do not depend on each other until initWidget runs,
    // so fetch them in parallel instead of chaining two round trips.
    Promise.all([
      loadResource(BASE + 'waifu.css?v=3', 'css'),
      loadResource(BASE + 'live2d.min.js?v=3', 'js'),
      loadResource(BASE + 'waifu-tips.js?v=3', 'js')
    ])
      .then(init)
      .catch(function (error) {
        console.warn('[NEMO] Live2D could not start:', error && error.message);
      });
  }

  // Start as soon as the document is parsed. Waiting for window.load made the
  // mascot appear seconds late on image-heavy pages; these files are preloaded
  // from <head>, so the model can render while late images finish.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
