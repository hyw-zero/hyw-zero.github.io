/* NEMO · Live2D mascot bootstrap (fully self-hosted) */
(function () {
  'use strict';

  if (window.__nemoLive2DLoaded) return;
  window.__nemoLive2DLoaded = true;

  // Everything lives under /lib/live2d/ so the mascot does not depend on
  // jsDelivr, raw.githubusercontent.com or any other external host.
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
      // Always show the mascot on load; the close button still works for
      // the current page. A single local model keeps the id at 0.
      localStorage.removeItem('waifu-display');
      localStorage.setItem('modelId', '0');
      localStorage.setItem('modelTexturesId', '0');
    } catch (e) {}

    window.initWidget({
      waifuPath: BASE + 'waifu-tips.json',
      cdnPath: BASE,
      tools: ['hitokoto', 'photo', 'info', 'quit']
    });
  }

  function boot() {
    Promise.all([
      loadResource(BASE + 'waifu.css?v=1', 'css'),
      loadResource(BASE + 'live2d.min.js?v=1', 'js')
    ])
      .then(function () { return loadResource(BASE + 'waifu-tips.js?v=1', 'js'); })
      .then(init)
      .catch(function (error) {
        console.warn('[NEMO] Live2D could not start:', error && error.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
