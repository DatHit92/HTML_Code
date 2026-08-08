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

  function makeBtn(cls, icon) {
    var b = document.createElement('div');
    b.className = 'bbv-btn ' + cls;
    b.innerHTML = buildIcon(icon);
    return b;
  }

  function makeRange(cls, min, max, val) {
    var r = document.createElement('input');
    r.type = 'range';
    r.className = cls;
    r.min = min; r.max = max; r.value = val;
    return r;
  }

  function readTracks(el) {
    var trackNodes = el.querySelectorAll('[data-src]');
    return Array.prototype.map.call(trackNodes, function (n) {
      return {
        src: n.getAttribute('data-src'),
        title: n.getAttribute('data-title') || '',
        artist: n.getAttribute('data-artist') || '',
        cover: n.getAttribute('data-cover') || '',
        bg: n.getAttribute('data-bg') || ''
      };
    });
  }

  function wireCommon(audio, refs, tracks, applyVisuals) {
    var index = 0;

    function load(i, autoplay) {
      index = (i + tracks.length) % tracks.length;
      var t = tracks[index];
      audio.src = t.src;
      applyVisuals(t);
      if (autoplay) audio.play();
    }

    function setPlaying(playing) {
      refs.el.classList.toggle('bbv-playing', playing);
      refs.playBtn.innerHTML = buildIcon(playing ? 'pause' : 'play');
    }

    refs.playBtn.addEventListener('click', function () {
      if (!audio.src) load(0, false);
      if (audio.paused) { audio.play(); } else { audio.pause(); }
    });
    refs.prevBtn.addEventListener('click', function () { load(index - 1, true); });
    refs.nextBtn.addEventListener('click', function () { load(index + 1, true); });

    audio.addEventListener('play', function () { setPlaying(true); });
    audio.addEventListener('pause', function () { setPlaying(false); });
    audio.addEventListener('ended', function () {
      if (tracks.length > 1) load(index + 1, true); else setPlaying(false);
    });
    audio.addEventListener('timeupdate', function () {
      if (audio.duration) refs.seek.value = (audio.currentTime / audio.duration) * 100;
    });
    refs.seek.addEventListener('input', function () {
      if (audio.duration) audio.currentTime = (refs.seek.value / 100) * audio.duration;
    });
    refs.vol.addEventListener('input', function () {
      audio.volume = refs.vol.value / 100;
    });
    refs.volToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      refs.el.classList.toggle('bbv-vol-open');
    });
    document.addEventListener('click', function (e) {
      if (!refs.el.contains(e.target)) refs.el.classList.remove('bbv-vol-open');
    });

    load(0, false);
  }

  function initFree(el) {
  var playerBox = el.querySelector('.bbv-free-player');
  if (!playerBox) return;

  var tracks = readTracks(playerBox);
  if (!tracks.length) return;

  playerBox.innerHTML = '';
  playerBox.setAttribute('data-count', tracks.length);

  var audio = new Audio();
  audio.preload = 'metadata';

  var prevBtn = makeBtn('bbv-prev', 'prev');
  var playBtn = makeBtn('bbv-play', 'play');
  var nextBtn = makeBtn('bbv-next', 'next');
  var seek = makeRange('bbv-seek', 0, 100, 0);
  var volToggle = document.createElement('div');
  volToggle.className = 'bbv-vol-toggle';
  volToggle.innerHTML = buildIcon('vol');

  var volPanel = document.createElement('div');
  volPanel.className = 'bbv-vol-panel';
  var vol = makeRange('bbv-vol', 0, 100, 80);
  audio.volume = 0.8;
  volPanel.appendChild(vol);

  playerBox.appendChild(prevBtn);
  playerBox.appendChild(playBtn);
  playerBox.appendChild(seek);
  playerBox.appendChild(nextBtn);
  playerBox.appendChild(volToggle);
  playerBox.appendChild(volPanel);

  wireCommon(audio, {
    el: playerBox, playBtn: playBtn, prevBtn: prevBtn, nextBtn: nextBtn,
    seek: seek, vol: vol, volToggle: volToggle
  }, tracks, function () {}); // no visuals tied to tracks — image/text are unlinked
}

  function initSig(el) {
  var tracks = readTracks(el);
  if (!tracks.length) return;

  var w = el.getAttribute('data-width');
  var h = el.getAttribute('data-height');
  var isFree = el.classList.contains('bbv-img-free');

  el.innerHTML = '';
  el.setAttribute('data-count', tracks.length);

  var audio = new Audio();
  audio.preload = 'metadata';

  var imageBox = document.createElement('div');
  imageBox.className = 'bbv-sig-image-box';
  if (!isFree) {
    if (w) imageBox.style.width = /^\d+$/.test(w) ? w + 'px' : w;
    if (h) imageBox.style.height = /^\d+$/.test(h) ? h + 'px' : h;
  } else if (w) {
    imageBox.style.maxWidth = /^\d+$/.test(w) ? w + 'px' : w;
  }

  var img = document.createElement('img');
  img.className = 'bbv-sig-img';
  imageBox.appendChild(img);

  var playerBox = document.createElement('div');
  playerBox.className = 'bbv-sig-player-box';

  var pill = document.createElement('div');
  pill.className = 'bbv-sig-pill';

  var prevBtn = makeBtn('bbv-prev', 'prev');
  var playBtn = makeBtn('bbv-play', 'play');
  var nextBtn = makeBtn('bbv-next', 'next');
  var seek = makeRange('bbv-seek', 0, 100, 0);
  var volToggle = document.createElement('div');
  volToggle.className = 'bbv-vol-toggle';
  volToggle.innerHTML = buildIcon('vol');

  var volPanel = document.createElement('div');
  volPanel.className = 'bbv-vol-panel';
  var vol = makeRange('bbv-vol', 0, 100, 80);
  audio.volume = 0.8;
  volPanel.appendChild(vol);

  pill.appendChild(prevBtn);
  pill.appendChild(playBtn);
  pill.appendChild(seek);
  pill.appendChild(nextBtn);
  pill.appendChild(volToggle);

  playerBox.appendChild(pill);
  playerBox.appendChild(volPanel);

  el.appendChild(imageBox);
  el.appendChild(playerBox);

  pill.addEventListener('click', function (e) {
    if (e.target === pill) pill.classList.toggle('bbv-pill-open');
  });

  function applyVisuals(t) {
    if (t.bg) { img.src = t.bg; img.style.display = 'block'; }
    else { img.removeAttribute('src'); img.style.display = 'none'; }
  }

  wireCommon(audio, {
    el: el, playBtn: playBtn, prevBtn: prevBtn, nextBtn: nextBtn,
    seek: seek, vol: vol, volToggle: volToggle
  }, tracks, applyVisuals);
}

  function initStandard(el) {
    var tracks = readTracks(el);
    if (!tracks.length) return;

    el.innerHTML = '';
    el.setAttribute('data-count', tracks.length);

    var audio = new Audio();
    audio.preload = 'metadata';

    var bg = document.createElement('div');
    bg.className = 'bbv-bg';

    var shade = document.createElement('div');
    shade.className = 'bbv-shade';

    var disc = document.createElement('div');
    disc.className = 'bbv-disc';
    var coverImg = document.createElement('img');
    coverImg.className = 'bbv-disc-img';
    disc.appendChild(coverImg);

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

    var prevBtn = makeBtn('bbv-prev', 'prev');
    var playBtn = makeBtn('bbv-play', 'play');
    var nextBtn = makeBtn('bbv-next', 'next');
    var seek = makeRange('bbv-seek', 0, 100, 0);
    var volToggle = document.createElement('div');
    volToggle.className = 'bbv-vol-toggle';
    volToggle.innerHTML = buildIcon('vol');

    var volPanel = document.createElement('div');
    volPanel.className = 'bbv-vol-panel';
    var vol = makeRange('bbv-vol', 0, 100, 80);
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
    el.appendChild(shade);
    el.appendChild(disc);
    el.appendChild(main);
    el.appendChild(volPanel);

    function applyVisuals(t) {
      titleEl.textContent = t.title;
      artistEl.textContent = t.artist;

      if (t.cover) { coverImg.src = t.cover; disc.classList.add('bbv-has-cover'); }
      else { coverImg.removeAttribute('src'); disc.classList.remove('bbv-has-cover'); }

      if (t.bg) { el.style.setProperty('--bbv-bg', 'url(' + t.bg + ')'); el.classList.add('bbv-has-bg'); }
      else { el.style.removeProperty('--bbv-bg'); el.classList.remove('bbv-has-bg'); }
    }

    wireCommon(audio, {
      el: el, playBtn: playBtn, prevBtn: prevBtn, nextBtn: nextBtn,
      seek: seek, vol: vol, volToggle: volToggle
    }, tracks, applyVisuals);
  }

  document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.bbv-player').forEach(function (el) {
    if (el.classList.contains('bbv-sig')) initSig(el);
    else if (el.classList.contains('bbv-free')) initFree(el);
    else initStandard(el);
  });
});

})();
