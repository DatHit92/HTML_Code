$(document).ready(function(){
  $('[data-letras]').each(function(){
    var $el = $(this);
    if ($el.data('letras-procesado')) return;
    var txt = $el.text();
    var html = txt.split('').map(function(ch, i){
      var c = (ch === ' ') ? '&nbsp;' : ch;
      return '<span style="--i:' + i + '">' + c + '</span>';
    }).join('');
    $el.html(html).data('letras-procesado', true);
  });
});
