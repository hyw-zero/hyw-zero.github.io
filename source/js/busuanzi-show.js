(function () {
  'use strict';

  // NexT hides the counters until Busuanzi fills them. Watch the footer spans
  // and show each container as soon as a numeric value arrives. Error messages
  // (for example on localhost) stay hidden instead of appearing in the footer.
  var NUMBER = /^[\d.,]+[KkMmBbWwEe]?$/;

  ['site_uv', 'site_pv', 'page_pv'].forEach(function (key) {
    var value = document.getElementById('busuanzi_value_' + key) ||
      document.getElementById('busuanzi_' + key);
    var container = document.getElementById('busuanzi_container_' + key);
    if (!value || !container) return;

    function show() {
      if (NUMBER.test(value.textContent.trim())) container.style.display = 'inline';
    }

    if (window.MutationObserver) {
      new MutationObserver(show).observe(value, {
        childList: true,
        characterData: true,
        subtree: true
      });
    }
    show();
  });
})();
