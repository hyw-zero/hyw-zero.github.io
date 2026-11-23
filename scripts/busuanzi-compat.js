'use strict';

// The classic Busuanzi script keeps NexT's `busuanzi_value_*` element IDs, so
// no ID rewriting is needed. The theme injects the counter with `async`; on long
// pages the API can answer before the footer exists, so no element is ever
// filled. Defer it until the document is parsed and the counters are in the DOM.
hexo.extend.filter.register('after_render:html', function (str) {
  return str.replace(
    /<script async src="(https:\/\/[^"]*busuanzi[^"]*\.js)"><\/script>/g,
    '<script defer src="$1"></script>'
  );
});
