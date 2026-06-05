/**
 * =============================================================================
 * ARCHIVO: js/main.js
 * 
 * DESCRIPCIÓN:
 * Lógica interactiva principal del sitio web FriKon. Incluye 6 módulos:
 * 
 * 1. MÓDULO NOTICIAS: Carga dinámicamente noticias desde JSON vía AJAX
 * 2. MÓDULO CARRUSEL: Navegación automática y manual de slides en galería
 * 3. MÓDULO PRODUCTOS: Desplegable interactivo de productos con mini-galerías
 * 4. MÓDULO VALIDACIÓN: Validaciones de formulario en tiempo real
 * 5. MÓDULO CÁLCULO: Presupuesto dinámico sin refresh de página
 * 6. MÓDULO MAPA: Integración con Leaflet, geolocalización y rutas
 * 
 * DEPENDENCIAS:
 * - jQuery 3.7.1
 * - Leaflet.js 1.9.4 (para mapas)
 * - Leaflet Routing Machine 3.2.12 (para cálculo de rutas)
 * 
 * AUTOR: Pablo Guerrero
 * FECHA: 2026-06-05
 * =============================================================================
 */

$(document).ready(function () {
    /* ==========================================================================
       MÓDULO 1: DETECCIÓN DE PORTADA Y CARGA AJAX DE NOTICIAS
       Verifica si el contenedor de noticias existe y carga datos del JSON
   ========================================================================== */
    if ($('#contenedor-noticias-ajax').length > 0) {
        cargarNoticiasEfectoAjax();
    }

    /* ==========================================================================
       MÓDULO 2: CARRUSEL DE NOVEDADES
       Sistema de navegación automática (cada 5 segundos) y manual (clicks en dots)
       Animación suave con transiciones CSS y manejo de índices rotativos
       ========================================================================== */

    const $slides = $('.slide');
    const $dots = $('.dot-wrapper');
    let indiceActual = 0;
    let temporizador = null;

    function mostrarSlice(nuevoIndice) {
        $slides.eq(indiceActual).removeClass('activa');
        $dots.eq(indiceActual).removeClass('activo');

        indiceActual = nuevoIndice;

        $slides.eq(indiceActual).addClass('activa');
        $dots.eq(indiceActual).addClass('activo');
    }

    function iniciarAuto() {
        temporizador = setInterval(function () {
            let siguienteIndice = (indiceActual + 1) % $slides.length;
            mostrarSlice(siguienteIndice);
        }, 5000);
    }

    if ($slides.length > 0) {
        iniciarAuto();
    }

    $dots.on('click', function () {
        let indiceClicado = $(this).data('slide');
        if (indiceClicado === indiceActual) return;

        clearInterval(temporizador);
        mostrarSlice(indiceClicado);
        iniciarAuto();
    });

    /* ==========================================================================
       MÓDULO 3: DESPLEGABLE INTERACTIVO DE PRODUCTOS
       Click en imagen o resumen expande/contrae detalles del producto
       Incluye mini-galería con navegación prev/next entre fotos
       ========================================================================== */

    $('.producto-imagen-wrapper, .producto-resumen').on('click', function () {
        const $tarjetaActual = $(this).closest('.producto-card');
        const $desplegableActual = $tarjetaActual.find('.producto-desplegable');
        const $otrasTarjetas = $tarjetaActual.siblings('.producto-card');

        $otrasTarjetas.find('.producto-desplegable').slideUp(300);
        $desplegableActual.slideToggle(300);
    });

    $('.flecha-galeria').on('click', function (e) {
        e.stopPropagation();

        const $boton = $(this);
        const $wrapper = $boton.closest('.producto-imagen-wrapper');
        const $fotos = $wrapper.find('.foto-slide');
        let indiceActivo = $fotos.index($wrapper.find('.foto-slide.activa'));

        if ($boton.hasClass('next')) {
            indiceActivo++;
            if (indiceActivo >= $fotos.length) indiceActivo = 0;
        } else if ($boton.hasClass('prev')) {
            indiceActivo--;
            if (indiceActivo < 0) indiceActivo = $fotos.length - 1;
        }

        $fotos.removeClass('activa').eq(indiceActivo).addClass('activa');
    });

    $('.btn-reserva').on('click', function (e) {
        e.stopPropagation();
        showToast('¡Reserva añadida con éxito! Nos pondremos en contacto contigo.', 'success');
    });

    /* ==========================================================================
       MÓDULO 4: VALIDACIÓN Y CÁLCULO DEL PRESUPUESTO
      ========================================================================== */
    const patronLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const patronTelefono = /^\d{9}$/;
    const patronEmail = /^[A-Za-z-_.+ñÑ\d]+@[A-Za-z-_.+ñÑ\d]{3,}\.[a-zA-Z]{2,}$/;

    function calcularPresupuesto() {
        let total = 0;

        $('.check-producto:checked').each(function () {
            total += parseFloat($(this).val());
        });

        $('.check-extra:checked').each(function () {
            total += parseFloat($(this).val());
        });

        let dias = parseInt($('#plazo').val(), 10);
        if (!isNaN(dias) && dias > 0 && dias < 3) {
            total *= 1.20;
        }

        if (total % 1 === 0) {
            $('#precio-total').text(total);
        } else {
            let totalFormateado = total.toFixed(2).replace('.', ',');
            $('#precio-total').text(totalFormateado);
        }
    }

    $('.check-producto').on('change', calcularPresupuesto);
    $('.check-extra').on('change', calcularPresupuesto);
    $('#plazo').on('input keyup', calcularPresupuesto);

    $('#form-presupuesto').on('submit', function (evento) {
        evento.preventDefault();
        let formularioValido = true;

        // --- COMPROBACIÓN DEL NOMBRE ---
        let valorNombre = $('#nombre').val().trim();
        if (valorNombre === "" || !patronLetras.test(valorNombre) || valorNombre.length > 15) {
            $('#nombre').addClass('invalido');
            $('#error-nombre').slideDown(200);
            formularioValido = false;
        } else {
            $('#nombre').removeClass('invalido');
            $('#error-nombre').slideUp(200);
        }

        // --- COMPROBACIÓN DE LOS APELLIDOS ---
        let valorApellidos = $('#apellidos').val().trim();
        if (valorApellidos === "" || !patronLetras.test(valorApellidos) || valorApellidos.length > 30) {
            $('#apellidos').addClass('invalido');
            $('#error-apellidos').slideDown(200);
            formularioValido = false;
        } else {
            $('#apellidos').removeClass('invalido');
            $('#error-apellidos').slideUp(200);
        }

        // --- COMPROBACIÓN DEL TELÉFONO ---
        let valorTelefono = $('#telefono').val().trim();
        if (valorTelefono === "" || !patronTelefono.test(valorTelefono)) {
            $('#telefono').addClass('invalido');
            $('#error-telefono').slideDown(200);
            formularioValido = false;
        } else {
            $('#telefono').removeClass('invalido');
            $('#error-telefono').slideUp(200);
        }

        // --- COMPROBACIÓN DEL EMAIL ---
        let valorEmail = $('#email').val().trim();
        if (valorEmail === "" || !patronEmail.test(valorEmail)) {
            $('#email').addClass('invalido');
            $('#error-email').slideDown(200);
            formularioValido = false;
        } else {
            $('#email').removeClass('invalido');
            $('#error-email').slideUp(200);
        }

        // --- COMPROBACIÓN DE PRODUCTOS SELECCIONADOS (CHECKBOXES) ---
        let cantidadProductosMarcados = $('.check-producto:checked').length;
        if (cantidadProductosMarcados === 0) {
            $('#contenedor-check-productos').css('border-color', '#ff4d4d').addClass('invalido');
            $('#error-producto').slideDown(200);
            formularioValido = false;
        } else {
            $('#contenedor-check-productos').css('border-color', 'transparent').removeClass('invalido');
            $('#error-producto').slideUp(200);
        }

        // --- COMPROBACIÓN DEL PLAZO DE ENTREGA ---
        let valorPlazo = $('#plazo').val().trim();
        let numeroPlazo = parseInt(valorPlazo, 10);
        if (valorPlazo === "" || isNaN(numeroPlazo) || numeroPlazo < 1 || numeroPlazo > 30) {
            $('#plazo').addClass('invalido');
            $('#error-plazo').slideDown(200);
            formularioValido = false;
        } else {
            $('#plazo').removeClass('invalido');
            $('#error-plazo').slideUp(200);
        }

        // --- COMPROBACIÓN DEL CHECKBOX DE CONDICIONES (PRIVACIDAD) ---
        let condicionesAceptadas = $('#condiciones').is(':checked');
        if (!condicionesAceptadas) {
            $('#condiciones').addClass('invalido');
            $('#error-condiciones').slideDown(200);
            formularioValido = false;
        } else {
            $('#condiciones').removeClass('invalido');
            $('#error-condiciones').slideUp(200);
        }

        // --- CONTROL FINAL DEL FORMULARIO ---
        if (formularioValido) {
            let precioFinal = $('#precio-total').text();

            showToast('Solicitud procesada con éxito. Revisa tu correo para más detalles.', 'success');
            console.log("Solicitud procesada: ", { nombre: valorNombre, email: valorEmail, precio: precioFinal, plazo: valorPlazo });

            $('#btn-resetear').trigger('click');
        } else {
            let $primerInvalido = $('.invalido').first();

            if ($primerInvalido.length > 0) {
                let $elementoDestino = $primerInvalido;
                let distanciaMargen = 140;

                if ($primerInvalido.attr('id') === 'contenedor-check-productos') {
                    $elementoDestino = $primerInvalido.closest('fieldset');
                }

                setTimeout(function () {
                    $('html, body').stop(true, true).animate({
                        scrollTop: $elementoDestino.offset().top - distanciaMargen
                    }, 800, 'swing', function () {
                        if ($primerInvalido.attr('id') === 'contenedor-check-productos') {
                            var primerCheck = $('.check-producto').first()[0];
                            if (primerCheck && typeof primerCheck.focus === 'function') {
                                primerCheck.focus({ preventScroll: true });
                            }
                        } else {
                            var elementoFocus = $primerInvalido[0];
                            if (elementoFocus && typeof elementoFocus.focus === 'function') {
                                elementoFocus.focus({ preventScroll: true });
                            }
                        }
                    });
                }, 150);
            }
        }
    });

    /* ==========================================================================
       MÓDULO 5: ACCIÓN DEL BOTÓN RESET PERSONALIZADO
      ========================================================================== */
    $('#btn-resetear').on('click', function () {
        $('#form-presupuesto')[0].reset();
        $('#precio-total').text('0');
        $('input, select, input[type="checkbox"]').removeClass('invalido');
        $('#contenedor-check-productos').css('border-color', 'transparent').removeClass('invalido');
        $('.error-mensaje').slideUp(200);
    });


    /* ==========================================================================
       MÓDULO 6: MAPA DINÁMICO Y GEOLOCALIZACIÓN (CONTACTO)
      ========================================================================== */
    if ($('#mapa-frikon').length > 0) {
        const latTienda = 36.7165;
        const lngTienda = -4.4305;

        var mapa = L.map('mapa-frikon').setView([latTienda, lngTienda], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(mapa);

        var marcadorTienda = L.marker([latTienda, lngTienda]).addTo(mapa)
            .bindPopup('<b>🚀 ¡Tienda FriKon!</b><br>Av. del Entretenimiento, Local 42.<br>¡Ven a por tus cartas y figuras!')
            .openPopup();

        var controlRuta = null;

        $('#btn-calcular-ruta').on('click', function () {
            var $mensajeGPS = $('#estado-gps');
            $mensajeGPS.text("Solicitando acceso a tu ubicación... 📍");

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (posicion) {
                        var latCliente = posicion.coords.latitude;
                        var lngCliente = posicion.coords.longitude;

                        $mensajeGPS.text("¡Ubicación encontrada! Calculando ruta idónea... 🚗");

                        if (controlRuta !== null) {
                            mapa.removeControl(controlRuta);
                        }

                        controlRuta = L.Routing.control({
                            waypoints: [
                                L.latLng(latCliente, lngCliente),
                                L.latLng(latTienda, lngTienda)
                            ],
                            language: 'es',
                            routeWhileDragging: false,
                            createMarker: function (i, waypoint, n) {
                                if (i === 0) {
                                    return L.marker(waypoint.latLng).bindPopup('<b>👤 Tu Ubicación Actual</b>');
                                } else {
                                    return L.marker(waypoint.latLng).bindPopup('<b>🏢 Destino: FriKon S.L.</b>');
                                }
                            }
                        }).addTo(mapa);

                        mapa.removeLayer(marcadorTienda);
                        $mensajeGPS.text("Ruta trazada. ¡Te esperamos en la tienda!");
                    },
                    function (error) {
                        console.error("Error de Geolocalización:", error);
                        $mensajeGPS.text("❌ No se ha podido obtener tu ubicación. Asegúrate de dar permisos de GPS a tu navegador.");
                        showToast('Para calcular la ruta necesitamos que aceptes el permiso de localización del navegador.', 'error');
                    }
                );
            } else {
                $mensajeGPS.text("❌ Tu navegador no es compatible con la geolocalización.");
            }
        });
    }

});

