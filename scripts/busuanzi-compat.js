'use strict';

// busuanzi.cc fills `busuanzi_site_pv`-style elements, while NexT renders
// `busuanzi_value_site_pv`. Rename the rendered IDs so the official script can
// fill them without patching the theme.
hexo.extend.filter.register('after_render:html', function (str) {
  return str.replace(/id="busuanzi_value_(site_uv|site_pv|page_pv)"/g, 'id="busuanzi_$1"');
});
