'use strict';

// busuanzi.cc fills `busuanzi_site_pv`-style elements, while NexT renders
// `busuanzi_value_site_pv`. Rename the rendered IDs so the official script can
// fill them without patching the theme.
//
// The theme also injects the script with `async`. On long pages the API can
// answer before the footer exists, so no element is ever filled. Defer it
// until the document is parsed and the counters are in the DOM.
hexo.extend.filter.register('after_render:html', function (str) {
  return str
    .replace(/id="busuanzi_value_(site_uv|site_pv|page_pv)"/g, 'id="busuanzi_$1"')
    .replace(/<script async src="(https:\/\/cdn\.busuanzi\.cc\/[^"]+)"><\/script>/g, '<script defer src="$1"></script>');
});