/* ==========================================================================
    FUNCIONES GLOBALES / PERIFÉRICAS (MÓDULO 1: AJAX)
   ========================================================================== */
function cargarNoticiasEfectoAjax() {
    $.ajax({
        url: 'noticias.json',
        type: 'GET',
        dataType: 'json',
        success: function (noticiasRecibidas) {
            var $contenedor = $('#contenedor-noticias-ajax');
            $contenedor.empty();

            $.each(noticiasRecibidas, function (indice, noticia) {
                var tarjetaHTML = `
                    <article class="noticia-card">
                        <span class="noticia-tag">${noticia.categoria}</span>
                        <h3>${noticia.titulo}</h3>
                        <div class="fecha">Publicado el ${noticia.fecha}</div>
                        <p>${noticia.descripcion}</p>
                    </article>
                `;
                $contenedor.append(tarjetaHTML);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error crítico al leer el archivo noticias.json:", error);
            $('#contenedor-noticias-ajax').html(
                '<p class="error-carga">No se han podido cargar las novedades en este momento. Inténtalo más tarde.</p>'
            );
        }
    });
}

function showToast(message, type = 'info', timeout = 3500) {
    var $container = $('.toast-container');
    if ($container.length === 0) {
        $container = $('<div class="toast-container"></div>').appendTo('body');
    }
    var $toast = $("<div class='toast " + (type || 'info') + "'><div class='mensaje'>" + message + "</div></div>");
    $container.append($toast);
    setTimeout(function () { $toast.addClass('show'); }, 10);
    setTimeout(function () { $toast.removeClass('show'); setTimeout(function () { $toast.remove(); }, 250); }, timeout);
}