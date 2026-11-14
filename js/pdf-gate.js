/* NEMO · PDF library access gate
 *
 * Client-side gate for the private PDF shelf. The catalog is decoded only
 * after the password check succeeds. GitHub Pages cannot enforce server-side
 * access control, so the PDF files remain directly reachable by URL.
 */
(function () {
  'use strict';

  var gate = document.querySelector('[data-pdf-gate]');
  if (!gate) return;

  var form = gate.querySelector('.pdf-gate-form');
  var input = gate.querySelector('.pdf-gate-input');
  var errorEl = gate.querySelector('.pdf-gate-error');
  var statusEl = gate.querySelector('.pdf-gate-status');
  var statusText = gate.querySelector('.pdf-gate-status-text');
  var content = gate.querySelector('.pdf-gate-content');
  var payloadEl = gate.querySelector('.pdf-gate-payload');
  var lock = gate.querySelector('.pdf-gate-lock');
  if (!form || !input || !content || !payloadEl) return;

  var sitePv = '';
  var deadline = Date.now() + 15000;

  function normalize(value) {
    return String(value || '')
      .replace(/[^\d]/g, '')
      .replace(/^0+(?=\d)/, '');
  }

  function readSitePv() {
    var el = document.getElementById('busuanzi_value_site_pv');
    return el ? normalize(el.textContent) : '';
  }

  function setStatus(state, text) {
    if (!statusEl) return;
    statusEl.setAttribute('data-state', state);
    if (statusText) statusText.textContent = text;
  }

  function setError(message) {
    if (errorEl) errorEl.textContent = message || '';
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function waitForPv() {
    sitePv = readSitePv();
    if (sitePv) {
      setStatus('ready', '已就绪');
      return;
    }
    if (Date.now() >= deadline) {
      setStatus('error', '暂时无法解锁，请刷新页面重试');
      return;
    }
    setStatus('loading', '正在准备…');
    window.setTimeout(waitForPv, 300);
  }

  function decodePayload(text) {
    var binary = window.atob(text);
    if (window.TextDecoder) {
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new TextDecoder('utf-8').decode(bytes);
    }
    return decodeURIComponent(escape(binary));
  }

  function unlock() {
    try {
      content.innerHTML = decodePayload(payloadEl.textContent.trim());
    } catch (err) {
      setError('目录读取失败，请刷新页面后重试。');
      return;
    }

    content.hidden = false;
    gate.classList.add('is-unlocked');
    if (lock) lock.setAttribute('aria-hidden', 'true');
    payloadEl.remove();
  }

  input.addEventListener('input', function () {
    var digits = this.value.replace(/\D/g, '').slice(0, 12);
    if (digits !== this.value) this.value = digits;
    if (errorEl && errorEl.textContent) setError('');
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!sitePv) sitePv = readSitePv();
    if (!sitePv) {
      setError('暂时无法验证，请稍后再试。');
      if (Date.now() >= deadline) {
        setStatus('error', '暂时无法解锁，请刷新页面重试');
      }
      return;
    }

    var value = normalize(input.value);
    if (!value) {
      setError('请输入密码。');
      input.focus();
      return;
    }

    if (value === sitePv) {
      setError('');
      unlock();
    } else {
      setError('密码不对，请重试。');
      input.select();
    }
  });

  waitForPv();
})();
