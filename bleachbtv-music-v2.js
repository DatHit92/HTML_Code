<script>
$(document).ready(function() {

  $('.music-min').each(function() {
    var $player = $(this);
    var $box = $player.find('.music-min-player');
    var $playBtn = $player.find('.mrm-play-btn');
    var iframes = {};
    var currentTrack = '1';

    function ytOrigin() {
      return window.location.protocol + '//' + window.location.host;
    }

    function sendCommand(track, func) {
      var $f = iframes[track];
      if (!$f || !$f[0].contentWindow) return;
      $f[0].contentWindow.postMessage(JSON.stringify({ event: 'command', func: func, args: [] }), '*');
    }

    function showTrack(track) {
      $player.find('.mrm-tab').removeClass('active');
      $player.find('.mrm-tab[data-track="' + track + '"]').addClass('active');
      $box.find('.mrm-cover').removeClass('active');
      $box.find('iframe').removeClass('active');

      if (iframes[track]) {
        iframes[track].addClass('active');
      } else {
        $box.find('.mrm-cover[data-track="' + track + '"]').addClass('active');
      }
      $playBtn.removeClass('playing');
    }

    function playTrack(track) {
      if (!iframes[track]) {
        var videoId = $box.find('.mrm-cover[data-track="' + track + '"]').attr('data-video');
        var src = 'https://www.youtube.com/embed/' + videoId +
          '?autoplay=1&rel=0&enablejsapi=1&origin=' + encodeURIComponent(ytOrigin());
        var $iframe = $('<iframe>', {
          src: src,
          allow: 'autoplay; encrypted-media',
          frameborder: '0'
        });
        $box.append($iframe);
        iframes[track] = $iframe;
      } else {
        sendCommand(track, 'playVideo');
      }
      $box.find('.mrm-cover').removeClass('active');
      $box.find('iframe').removeClass('active');
      iframes[track].addClass('active');
      $playBtn.addClass('playing');
    }

    function pauseTrack(track) {
      if (iframes[track]) sendCommand(track, 'pauseVideo');
      $playBtn.removeClass('playing');
    }

    $box.on('click', '.mrm-cover', function() {
      currentTrack = $(this).attr('data-track');
      playTrack(currentTrack);
    });

    $playBtn.on('click', function() {
      if ($playBtn.hasClass('playing')) {
        pauseTrack(currentTrack);
      } else {
        playTrack(currentTrack);
      }
    });

    $player.on('click', '.mrm-tab', function() {
      var track = $(this).attr('data-track');
      if (track === currentTrack) return;
      pauseTrack(currentTrack);
      currentTrack = track;
      showTrack(track);
    });

  });

});
</script>
