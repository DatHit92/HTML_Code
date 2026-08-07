(function () {
  'use strict';

  function buildIcon(name) {
    var icons = {
      play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
      pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>',
      prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h2v12H6zM20 6L10 12l10 6z"/></svg>',
      next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 6h2v12h-2zM4 6l10 6-10 6z"/></svg>',
      vol: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 5V4L8 9H4zm11.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>'
    };

    return icons[name] || '';
  }


  function initPlayer(el) {

    var trackNodes = el.querySelectorAll('[data-src]');

    var tracks = Array.prototype.map.call(trackNodes, function (node) {

      return {
        src: node.getAttribute('data-src') || '',
        title: node.getAttribute('data-title') || '',
        artist: node.getAttribute('data-artist') || '',
        cover: node.getAttribute('data-cover') || '',
        bg: node.getAttribute('data-bg') || ''
      };

    }).filter(function (track) {
      return track.src;
    });


    if (!tracks.length) return;


    /* Remove the original metadata spans */
    el.innerHTML = '';

    el.setAttribute('data-count', tracks.length);


    /* ─────────────────────────────────────────────
       AUDIO
    ───────────────────────────────────────────── */

    var audio = new Audio();

    audio.preload = 'metadata';
    audio.volume = 0.8;


    var index = 0;


    /* ─────────────────────────────────────────────
       BACKGROUND
    ───────────────────────────────────────────── */

    var bg = document.createElement('div');

    bg.className = 'bbv-bg';

    bg.setAttribute('aria-hidden', 'true');


    /* ─────────────────────────────────────────────
       OPTIONAL COVER
    ───────────────────────────────────────────── */

    var disc = document.createElement('div');

    disc.className = 'bbv-disc';

    disc.setAttribute('aria-hidden', 'true');


    /* ─────────────────────────────────────────────
       MAIN CONTAINER
    ───────────────────────────────────────────── */

    var main = document.createElement('div');

    main.className = 'bbv-main';


    /* ─────────────────────────────────────────────
       TRACK INFORMATION
    ───────────────────────────────────────────── */

    var info = document.createElement('div');

    info.className = 'bbv-info';


    var titleEl = document.createElement('div');

    titleEl.className = 'bbv-title';


    var artistEl = document.createElement('div');

    artistEl.className = 'bbv-artist';


    info.appendChild(titleEl);
    info.appendChild(artistEl);


    /* ─────────────────────────────────────────────
       CONTROLS
    ───────────────────────────────────────────── */

    var body = document.createElement('div');

    body.className = 'bbv-body';


    var buttons = document.createElement('div');

    buttons.className = 'bbv-buttons';


    /* Previous */

    var prevBtn = document.createElement('button');

    prevBtn.type = 'button';

    prevBtn.className = 'bbv-btn bbv-prev';

    prevBtn.innerHTML = buildIcon('prev');

    prevBtn.setAttribute('aria-label', 'Previous track');


    /* Play */

    var playBtn = document.createElement('button');

    playBtn.type = 'button';

    playBtn.className = 'bbv-btn bbv-play';

    playBtn.innerHTML = buildIcon('play');

    playBtn.setAttribute('aria-label', 'Play');


    /* Next */

    var nextBtn = document.createElement('button');

    nextBtn.type = 'button';

    nextBtn.className = 'bbv-btn bbv-next';

    nextBtn.innerHTML = buildIcon('next');

    nextBtn.setAttribute('aria-label', 'Next track');


    /* Volume */

    var volToggle = document.createElement('button');

    volToggle.type = 'button';

    volToggle.className = 'bbv-vol-toggle';

    volToggle.innerHTML = buildIcon('vol');

    volToggle.setAttribute('aria-label', 'Volume');

    volToggle.setAttribute('aria-expanded', 'false');


    /* Progress */

    var seek = document.createElement('input');

    seek.type = 'range';

    seek.className = 'bbv-seek';

    seek.min = 0;

    seek.max = 100;

    seek.value = 0;

    seek.step = 0.1;

    seek.setAttribute('aria-label', 'Track progress');


    /* Volume slider */

    var volPanel = document.createElement('div');

    volPanel.className = 'bbv-vol-panel';


    var vol = document.createElement('input');

    vol.type = 'range';

    vol.className = 'bbv-vol';

    vol.min = 0;

    vol.max = 100;

    vol.value = 80;

    vol.step = 1;

    vol.setAttribute('aria-label', 'Volume');


    volPanel.appendChild(vol);


    /* Build controls */

    buttons.appendChild(prevBtn);

    buttons.appendChild(playBtn);

    buttons.appendChild(nextBtn);

    buttons.appendChild(volToggle);


    body.appendChild(buttons);

    body.appendChild(seek);


    main.appendChild(info);

    main.appendChild(body);


    /* Add everything */

    el.appendChild(bg);

    el.appendChild(disc);

    el.appendChild(main);

    el.appendChild(volPanel);


    /* ─────────────────────────────────────────────
       TRACK VISUALS
    ───────────────────────────────────────────── */

    function applyTrackVisuals(track) {

      titleEl.textContent = track.title;

      artistEl.textContent = track.artist;


      /* Cover */

      if (track.cover) {

        disc.style.backgroundImage =
          'url("' + track.cover.replace(/"/g, '\\"') + '")';

        disc.classList.add('bbv-has-cover');

      } else {

        disc.style.backgroundImage = '';

        disc.classList.remove('bbv-has-cover');

      }


      /* Background */

      if (track.bg) {

        el.style.setProperty(
          '--bbv-bg',
          'url("' + track.bg.replace(/"/g, '\\"') + '")'
        );

        el.classList.add('bbv-has-bg');

      } else {

        el.style.removeProperty('--bbv-bg');

        el.classList.remove('bbv-has-bg');

      }


      /* Reset progress */

      seek.value = 0;

      el.style.setProperty(
        '--bbv-progress',
        '0%'
      );

    }


    /* ─────────────────────────────────────────────
       LOAD TRACK
    ───────────────────────────────────────────── */

    function load(i, autoplay) {

      index = (i + tracks.length) % tracks.length;

      var track = tracks[index];


      audio.src = track.src;

      audio.load();


      applyTrackVisuals(track);


      if (autoplay) {

        var promise = audio.play();


        if (promise && typeof promise.catch === 'function') {

          promise.catch(function () {

            setPlaying(false);

          });

        }

      }

    }


    /* ─────────────────────────────────────────────
       PLAYING STATE
    ───────────────────────────────────────────── */

    function setPlaying(playing) {

      el.classList.toggle(
        'bbv-playing',
        playing
      );


      playBtn.innerHTML =
        buildIcon(
          playing ? 'pause' : 'play'
        );


      playBtn.setAttribute(
        'aria-label',
        playing ? 'Pause' : 'Play'
      );

    }


    /* ─────────────────────────────────────────────
       PLAY / PAUSE
    ───────────────────────────────────────────── */

    playBtn.addEventListener(
      'click',
      function () {

        if (!audio.src) {

          load(index, false);

        }


        if (audio.paused) {

          var promise = audio.play();


          if (
            promise &&
            typeof promise.catch === 'function'
          ) {

            promise.catch(function () {

              setPlaying(false);

            });

          }

        } else {

          audio.pause();

        }

      }
    );


    /* ─────────────────────────────────────────────
       PREVIOUS / NEXT
    ───────────────────────────────────────────── */

    prevBtn.addEventListener(
      'click',
      function () {

        load(index - 1, true);

      }
    );


    nextBtn.addEventListener(
      'click',
      function () {

        load(index + 1, true);

      }
    );


    /* ─────────────────────────────────────────────
       AUDIO EVENTS
    ───────────────────────────────────────────── */

    audio.addEventListener(
      'play',
      function () {

        setPlaying(true);

      }
    );


    audio.addEventListener(
      'pause',
      function () {

        setPlaying(false);

      }
    );


    audio.addEventListener(
      'ended',
      function () {

        if (tracks.length > 1) {

          load(index + 1, true);

        } else {

          setPlaying(false);

        }

      }
    );


    /* ─────────────────────────────────────────────
       PROGRESS
    ───────────────────────────────────────────── */

    audio.addEventListener(
      'timeupdate',
      function () {

        if (
          !audio.duration ||
          !isFinite(audio.duration)
        ) {

          return;

        }


        var progress =
          (audio.currentTime / audio.duration) * 100;


        seek.value = progress;


        el.style.setProperty(
          '--bbv-progress',
          progress + '%'
        );

      }
    );


    audio.addEventListener(
      'loadedmetadata',
      function () {

        seek.value = 0;

        el.style.setProperty(
          '--bbv-progress',
          '0%'
        );

      }
    );


    seek.addEventListener(
      'input',
      function () {

        if (
          !audio.duration ||
          !isFinite(audio.duration)
        ) {

          return;

        }


        var progress =
          Number(seek.value);


        audio.currentTime =
          (progress / 100) *
          audio.duration;


        el.style.setProperty(
          '--bbv-progress',
          progress + '%'
        );

      }
    );


    /* ─────────────────────────────────────────────
       VOLUME
    ───────────────────────────────────────────── */

    vol.addEventListener(
      'input',
      function () {

        audio.volume =
          Number(vol.value) / 100;

      }
    );


    /* ─────────────────────────────────────────────
       VOLUME PANEL
    ───────────────────────────────────────────── */

    volToggle.addEventListener(
      'click',
      function (event) {

        event.stopPropagation();


        var open =
          !el.classList.contains(
            'bbv-vol-open'
          );


        el.classList.toggle(
          'bbv-vol-open',
          open
        );


        volToggle.setAttribute(
          'aria-expanded',
          open ? 'true' : 'false'
        );

      }
    );


    /* Close volume panel when clicking elsewhere */

    document.addEventListener(
      'click',
      function (event) {

        if (!el.contains(event.target)) {

          el.classList.remove(
            'bbv-vol-open'
          );


          volToggle.setAttribute(
            'aria-expanded',
            'false'
          );

        }

      }
    );


    /* Prevent buttons from bubbling into surrounding forum elements */

    el.addEventListener(
      'click',
      function (event) {

        if (
          event.target.closest &&
          event.target.closest('button')
        ) {

          event.stopPropagation();

        }

      }
    );


    /* ─────────────────────────────────────────────
       INITIAL TRACK
       No autoplay.
    ───────────────────────────────────────────── */

    load(0, false);

  }


  /* ─────────────────────────────────────────────
     INITIALIZE ALL PLAYERS
     ───────────────────────────────────────────── */

  function initAllPlayers() {

    document
      .querySelectorAll('.bbv-player')
      .forEach(function (player) {

        if (
          !player.dataset.bbvInitialized
        ) {

          player.dataset.bbvInitialized = 'true';

          initPlayer(player);

        }

      });

  }


  /* ─────────────────────────────────────────────
     DOM READY
     ───────────────────────────────────────────── */

  if (
    document.readyState === 'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      initAllPlayers
    );

  } else {

    initAllPlayers();

  }

})();
