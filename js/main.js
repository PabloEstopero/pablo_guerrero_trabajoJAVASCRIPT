/* ==========================================================================
    CONFIGURACIÓN GENERAL Y CARGA DE MÓDULOS (FriKon)
   ========================================================================== */

$(document).ready(function () {
    /* ==========================================================================
    --- MÓDULO 1: DETECCIÓN DE PORTADA (AJAX NOTICIAS) ---
   ========================================================================== */
    // Comprobamos si en la página actual existe el contenedor de noticias de la portada
    if ($('#contenedor-noticias-ajax').length > 0) {
        cargarNoticiasEfectoAjax();
    }

    /* ==========================================================================
        --- MÓDULO 2: CARRUSEL CON JQUERY (GALERÍA) ---
       ========================================================================== */

    const $slides = $('.slide');
    const $dots = $('.dot-wrapper');

    // posicion de la imagen que se esta viendo
    let indiceActual = 0;

    // aqui guardare el temporizador de la carga automatica
    let temporizador = null;

    // funcion para cambiar la foto y activar la animacion del circulo
    function mostrarSlice(nuevoIndice) {
        // quito la clase activa de la foto y del circulo actuales para apagarlos
        $slides.eq(indiceActual).removeClass('activa');
        $dots.eq(indiceActual).removeClass('activo');

        // actualizo el indice con la nueva posicion
        indiceActual = nuevoIndice;

        // le pongo la clase activa a la nueva foto y al nuevo circulo para encenderlos
        $slides.eq(indiceActual).addClass('activa');
        $dots.eq(indiceActual).addClass('activo');
    }

    // creamos el temporizador para que el carrusel se mueva solo
    function iniciarAuto() {
        // configuramos un intervalo para que se ejecute cada 5000 milisegundos (5 segundos)
        temporizador = setInterval(function () {
            // calculamos la siguiente posicion 
            let siguienteIndice = (indiceActual + 1) % $slides.length;

            // llamamos a la funcion para cambiar la imagen
            mostrarSlice(siguienteIndice);
        }, 5000);
    }

    // arranco el automatismo nada mas cargar la pagina si existen elementos del carrusel
    if ($slides.length > 0) {
        iniciarAuto();
        console.log("Variables listas. Imagenes detectadas en carrusel:", $slides.length);
    }

    // detecto el clic en cualquiera de los circulos usando el atajo de jquery
    $dots.on('click', function () {
        // leo el numero de foto que tiene guardado ese circulo en su html
        let indiceClicado = $(this).data('slide');

        // si el usuario pincha en el circulo de la foto que ya se esta viendo, no hago nada
        if (indiceClicado === indiceActual) return;

        // detengo el temporizador automatico que estaba corriendo
        clearInterval(temporizador);

        // muevo el carrusel a la foto que ha elegido el usuario
        mostrarSlice(indiceClicado);

        // vuelvo a arrancar el temporizador desde cero para que siga solo tras el clic
        iniciarAuto();
    });

    /* ==========================================================================
        --- MÓDULO 3: DESPLEGABLE INFO PRODUCTOS CON JQUERY (GALERÍA) ---
       ========================================================================== */

    // detecto el click en la imagen o en el texto resumen del producto
    $('.producto-imagen-wrapper, .producto-resumen').on('click', function () {
        // busco la tarjeta (card) completa del producto en el que he pinchado
        const $tarjetaActual = $(this).closest('.producto-card');

        // busco el panel desplegable de este producto concreto
        const $desplegableActual = $tarjetaActual.find('.producto-desplegable');

        // busco las otras tarjetas que estan en la misma categoria para cerrarlas
        const $otrasTarjetas = $tarjetaActual.siblings('.producto-card');

        // cierro de forma suave los desplegables de los otros productos
        $otrasTarjetas.find('.producto-desplegable').slideUp(300);

        // abro o cierro el desplegable del producto pinchado con efecto cortina
        $desplegableActual.slideToggle(300);
    });

    /* ==========================================================================
           --- MÓDULO 4: VALIDACIÓN Y CÁLCULO DEL PRESUPUESTO ---
          ========================================================================== */
    const patronLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const patronTelefono = /^\d{9}$/;
    const patronEmail = /^[A-Za-z-_.+ñÑ\d]+@[A-Za-z-_.+ñÑ\d]{3,}\.[a-zA-Z]{2,}$/;

    // FUNCIÓN DINÁMICA PARA CALCULAR EL PRECIO TOTAL
    function calcularPresupuesto() {
        let total = 0;

        // 1. Sumar TODOS los productos que estén marcados (.check-producto)
        $('.check-producto:checked').each(function () {
            total += parseFloat($(this).val());
        });

        // 2. Sumar los Extras (Checkboxes) que estén marcados (.check-extra)
        $('.check-extra:checked').each(function () {
            total += parseFloat($(this).val());
        });

        // 3. Aplicar recargo del 20% si el plazo es menor a 3 días
        let dias = parseInt($('#plazo').val(), 10);
        if (!isNaN(dias) && dias > 0 && dias < 3) {
            total = total * 1.20;
        }

        // 4. Inyectar el resultado formateado
        if (total % 1 === 0) {
            $('#precio-total').text(total);
        } else {
            let totalFormateado = total.toFixed(2).replace('.', ',');
            $('#precio-total').text(totalFormateado);
        }
    }

    // Escuchamos los cambios en los controles para actualizar el precio al instante
    $('.check-producto').on('change', calcularPresupuesto);
    $('.check-extra').on('change', calcularPresupuesto);
    $('#plazo').on('input keyup', calcularPresupuesto);


    // EVENTO QUE ESCUCHA EL ENVÍO DEL FORMULARIO
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
            $('#condiciones').addClass('invalido'); // Añade borde rojo al check
            $('#error-condiciones').slideDown(200); // Muestra el mensaje de error
            formularioValido = false;
        } else {
            $('#condiciones').removeClass('invalido');
            $('#error-condiciones').slideUp(200);
        }

        // --- CONTROL FINAL DEL FORMULARIO ---
        if (formularioValido) {
            let precioFinal = $('#precio-total').text();

            alert("¡Solicitud procesada con éxito, " + valorNombre + "!\n\n" +
                "Hemos recibido tu petición para los artículos seleccionados.\n" +
                "Precio estimado total: " + precioFinal + "€\n" +
                "Plazo de entrega solicitado: " + valorPlazo + " días.\n\n" +
                "Nos pondremos en contacto contigo en el correo: " + valorEmail);

            $('#btn-resetear').trigger('click');
        } else {
            // 1. Buscamos el primer elemento que tenga la clase de error
            let $primerInvalido = $('.invalido').first();

            if ($primerInvalido.length > 0) {
                let $elementoDestino = $primerInvalido;
                let distanciaMargen = 140; // Margen por defecto para los inputs normales

                // 2. CAMBIO CLAVE: Si lo que falla son los productos, apuntamos al legend/fieldset
                if ($primerInvalido.attr('id') === 'contenedor-check-productos') {
                    // Buscamos el fieldset que envuelve a este contenedor de productos
                    $elementoDestino = $primerInvalido.closest('fieldset');
                   
                    
                }

                // 3. Esperamos a que se abra el mensaje de error con el efecto cortina
                setTimeout(function () {
                    $('html, body').stop().animate({
                        scrollTop: $elementoDestino.offset().top - distanciaMargen
                    }, 800, 'swing', function () {
                        // 4. Una vez termina el scroll suave, ponemos el foco en el primer check de producto
                        if ($primerInvalido.attr('id') === 'contenedor-check-productos') {
                            $('.check-producto').first().focus();
                        } else {
                            $primerInvalido.focus();
                        }
                    });
                }, 150);
            }
        }
    });

    /* ==========================================================================
       --- MÓDULO 5: ACCIÓN DEL BOTÓN RESET PERSONALIZADO ---
      ========================================================================== */
    $('#btn-resetear').on('click', function () {
        // 1. Reseteamos los campos nativos de HTML
        $('#form-presupuesto')[0].reset();

        // 2. Reiniciamos el precio visual a 0
        $('#precio-total').text('0');

        // 3. Limpiamos las clases de error de todos los inputs
        $('input, select, checkbox').removeClass('invalido');
        $('#contenedor-check-productos').css('border-color', 'transparent').removeClass('invalido');

        // 4. Escondemos todos los mensajes de error
        $('.error-mensaje').slideUp(200);
    });

});

/* ==========================================================================
    FUNCIONES GLOBALES / PERIFÉRICAS (MÓDULO 1: AJAX)
   ========================================================================== */
function cargarNoticiasEfectoAjax() {
    $.ajax({
        url: 'noticias.json', // Si estás en index.html busca la raíz
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