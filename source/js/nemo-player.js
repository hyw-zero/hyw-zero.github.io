/* NEMO FM — APlayer + Meting playlist with API fallback */
(function () {
  'use strict';

  var mount = document.getElementById('nemo-player');
  var statusEl = document.getElementById('nemo-music-status');
  var musicEl = document.getElementById('sidebar-music');
  if (!mount || !statusEl || !musicEl) return;

  var PLAYLIST = {
    server: 'netease',
    id: '2392709157' // 轻音乐：解压 / 放松 / 学习 / 助眠
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

  function setStatus(text, isError) {
    statusEl.textContent = text;
    statusEl.classList.toggle('is-error', !!isError);
    statusEl.setAttribute('title', isError ? '点击重新加载' : text);
    statusEl.onclick = isError ? function () {
      load();
    } : null;
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

  function labelControls() {
    var labels = {
      back: '上一首',
      play: '播放或暂停',
      forward: '下一首',
      order: '切换播放顺序',
      loop: '切换循环模式',
      menu: '播放列表',
      'volume-down': '静音',
      'volume-up': '取消静音',
      lrc: '歌词'
    };

    Object.keys(labels).forEach(function (name) {
      var button = mount.querySelector('.aplayer-icon-' + name);
      if (!button) return;
      button.setAttribute('aria-label', labels[name]);
      button.setAttribute('title', labels[name]);
    });

    var mini = mount.querySelector('.aplayer-miniswitcher .aplayer-icon');
    if (mini) {
      mini.setAttribute('aria-label', '展开或收起播放器');
      mini.setAttribute('title', '展开或收起播放器');
    }
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
    syncListHeight();
    labelControls();

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
      labelControls();
    });

    player.on('volumechange', labelControls);

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
        if (!Array.isArray(data) || !data.length) throw new Error('empty playlist');

        var tracks = normalize(data);
        if (!tracks.length) throw new Error('no playable tracks');
        return tracks;
      })
      .finally(function () {
        if (timer) window.clearTimeout(timer);
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

  // Keep the player at the bottom of the sticky sidebar. The playlist drops
  // down from the card; its height is clamped to the space below the card so
  // it stays reachable on short screens.
  var sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.appendChild(musicEl);

  function syncListHeight() {
    var rect = musicEl.getBoundingClientRect();
    var space = Math.round(window.innerHeight - rect.bottom - 20);

    // On the mobile drawer the close button sits at the bottom-left; stop
    // the list just above it so the button stays usable.
    var toggle = document.querySelector('.sidebar-toggle');
    if (toggle) {
      var toggleRect = toggle.getBoundingClientRect();
      if (toggleRect.width && toggleRect.height && toggleRect.top > rect.bottom) {
        space = Math.min(space, Math.round(toggleRect.top - rect.bottom - 12));
      }
    }

    space = Math.max(80, Math.min(220, space));

    // APlayer writes listMaxHeight inline, so keep both the container and the
    // inner list in sync with the actual space below the card.
    var list = mount.querySelector('.aplayer-list');
    if (list) list.style.maxHeight = space + 'px';
    var ol = mount.querySelector('.aplayer-list ol');
    if (ol) ol.style.maxHeight = Math.max(0, space - 2) + 'px';
  }

  function listIsOpen() {
    var list = mount.querySelector('.aplayer-list');
    return !!(list && !list.classList.contains('aplayer-list-hide'));
  }

  window.addEventListener('resize', syncListHeight);
  window.addEventListener('scroll', function () {
    if (listIsOpen()) syncListHeight();
  }, { passive: true });

  mount.addEventListener('click', function (event) {
    var target = event.target;
    if (target && target.closest && target.closest('.aplayer-icon-menu')) syncListHeight();
  }, true);

  function closePlaylist() {
    var list = mount.querySelector('.aplayer-list');
    if (!list || list.classList.contains('aplayer-list-hide')) return;

    var menu = mount.querySelector('.aplayer-icon-menu');
    if (menu) menu.click();
  }

  document.addEventListener('click', function (event) {
    if (!musicEl.contains(event.target)) closePlaylist();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closePlaylist();
  });

  function scheduleLoad() {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(load, { timeout: 1800 });
    } else {
      window.setTimeout(load, 1000);
    }
  }

  scheduleLoad();
})();
