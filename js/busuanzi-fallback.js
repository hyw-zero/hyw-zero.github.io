(function () {
  'use strict';

  // Primary counter: busuanzi.ibruce.info, injected by NexT in <head>.
  // Backup: cdn.busuanzi.cc, used only when the primary script fails to load or
  // its API does not return a numeric value in time.
  var FALLBACK = 'https://cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js';
  var TIMEOUT = 6000;
  var NUMBER = /^[\d.,]+[KkMmBbWwEe]?$/;
  var started = false;

  function sitePvEl() {
    return document.getElementById('busuanzi_value_site_pv') ||
      document.getElementById('busuanzi_site_pv');
  }

  function hasValue() {
    var el = sitePvEl();
    return !!el && NUMBER.test(el.textContent.trim());
  }

  function useFallback() {
    if (started || hasValue()) return;
    started = true;

    // busuanzi.cc expects `busuanzi_<key>` IDs. Rename the spans so the backup
    // can fill the same footer nodes that the primary was supposed to fill.
    ['site_uv', 'site_pv', 'page_pv'].forEach(function (key) {
      var el = document.getElementById('busuanzi_value_' + key);
      if (el) el.id = 'busuanzi_' + key;
    });

    var script = document.createElement('script');
    script.src = FALLBACK;
    script.async = true;
    document.head.appendChild(script);
  }

  window.setTimeout(useFallback, TIMEOUT);
})();
