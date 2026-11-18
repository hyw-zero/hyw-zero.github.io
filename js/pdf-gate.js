/* NEMO · client-side content gate
 *
 * Shared by the private PDF shelf and encrypted posts. The password is set in
 * `_config.yml` (`content_gate.password`) and only its SHA-256 hash is present
 * in the page. GitHub Pages cannot enforce server-side access control, so
 * protected content remains decodable from the page source.
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

  var passwordHash = String(gate.getAttribute('data-password-hash') || '').toLowerCase();
  var submitButton = form.querySelector('button[type="submit"]');
  var checking = false;

  function normalize(value) {
    return String(value || '').replace(/[^\d]/g, '');
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
    payloadEl.remove();
  }

  function sha256(text) {
    if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) {
      return Promise.reject(new Error('SHA-256 is unavailable'));
    }
    var data = new TextEncoder().encode(text);
    return window.crypto.subtle.digest('SHA-256', data).then(function (buffer) {
      return Array.prototype.map.call(new Uint8Array(buffer), function (byte) {
        return ('0' + byte.toString(16)).slice(-2);
      }).join('');
    });
  }

  input.addEventListener('input', function () {
    var digits = this.value.replace(/\D/g, '').slice(0, 12);
    if (digits !== this.value) this.value = digits;
    if (errorEl && errorEl.textContent) setError('');
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (checking) return;

    var value = normalize(input.value);
    if (!value) {
      setError('请输入密码。');
      input.focus();
      return;
    }

    if (!passwordHash) {
      setError('门禁未配置，请联系站长。');
      return;
    }

    setError('');
    checking = true;
    if (submitButton) submitButton.disabled = true;

    sha256(value).then(function (hash) {
      if (hash === passwordHash) {
        unlock();
      } else {
        setError('密码不对，请重试。');
        input.select();
      }
    }).catch(function () {
      setError('当前浏览器无法完成校验，请更换浏览器。');
    }).then(function () {
      checking = false;
      if (submitButton) submitButton.disabled = false;
    });
  });

  if (passwordHash) {
    setStatus('ready', '已就绪');
  } else {
    setStatus('error', '未配置');
  }
})();
