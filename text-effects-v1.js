document.querySelectorAll('[data-letras]').forEach(function(el){
  var txt = el.textContent;
  el.innerHTML = txt.split('').map(function(ch, i){
    var c = ch === ' ' ? '&nbsp;' : ch;
    return '<span style="--i:' + i + '">' + c + '</span>';
  }).join('');
});
