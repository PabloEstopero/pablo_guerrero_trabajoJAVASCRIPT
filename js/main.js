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
       --- MÓDULO 4: VALIDACIÓN DEL PRESUPUESTO  ---
      ========================================================================== */
    // 1. Plantillas de Expresiones Regulares (RegExp)
    const patronLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    const patronTelefono = /^\d{9}$/;
    const patronEmail = /^[A-Za-z-_.+ñÑ\d]+@[A-Za-z-_.+ñÑ\d]{3,}\.[a-zA-Z]{2,}$/;

    // 2. FUNCIÓN DINÁMICA PARA CALCULAR EL PRECIO TOTAL (Disponible globalmente en el ready)
    function calcularPresupuesto() {
        let total = 0;

        // 1. Obtener el valor del producto seleccionado
        let precioProducto = $('#producto-base').val();

        // Si hay un producto seleccionado (no está vacío), lo sumamos convirtiéndolo a número
        if (precioProducto) {
            total += parseFloat(precioProducto);
        }

        // 2. Sumar los Extras (Checkboxes) que estén marcados (.check-extra)
        $('.check-extra:checked').each(function () {
            total += parseFloat($(this).val());
        });

        // 3. Aplicar recargo del 20% si el plazo es menor a 3 días
        let dias = parseInt($('#plazo').val(), 10);
        // Si el número es válido y además es menor que 3 (y mayor que 0)
        if (!isNaN(dias) && dias > 0 && dias < 3) {
            total = total * 1.20; // Añadimos el 20% de incremento por envío exprés
        }

        // 4. Inyectar el resultado formateado (sin decimales si es redondo)
        if (total % 1 === 0) {
            // Si es un número entero (redondo), lo mostramos sin decimales
            $('#precio-total').text(total);
        } else {
            // Si tiene decimales (como el recargo del 20%), ponemos 2 decimales y cambiamos el punto por coma
            let totalFormateado = total.toFixed(2).replace('.', ',');
            $('#precio-total').text(totalFormateado);
        }
    }

    // Escuchamos los cambios en los controles para actualizar el precio al instante
    $('#producto-base').on('change', calcularPresupuesto);
    $('.check-extra').on('change', calcularPresupuesto);
    $('#plazo').on('input keyup', calcularPresupuesto);


    // 3. Evento que escucha el envío del formulario
    $('#form-presupuesto').on('submit', function (evento) {

        // Frenamos la recarga automática del navegador
        evento.preventDefault();

        // Variable semáforo para saber si dejamos enviar o no
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

        // --- COMPROBACIÓN DEL PRODUCTO SELECCIONADO ---
        let valorProducto = $('#producto-base').val();

        if (valorProducto === null || valorProducto === "") {
            $('#producto-base').addClass('invalido');
            $('#error-producto').slideDown(200);
            formularioValido = false;
        } else {
            $('#producto-base').removeClass('invalido');
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
        // --- COMPROBACIÓN DEL CHECKBOX DE CONDICIONES ---
        // Con .is(':checked') jQuery nos devuelve true si está marcado o false si está vacío
        let condicionesAceptadas = $('#condiciones').is(':checked');

        if (!condicionesAceptadas) {
            // Si no está marcado, mostramos el error
            $('#error-condiciones').slideDown(200);
            formularioValido = false; // Bloqueamos el envío definitivo
        } else {
            // Si está marcado, ocultamos el error si existía
            $('#error-condiciones').slideUp(200);
        }

        // --- CONTROL FINAL DEL FORMULARIO ---
        if (formularioValido) {
           // Capturamos el precio final que está parpadeando en la pantalla
            let precioFinal = $('#precio-total').text();
            
            // Mostramos una alerta personalizada con los datos clave
            alert("¡Solicitud procesada con éxito, " + valorNombre + "!\n\n" +
                  "Hemos recibido tu petición para el producto seleccionado.\n" +
                  "Precio estimado: " + precioFinal + "€\n" +
                  "Plazo de entrega solicitado: " + valorPlazo + " días.\n\n" +
                  "Nos pondremos en contacto contigo en el correo: " + valorEmail);
            
            // Aquí podrías reiniciar el formulario si quisieras con: 
            // this.reset();
            // $('#precio-total').text('0');
        }
    });

}); 