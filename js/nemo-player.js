/* NEMO FM — APlayer + Meting playlist with API fallback */
(function () {
  'use strict';

  var mount = document.getElementById('nemo-player');
  var statusEl = document.getElementById('nemo-music-status');
  var musicEl = document.getElementById('sidebar-music');
  if (!mount || !statusEl || !musicEl) return;

  var PLAYLIST = {
    server: 'netease',
    id: '2392709157', // 轻音乐：解压 / 放松 / 学习 / 助眠
    label: '轻音乐'
  };

  // Ordered by playback reliability. The first source that returns a
  // non-empty playlist wins; later sources are only used on failure.
  var SOURCES = [
    'https://api.injahow.cn/meting/',
    'https://api.qijieya.cn/meting/',
    'https://api.i-meto.com/meting/api'
  ];

  var player = null;
  var loading = false;
  var retryHandler = null;

  function setStatus(text, isError) {
    statusEl.textContent = text;
    statusEl.classList.toggle('is-error', !!isError);
    statusEl.setAttribute('title', isError ? '点击重新加载' : text);

    if (retryHandler) {
      statusEl.removeEventListener('click', retryHandler);
      retryHandler = null;
    }

    if (isError) {
      retryHandler = function () {
        load();
      };
      statusEl.addEventListener('click', retryHandler);
    }
  }

  function normalize(items) {
    var seen = {};

    return items.map(function (item) {
      var url = item && (item.url || '');
      var name = item && (item.name || item.title || '');
      var artist = item && (item.artist || item.author || '');

      name = String(name).trim();
      artist = String(artist).trim();

      if (!url || !name) return null;

      var key = name + '|' + artist;
      if (seen[key]) return null;
      seen[key] = true;

      return {
        name: name,
        artist: artist || 'NEMO FM',
        url: url,
        cover: item.pic || item.cover || ''
      };
    }).filter(Boolean);
  }

  function showLoading() {
    mount.innerHTML = '<div class="nemo-player-loading">正在连接音乐源…</div>';
  }

  function fail() {
    if (player) {
      try {
        player.destroy();
      } catch (e) {}
      player = null;
    }

    mount.innerHTML = '<div class="nemo-player-loading is-error">音乐源暂时不可用，点击右上角「重试」</div>';
    setStatus('重试', true);
    loading = false;
  }

  function init(tracks) {
    if (!window.APlayer) {
      fail();
      return;
    }

    mount.innerHTML = '';

    try {
      player = new window.APlayer({
        container: mount,
        audio: tracks,
        listFolded: true,
        listMaxHeight: '220px',
        theme: '#f59e0b',
        preload: 'metadata',
        volume: 0.6,
        order: 'random',
        loop: 'all',
        storageName: 'nemo-fm',
        lrcType: 0
      });
    } catch (e) {
      fail();
      return;
    }

    // APlayer 1.10 only applies `listFolded` in fixed mode. Fold the
    // playlist explicitly so the sidebar card stays compact by default.
    var list = mount.querySelector('.aplayer-list');
    if (list) list.classList.add('aplayer-list-hide');

    var errors = 0;

    // Some NetEase tracks become unavailable without warning. Skip them
    // automatically instead of leaving the player stuck on an error.
    player.on('error', function () {
      errors += 1;
      if (errors <= 3) {
        window.setTimeout(function () {
          try {
            player.skipForward();
          } catch (e) {}
        }, 600);
      }
    });

    player.on('play', function () {
      errors = 0;
    });

    setStatus(tracks.length + ' 首 · 在线', false);
    loading = false;
  }

  function requestPlaylist(base) {
    var url = base + '?server=' + encodeURIComponent(PLAYLIST.server) +
      '&type=playlist&id=' + encodeURIComponent(PLAYLIST.id);

    var controller = typeof window.AbortController !== 'undefined' ? new window.AbortController() : null;
    var timer = controller ? window.setTimeout(function () {
      controller.abort();
    }, 9000) : null;

    return window.fetch(url, controller ? { signal: controller.signal } : undefined)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(function (data) {
        if (timer) window.clearTimeout(timer);
        if (!Array.isArray(data) || !data.length) throw new Error('empty playlist');

        var tracks = normalize(data);
        if (!tracks.length) throw new Error('no playable tracks');
        return tracks;
      })
      .catch(function (error) {
        if (timer) window.clearTimeout(timer);
        throw error;
      });
  }

  function load() {
    if (loading) return;
    loading = true;
    setStatus('连接中', false);
    showLoading();

    var index = 0;

    function next() {
      if (index >= SOURCES.length) {
        fail();
        return;
      }

      requestPlaylist(SOURCES[index++]).then(init).catch(next);
    }

    next();
  }

  // The sidebar is a flex column; keeping the player outside .sidebar-inner
  // makes it stay visible while the widgets/TOC scroll.
  var sidebar = document.querySelector('.sidebar');
  if (sidebar && musicEl.parentNode !== sidebar) {
    sidebar.appendChild(musicEl);
  }

  load();
})();
