/* ── Efecto de letras (tinta / disipar / deshacer) ──
   Aplica a cualquier elemento con el atributo data-letras.
   Se ejecuta una vez por carga de página, sobre todo el
   contenido ya presente (posts, temas, etc).            */
$('[data-letras]').each(function(){
  var $el = $(this);
  if ($el.data('letras-procesado')) return; // evita duplicar si se llama más de una vez
  var txt = $el.text();
  var html = txt.split('').map(function(ch, i){
    var c = (ch === ' ') ? '&nbsp;' : ch;
    return '<span style="--i:' + i + '">' + c + '</span>';
  }).join('');
  $el.html(html).data('letras-procesado', true);
});
