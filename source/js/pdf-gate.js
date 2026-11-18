/* NEMO · client-side content gate
 *
 * Shared by the private PDF shelf and encrypted posts. The password is the
 * site's current total page views shown in the footer (Busuanzi site PV), so
 * it follows the same counter as the visit statistics. GitHub Pages cannot
 * enforce server-side access control, so protected content remains decodable
 * from the page source.
 */
(function () {
  'use strict';

  var gate = document.querySelector('[data-pdf-gate], [data-post-gate]');
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
  var pvDeadline = Date.now() + 20000;

  function normalize(value) {
    return String(value || '')
      .replace(/[^\d]/g, '')
      .replace(/^0+(?=\d)/, '');
  }

  function readSitePv() {
    var el = document.getElementById('busuanzi_site_pv');
    if (!el) return '';

    var raw = el.textContent.trim();
    if (!/^[\d,]+$/.test(raw)) return '';
    return normalize(raw);
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

  function markReady(value) {
    sitePv = value;
    setStatus('ready', '已就绪');
  }

  function watchPv() {
    var value = readSitePv();
    if (value) {
      markReady(value);
      return;
    }

    if (Date.now() >= pvDeadline) {
      setStatus('error', '暂时无法解锁');
      return;
    }

    window.setTimeout(watchPv, 300);
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
      setError('内容读取失败，请稍后再试。');
      return;
    }

    content.hidden = false;
    gate.classList.add('is-unlocked');
    if (lock) lock.setAttribute('aria-hidden', 'true');
    input.value = '';
    payloadEl.remove();
  }

  input.addEventListener('input', function () {
    var digits = this.value.replace(/\D/g, '').slice(0, 12);
    if (digits !== this.value) this.value = digits;
    if (errorEl && errorEl.textContent) setError('');
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var current = readSitePv();
    if (current) sitePv = current;

    if (!sitePv) {
      setError('请稍后再试。');
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

  watchPv();
})();
