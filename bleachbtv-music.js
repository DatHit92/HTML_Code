$(document).ready(function() {

  $('.music-min').each(function() {
    var $player = $(this);
    var $box = $player.find('.music-min-player');
    var $playBtn = $player.find('.mrm-play-btn');
    var current = '1';

    function stop() {
      $box.find('iframe').remove();
      $box.find('.mrm-cover').removeClass('active');
      $playBtn.removeClass('playing');
    }

    function play(track) {
      var videoId = $box.find('.mrm-cover[data-track="' + track + '"]').attr('data-video');
      $box.find('iframe').remove();
      $box.find('.mrm-cover').removeClass('active');
      $box.append('<iframe src="https://www.youtube.com/embed/' + videoId +
        '?autoplay=1&rel=0" allow="autoplay; encrypted-media" frameborder="0"></iframe>');
      $playBtn.addClass('playing');
    }

    $box.on('click', '.mrm-cover', function() {
      current = $(this).attr('data-track');
      play(current);
    });

    $playBtn.on('click', function() {
      if ($playBtn.hasClass('playing')) {
        stop();
        $box.find('.mrm-cover[data-track="' + current + '"]').addClass('active');
      } else {
        play(current);
      }
    });

    $player.on('click', '.mrm-tab', function() {
      var track = $(this).attr('data-track');
      if (track === current) return;
      current = track;
      $player.find('.mrm-tab').removeClass('active');
      $(this).addClass('active');
      stop();
      $box.find('.mrm-cover[data-track="' + track + '"]').addClass('active');
    });

  });

});
