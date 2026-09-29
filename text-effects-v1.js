$(document).ready(function(){

  var TRANSICION = 0.3; // segundos fijos de fundido entrada/salida (no configurable, evita saltos bruscos)
  var keyframesGenerados = {}; // evita inyectar el mismo @keyframes más de una vez

  function parseSegundos(valor, porDefecto) {
    if (!valor) return porDefecto;
    var n = parseFloat(valor.toString().replace('s',''));
    return isNaN(n) ? porDefecto : n;
  }

  function inyectarKeyframes(nombre, css) {
    if (keyframesGenerados[nombre]) return;
    keyframesGenerados[nombre] = true;
    $('<style>').text(css).appendTo('head');
  }

  // Definición de cada efecto: estado "oculto" y estado "visible"
  var estilosEfecto = {
    'efecto-disipar': {
      visible: 'opacity:1;',
      oculto:  'opacity:.1;'
    },
    'efecto-deshacer': {
      visible: 'opacity:1; transform:translateY(0) rotate(0deg); filter:blur(0px);',
      oculto:  'opacity:0; transform:translateY(12px) rotate(8deg); filter:blur(2px);'
    },
    'efecto-ceniza': {
      visible: 'opacity:1; transform:translateY(0); filter:blur(0px);',
      oculto:  'opacity:0; transform:translateY(-14px); filter:blur(3px);'
    },
    'efecto-corrupcion': {
      visible: 'opacity:1; transform:translate(0,0);',
      oculto:  'opacity:0; transform:translate(1px,-1px);'
    }
  };

  $('[data-letras]').each(function(){
    var $el = $(this);
    if ($el.data('letras-procesado')) return;

    // Trocear el texto en spans (igual que antes)
    var txt = $el.text();
    var html = txt.split('').map(function(ch, i){
      var c = (ch === ' ') ? '&nbsp;' : ch;
      return '<span style="--i:' + i + '">' + c + '</span>';
    }).join('');
    $el.html(html).data('letras-procesado', true);

    // Detectar qué efecto tiene aplicado
    var efectoClave = null;
    for (var clave in estilosEfecto) {
      if ($el.hasClass(clave)) { efectoClave = clave; break; }
    }
    if (!efectoClave) return; // sin efecto de desaparición, solo estilo de tinta estático

    var estilo = estilosEfecto[efectoClave];

    // Leer duración total y tiempo oculto (con valores por defecto sensatos)
    var duracionTotal = parseSegundos(getComputedStyle($el[0]).getPropertyValue('--efecto-duracion'), 4);
    var tiempoOculto   = parseSegundos(getComputedStyle($el[0]).getPropertyValue('--efecto-oculto'), 0.4);

    // Calcular porcentajes del ciclo
    var transPct   = Math.min((TRANSICION / duracionTotal) * 100, 15);
    var ocultoPct  = Math.min((tiempoOculto / duracionTotal) * 100, 90 - transPct * 2);
    var visiblePct = 100 - ocultoPct - (transPct * 2);
    if (visiblePct < 0) visiblePct = 0;

    var pFadeOutStart = visiblePct.toFixed(2);
    var pHiddenStart  = (visiblePct + transPct).toFixed(2);
    var pHiddenEnd    = (visiblePct + transPct + ocultoPct).toFixed(2);

    // Nombre único de keyframe basado en efecto + duración + oculto (redondeado, para reutilizar)
    var nombreAnim = 'bbv-' + efectoClave + '-' + duracionTotal.toFixed(1) + '-' + tiempoOculto.toFixed(1);
    nombreAnim = nombreAnim.replace(/\./g, '_');

    var css =
      '@keyframes ' + nombreAnim + ' {' +
        '0% { ' + estilo.visible + ' }' +
        pFadeOutStart + '% { ' + estilo.visible + ' }' +
        pHiddenStart + '% { ' + estilo.oculto + ' }' +
        pHiddenEnd + '% { ' + estilo.oculto + ' }' +
        '100% { ' + estilo.visible + ' }' +
      '}';

    inyectarKeyframes(nombreAnim, css);

    // Aplicar la animación generada a cada letra, respetando duración total y stagger
    $el.find('span').css({
      'animation-name': nombreAnim,
      'animation-duration': duracionTotal + 's',
      'animation-iteration-count': 'infinite',
      'animation-timing-function': 'ease-in-out'
      // animation-delay (stagger) ya lo pone el CSS vía --efecto-stagger, se conserva
    });
  });

});
