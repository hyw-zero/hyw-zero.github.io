'use strict';

const crypto = require('crypto');

function getPassword(hexo) {
  const raw = (hexo.config && hexo.config.content_gate) || {};
  return String(raw.password || '').trim();
}

function hashPassword(hexo) {
  const password = getPassword(hexo);
  if (!password) return '';
  return crypto.createHash('sha256').update(password, 'utf8').digest('hex');
}

module.exports = { getPassword, hashPassword };
