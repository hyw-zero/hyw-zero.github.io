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
  var pvStarted = Date.now();
  var pvAttempts = 0;
  var pvLoading = false;
  var MAX_ATTEMPTS = 8;

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

  function applyPv(value) {
    var pv = normalize(value);
    if (!pv) return false;
    if (sitePv) return true;

    sitePv = pv;

    // If the Busuanzi script failed but the API fallback worked, keep the
    // footer consistent with the number the gate is now using.
    var el = document.getElementById('busuanzi_value_site_pv');
    if (el && !normalize(el.textContent)) el.textContent = pv;
    var container = document.getElementById('busuanzi_container_site_pv');
    if (container) container.style.display = 'inline';

    setStatus('ready', '已就绪');
    return true;
  }

  // Busuanzi occasionally drops its JSONP request on rapid refreshes. Retry
  // the same public endpoint directly before giving up, instead of asking
  // the visitor to refresh the whole page.
  function requestPv() {
    if (sitePv || pvLoading || pvAttempts >= MAX_ATTEMPTS) return;

    pvLoading = true;
    pvAttempts += 1;

    var callback = 'nemoPv' + Date.now().toString(36) + pvAttempts;
    var script = document.createElement('script');
    var settled = false;
    var timer = window.setTimeout(function () {
      finish();
    }, 6000);

    function cleanup() {
      window.clearTimeout(timer);
      try {
        delete window[callback];
      } catch (err) {
        window[callback] = undefined;
      }
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    function finish() {
      if (settled) return;
      settled = true;
      pvLoading = false;
      cleanup();

      if (sitePv) return;

      if (pvAttempts >= MAX_ATTEMPTS) {
        setStatus('loading', '暂时无法连接，请稍后再试');
        return;
      }

      window.setTimeout(requestPv, Math.min(1000 + pvAttempts * 1000, 5000));
    }

    window[callback] = function (data) {
      if (data && applyPv(data.site_pv)) {
        settled = true;
        pvLoading = false;
        cleanup();
        return;
      }
      finish();
    };

    script.src = 'https://busuanzi.ibruce.info/busuanzi?jsonpCallback=' + encodeURIComponent(callback) + '&t=' + Date.now();
    script.async = true;
    script.onerror = finish;
    document.head.appendChild(script);
  }

  function watchPv() {
    if (sitePv) return;
    if (applyPv(readSitePv())) return;

    var elapsed = Date.now() - pvStarted;
    if (elapsed >= 2500 && pvAttempts === 0) requestPv();

    if (pvAttempts >= MAX_ATTEMPTS && !pvLoading) {
      setStatus('loading', '暂时无法连接，请稍后再试');
    } else if (elapsed >= 2500) {
      setStatus('loading', '正在读取访问统计…');
    } else {
      setStatus('loading', '正在准备…');
    }

    window.setTimeout(watchPv, 400);
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
      setError('目录读取失败，请稍后再试。');
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
      setError('正在读取访问统计，请稍候再试。');
      if (pvAttempts === 0 && !pvLoading) requestPv();
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

  if (statusEl) {
    statusEl.addEventListener('click', function () {
      if (sitePv) return;
      pvAttempts = 0;
      pvStarted = Date.now();
      setStatus('loading', '正在准备…');
      requestPv();
    });
  }

  watchPv();
})();
