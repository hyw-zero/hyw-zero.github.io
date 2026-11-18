'use strict';

const { getPassword, hashPassword } = require('./lib/gate');

hexo.extend.helper.register('gate_password_hash', function () {
  return hashPassword(hexo);
});

hexo.extend.filter.register('after_generate', function () {
  if (!getPassword(hexo)) {
    hexo.log.warn('Content gate: `content_gate.password` is empty; encrypted pages cannot be unlocked.');
  }
});
