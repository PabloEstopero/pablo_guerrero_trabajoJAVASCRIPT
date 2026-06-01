/* ==========================================================================
    CONFIGURACIÓN GENERAL Y CARGA DE MÓDULOS (FriKon)
   ========================================================================== */

$(document).ready(function () {

    // --- MÓDULO 1: DETECCIÓN DE PORTADA (AJAX NOTICIAS) ---
    // Comprobamos si en la página actual existe el contenedor de noticias de la portada
    if ($('#contenedor-noticias-ajax').length > 0) {
        cargarNoticiasEfectoAjax();
    }


    // --- MÓDULO 2: CARRUSEL CON JQUERY (GALERÍA) ---
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


    // --- MÓDULO 3: DESPLEGABLE INFO PRODUCTOS CON JQUERY (GALERÍA) ---
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

});


/* ==========================================================================
    FUNCIONES GLOBALES / PERIFÉRICAS (MÓDULO AJAX)
   ========================================================================== */

/**
 * Función que realiza la petición AJAX para traer las noticias del archivo JSON externo
 * (Se define fuera del ready para mantener el código limpio y estructurado)
 */
function cargarNoticiasEfectoAjax() {
    $.ajax({
        url: 'noticias.json', // Ruta del archivo externo en la raíz del proyecto
        type: 'GET',          // Método HTTP de lectura
        dataType: 'json',     // Tipo de datos que esperamos procesar
        success: function(noticiasRecibidas) {
            
            // 1. Seleccionamos el contenedor de la portada y lo vaciamos (quitamos el texto "Cargando...")
            var $contenedor = $('#contenedor-noticias-ajax');
            $contenedor.empty();

            // 2. Recorremos el array de objetos del JSON con el bucle por defecto de jQuery ($.each)
            $.each(noticiasRecibidas, function(indice, noticia) {
                
                // Construimos la estructura HTML inyectando dinámicamente las propiedades del JSON
                var tarjetaHTML = `
                    <article class="noticia-card">
                        <span class="noticia-tag">${noticia.categoria}</span>
                        <h3>${noticia.titulo}</h3>
                        <div class="fecha">Publicado el ${noticia.fecha}</div>
                        <p>${noticia.descripcion}</p>
                    </article>
                `;

                // Añadimos de forma consecutiva la tarjeta estructurada al contenedor visual
                $contenedor.append(tarjetaHTML);
            });

        },
        error: function(xhr, status, error) {
            console.error("Error crítico al leer el archivo noticias.json:", error);
            $('#contenedor-noticias-ajax').html(
                '<p class="error-carga">No se han podido cargar las novedades en este momento. Inténtalo más tarde.</p>'
            );
        }
    });
}