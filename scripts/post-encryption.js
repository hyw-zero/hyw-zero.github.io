'use strict';

/**
 * Per-post content gate.
 *
 * Add `encryption: true` to a post's front matter. The rendered article is
 * moved into a base64 payload and only decoded in the browser after the
 * visitor enters the same password used by the PDF library (the site-wide
 * visitor count shown in the footer).
 *
 * This is a client-side gate. GitHub Pages cannot enforce real access control,
 * so the payload can still be decoded from the page source, just like the PDF
 * catalog.
 */

const POST_PREFIX = '_posts/';
const LOCKED_EXCERPT = [
  '<div class="post-encrypted-note">',
  '  <i class="fa fa-lock" aria-hidden="true"></i>',
  '  <span>本文已加密，进入文章后输入访问密码即可阅读。</span>',
  '</div>'
].join('\n');

function isEnabled(value) {
  return value === true || value === 'true';
}

hexo.extend.filter.register('after_post_render', function (data) {
  const source = String(data.source || '').replace(/\\/g, '/');
  if (!source.startsWith(POST_PREFIX) || !isEnabled(data.encryption)) return;

  // Never expose the rendered body to list pages or the search index.
  data.excerpt = LOCKED_EXCERPT;
  data.more = '';

  // Reuse the payload on incremental builds where content is already cleared.
  if (!data.content && data.encryptedPayload) return;

  data.encryptedPayload = Buffer.from(data.content || '', 'utf8').toString('base64');
  data.content = '';
});
