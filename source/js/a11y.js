/* NEMO · accessibility helpers */
(function () {
  'use strict';

  // The back-to-top control also shows a reading percentage, so fold that
  // visible number into its accessible name instead of hiding it.
  var backTop = document.querySelector('.back-to-top');
  if (backTop) {
    var progress = backTop.querySelector('span');
    if (progress) {
      var syncProgress = function () {
        var text = progress.textContent.trim();
        backTop.setAttribute('aria-label', text ? '返回顶部，阅读进度 ' + text : '返回顶部');
      };
      syncProgress();
      if (window.MutationObserver) {
        new MutationObserver(syncProgress).observe(progress, {
          childList: true,
          characterData: true,
          subtree: true
        });
      }
    }
  }

  var toggle = document.querySelector('.sidebar-toggle');
  if (!toggle) return;

  toggle.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggle.click();
  });
})();
