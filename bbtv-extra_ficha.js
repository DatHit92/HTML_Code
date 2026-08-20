$('.post-perfil').each(function () {
    var $wrap = $(this);
    var $fichaLink = $wrap.find('.perfilt-contacto a[title="FICHA"]');
    if (!$fichaLink.length) return;

    var url = $fichaLink.attr('href');

    var $btn = $('<div class="ficha-toggle-btn">Ver Ficha</div>');
    $wrap.find('.perfilt').after($btn);

    var $postPost = $wrap.closest('.post-up').find('.post-post');
    if (!$postPost.length) return;

    var $overlay = $('<div class="ficha-overlay"><span class="ficha-overlay-close">&times;</span><div class="ficha-overlay-inner"></div></div>');
    $postPost.append($overlay);

    var loaded = false;

    $btn.on('click', function () {
        $overlay.toggleClass('open');
        $btn.toggleClass('active');

        if ($overlay.hasClass('open') && !loaded) {
            var $inner = $overlay.find('.ficha-overlay-inner');
            $inner.html('<div class="ficha-overlay-loading">Cargando ficha...</div>');

            $.get(url, function (data) {
                var $ficha = $(data).find('.ficha2').first();
                if ($ficha.length) {
                    $inner.empty().append($ficha);
                    loaded = true;
                } else {
                    $inner.html('<div class="ficha-overlay-empty">No se encontró ficha en el enlace vinculado.</div>');
                }
            }).fail(function () {
                $inner.html('<div class="ficha-overlay-empty">Error al cargar la ficha.</div>');
            });
        }
    });

    $overlay.find('.ficha-overlay-close').on('click', function (e) {
        e.stopPropagation();
        $overlay.removeClass('open');
        $btn.removeClass('active');
    });
});
