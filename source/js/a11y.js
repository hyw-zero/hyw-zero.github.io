/* NEMO · accessibility helpers */
(function () {
  'use strict';

  var toggle = document.querySelector('.sidebar-toggle');
  if (!toggle) return;

  toggle.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    toggle.click();
  });
})();
