'use strict';

// NexT renders the sidebar toggle as an icon-only <div role="button">. Give it
// an accessible name and make it reachable with the keyboard.
hexo.extend.filter.register('after_render:html', function (str) {
  return str.replace(
    /<div class="toggle sidebar-toggle" role="button">/g,
    '<div class="toggle sidebar-toggle" role="button" tabindex="0" aria-label="切换侧栏">'
  );
});
