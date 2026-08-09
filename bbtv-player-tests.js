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

  var wantsBeat = el.hasAttribute('data-beat');
  var audio = new Audio();
  if (wantsBeat) audio.crossOrigin = 'anonymous';
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
  if (wantsBeat) attachBeatSync(el, audio);
}

  function initLegacy(el) {
  var bar = el.querySelector('.bbv-legacy-bar');
  if (!bar) return;

  var tracks = readTracks(bar);
  if (!tracks.length) return;

  bar.innerHTML = '';
  bar.setAttribute('data-count', tracks.length);

  var wantsBeat = el.hasAttribute('data-beat');
  var audio = new Audio();
  if (wantsBeat) audio.crossOrigin = 'anonymous';
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

  bar.appendChild(prevBtn);
  bar.appendChild(playBtn);
  bar.appendChild(seek);
  bar.appendChild(nextBtn);
  bar.appendChild(volToggle);
  bar.appendChild(volPanel);

  wireCommon(audio, {
    el: bar, playBtn: playBtn, prevBtn: prevBtn, nextBtn: nextBtn,
    seek: seek, vol: vol, volToggle: volToggle
  }, tracks, function () {});
  if (wantsBeat) attachBeatSync(el, audio);
}

  function initSig(el) {
  var tracks = readTracks(el);
  if (!tracks.length) return;

  var w = el.getAttribute('data-width');
  var h = el.getAttribute('data-height');
  var isFree = el.classList.contains('bbv-img-free');
  var wantsBeat = el.hasAttribute('data-beat');
  var beatVariant = el.getAttribute('data-beat') || 'bbv-fx-beat';

  el.innerHTML = '';
  el.setAttribute('data-count', tracks.length);

  var audio = new Audio();
  if (wantsBeat) audio.crossOrigin = 'anonymous';
  audio.preload = 'metadata';

  var imageBox = document.createElement('div');
  imageBox.className = 'bbv-sig-image-box';
  if (wantsBeat) imageBox.classList.add('bbv-fx-beat');
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
  if (wantsBeat) attachBeatSync(el, audio);
}

  function initStandard(el) {
  var tracks = readTracks(el);
  if (!tracks.length) return;

  var wantsBeat = el.hasAttribute('data-beat');
  var beatVariant = el.getAttribute('data-beat') || 'bbv-fx-beat';

  el.innerHTML = '';
  el.setAttribute('data-count', tracks.length);

  var audio = new Audio();
  if (wantsBeat) audio.crossOrigin = 'anonymous';
  audio.preload = 'metadata';

  var bg = document.createElement('div');
  bg.className = 'bbv-bg';

  var shade = document.createElement('div');
  shade.className = 'bbv-shade';

  var disc = document.createElement('div');
  disc.className = 'bbv-disc';
  if (wantsBeat) disc.classList.add('bbv-fx-beat');
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
  if (wantsBeat) attachBeatSync(el, audio);
}

  function attachBeatSync(root, audio) {
  var glowTargets = root.querySelectorAll('.bbv-fx-beat, .bbv-fx-beat-ring, .bbv-fx-beat-flash, .bbv-fx-beat-scale, .bbv-fx-beat-chroma, .bbv-fx-beat-combo');
  var waveContainers = root.querySelectorAll('.bbv-waves');
  if (!glowTargets.length && !waveContainers.length) return;

  var sensLevel = root.getAttribute('data-beat-sens') || 'mid';
  var sensMap = {
    low:  { mult: 1.9, floor: 35 },
    mid:  { mult: 1.5, floor: 20 },
    high: { mult: 1.25, floor: 10 }
  };
  var sens = sensMap[sensLevel] || sensMap.mid;
  var intensityMult = parseFloat(root.getAttribute('data-beat-intensity')) || 1;

  var ctx, analyser, data, prevData;
  var raf = null;
  var beatVal = 0;
  var lastBeat = 0;
  var fluxHistory = [];

  // build bars for each .bbv-waves container
  var waveSets = Array.prototype.map.call(waveContainers, function (container) {
    var count = parseInt(container.getAttribute('data-bars'), 10) || 24;
    container.innerHTML = '';
    var bars = [];
    for (var i = 0; i < count; i++) {
      var bar = document.createElement('div');
      bar.className = 'bbv-wave-bar';
      container.appendChild(bar);
      bars.push(bar);
    }
    return { container: container, bars: bars, mirrored: container.classList.contains('bbv-waves-mirror') };
  });

  function ensureContext() {
    if (ctx) return true;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      var source = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      data = new Uint8Array(analyser.frequencyBinCount);
      prevData = new Uint8Array(analyser.frequencyBinCount);
      source.connect(analyser);
      analyser.connect(ctx.destination);
      return true;
    } catch (e) {
      return false;
    }
  }

  function updateWaves() {
    waveSets.forEach(function (set) {
      var barCount = set.bars.length;
      var chunk = data.length / barCount;
      for (var i = 0; i < barCount; i++) {
        var sum = 0, n = 0;
        for (var j = Math.floor(i * chunk); j < Math.floor((i + 1) * chunk); j++) {
          sum += data[j]; n++;
        }
        var val = n ? sum / n : 0;
        var pct = Math.max(4, (val / 255) * 100);
        set.bars[i].style.height = pct + '%';
      }
    });
  }

  function tick() {
    analyser.getByteFrequencyData(data);

    if (glowTargets.length) {
      var flux = 0;
      for (var i = 0; i < data.length; i++) {
        var diff = data[i] - prevData[i];
        if (diff > 0) flux += diff;
      }

      fluxHistory.push(flux);
      if (fluxHistory.length > 43) fluxHistory.shift();
      var avgFlux = fluxHistory.reduce(function (a, b) { return a + b; }, 0) / fluxHistory.length;

      var now = performance.now();
      var threshold = avgFlux * sens.mult;

      if (flux > threshold && flux > sens.floor && now - lastBeat > 180) {
        var range = avgFlux * 1.5 || 1;
        var intensity = (flux - threshold) / range;
        beatVal = Math.min(1, Math.max(0.35, intensity * intensityMult));
        lastBeat = now;
      } else {
        beatVal *= 0.88;
      }

      glowTargets.forEach(function (t) {
        t.style.setProperty('--bbv-beat', beatVal.toFixed(3));
      });
    }

    prevData.set(data);

    if (waveSets.length) updateWaves();

    raf = requestAnimationFrame(tick);
  }

  audio.addEventListener('play', function () {
    if (!ctx && !ensureContext()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (!raf) raf = requestAnimationFrame(tick);
  });

  audio.addEventListener('pause', function () {
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    glowTargets.forEach(function (t) { t.style.setProperty('--bbv-beat', 0); });
    waveSets.forEach(function (set) {
      set.bars.forEach(function (b) { b.style.height = '8%'; });
    });
  });
}

})();
