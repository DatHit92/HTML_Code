(function () {

  function buildIcon(name) {
    var icons = {
      play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
      pause: '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
      prev: '<svg viewBox="0 0 24 24"><path d="M6 6h2v12H6zM20 6L10 12l10 6z"/></svg>',
      next: '<svg viewBox="0 0 24 24"><path d="M16 6h2v12h-2zM4 6l10 6-10 6z"/></svg>',
      vol: '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 5V4L8 9H4zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>'
    };
    return icons[name] || '';
  }

  function initPlayer(el) {
    var trackNodes = el.querySelectorAll('[data-src]');
    var tracks = Array.prototype.map.call(trackNodes, function (n) {
      return {
        src: n.getAttribute('data-src'),
        title: n.getAttribute('data-title') || '',
        artist: n.getAttribute('data-artist') || '',
        cover: n.getAttribute('data-cover') || '',
        bg: n.getAttribute('data-bg') || ''
      };
    });
    if (!tracks.length) return;

    el.innerHTML = '';
    el.setAttribute('data-count', tracks.length);

    var audio = new Audio();
    audio.preload = 'metadata';
    var index = 0;

    var bg = document.createElement('div');
    bg.className = 'bbv-bg';

    var disc = document.createElement('div');
    disc.className = 'bbv-disc';

    var main = document.createElement('div');
    main.className = 'bbv-main';

    var info = document.createElement('div');
    info.className = 'bbv-info';

    var titleEl = document.createElement('div');
    titleEl.className = 'bbv-title';

    var artistEl = document.createElement('div');
    artistEl.className = 'bbv-artist';

    info.appendChild(titleEl);
    info.appendChild(artistEl);

    var body = document.createElement('div');
    body.className = 'bbv-body';

    var buttons = document.createElement('div');
    buttons.className = 'bbv-buttons';

    var prevBtn = document.createElement('div');
    prevBtn.className = 'bbv-btn bbv-prev';
    prevBtn.innerHTML = buildIcon('prev');

    var playBtn = document.createElement('div');
    playBtn.className = 'bbv-btn bbv-play';
    playBtn.innerHTML = buildIcon('play');

    var nextBtn = document.createElement('div');
    nextBtn.className = 'bbv-btn bbv-next';
    nextBtn.innerHTML = buildIcon('next');

    var seek = document.createElement('input');
    seek.type = 'range';
    seek.className = 'bbv-seek';
    seek.min = 0; seek.max = 100; seek.value = 0;

    var volToggle = document.createElement('div');
    volToggle.className = 'bbv-vol-toggle';
    volToggle.innerHTML = buildIcon('vol');

    var volPanel = document.createElement('div');
    volPanel.className = 'bbv-vol-panel';

    var vol = document.createElement('input');
    vol.type = 'range';
    vol.className = 'bbv-vol';
    vol.min = 0; vol.max = 100; vol.value = 80;
    audio.volume = 0.8;

    volPanel.appendChild(vol);
    buttons.appendChild(prevBtn);
    buttons.appendChild(playBtn);
    buttons.appendChild(nextBtn);
    buttons.appendChild(volToggle);
    body.appendChild(buttons);
    body.appendChild(seek);

    main.appendChild(info);
    main.appendChild(body);

    el.appendChild(bg);
    el.appendChild(disc);
    el.appendChild(main);
    el.appendChild(volPanel);

    function applyTrackVisuals(t) {
      titleEl.textContent = t.title;
      artistEl.textContent = t.artist;

      if (t.cover) {
        disc.style.backgroundImage = 'url(' + t.cover + ')';
        disc.classList.add('bbv-has-cover');
      } else {
        disc.style.backgroundImage = '';
        disc.classList.remove('bbv-has-cover');
      }

      if (t.bg) {
        el.style.setProperty('--bbv-bg', 'url(' + t.bg + ')');
        el.classList.add('bbv-has-bg');
      } else {
        el.style.removeProperty('--bbv-bg');
        el.classList.remove('bbv-has-bg');
      }
    }

    function load(i, autoplay) {
      index = (i + tracks.length) % tracks.length;
      var t = tracks[index];
      audio.src = t.src;
      applyTrackVisuals(t);
      if (autoplay) audio.play();
    }

    function setPlaying(playing) {
      el.classList.toggle('bbv-playing', playing);
      playBtn.innerHTML = buildIcon(playing ? 'pause' : 'play');
    }

    playBtn.addEventListener('click', function () {
      if (!audio.src) load(0, false);
      if (audio.paused) { audio.play(); } else { audio.pause(); }
    });

    prevBtn.addEventListener('click', function () { load(index - 1, true); });
    nextBtn.addEventListener('click', function () { load(index + 1, true); });

    audio.addEventListener('play', function () { setPlaying(true); });
    audio.addEventListener('pause', function () { setPlaying(false); });
    audio.addEventListener('ended', function () {
      if (tracks.length > 1) load(index + 1, true); else setPlaying(false);
    });

    audio.addEventListener('timeupdate', function () {
      if (audio.duration) seek.value = (audio.currentTime / audio.duration) * 100;
    });

    seek.addEventListener('input', function () {
      if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
    });

    vol.addEventListener('input', function () {
      audio.volume = vol.value / 100;
    });

    volToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      el.classList.toggle('bbv-vol-open');
    });

    document.addEventListener('click', function (e) {
      if (!el.contains(e.target)) el.classList.remove('bbv-vol-open');
    });

    load(0, false);
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bbv-player').forEach(initPlayer);
  });

})();
