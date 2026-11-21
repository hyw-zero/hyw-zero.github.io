/* NEMO · Live2D mascot bootstrap (online assets) */
(function () {
  'use strict';

  if (window.__nemoLive2DLoaded) return;
  window.__nemoLive2DLoaded = true;

  // Widget code and tips come from the upstream project. Models come from the
  // pinned 1.0.1 tag of the public live2d_api mirror, served by jsDelivr.
  // Pinning the tag keeps the paths stable and avoids the oversized default
  // branch, so the blog no longer ships a 10 MB model directory.
  var WIDGET = 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@v0.9.1/';
  var MODELS = 'https://gcore.jsdelivr.net/gh/fghrsh/live2d_api@1.0.1/';

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
      // Migrate visitors once from the old local widget, which always pinned
      // model 0. Start them on Tia (index 1) and keep later choices stable.
      if (localStorage.getItem('nemo-live2d-version') !== '2') {
        localStorage.setItem('modelId', '1');
        localStorage.setItem('modelTexturesId', '0');
        localStorage.setItem('nemo-live2d-version', '2');
      }
      localStorage.removeItem('waifu-display');
    } catch (e) {}

    window.initWidget({
      waifuPath: WIDGET + 'waifu-tips.json',
      cdnPath: MODELS,
      tools: ['hitokoto', 'switch-model', 'photo', 'info', 'quit']
    });
  }

  function boot() {
    Promise.all([
      loadResource(WIDGET + 'waifu.css?v=2', 'css'),
      loadResource(WIDGET + 'live2d.min.js?v=2', 'js')
    ])
      .then(function () { return loadResource(WIDGET + 'waifu-tips.js?v=3', 'js'); })
      .then(init)
      .catch(function (error) {
        console.warn('[NEMO] Live2D could not start:', error && error.message);
      });
  }

  var bootScheduled = false;

  function scheduleBoot() {
    if (bootScheduled) return;
    bootScheduled = true;

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(boot, { timeout: 2000 });
    } else {
      window.setTimeout(boot, 800);
    }
  }

  // The model + textures are still the heaviest assets on the page. Wait until
  // the window load event so they never compete with the article's first paint.
  if (document.readyState === 'complete') {
    scheduleBoot();
  } else {
    window.addEventListener('load', scheduleBoot, { once: true });
    window.setTimeout(scheduleBoot, 6000);
  }
})();
