(function () {
  'use strict';

  var MS_DIA = 86400000;
  var AVISO_DEMO = 'En la web final, esta consulta llega directo al WhatsApp del complejo';

  function aFecha(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor || '')) return null;
    var p = valor.split('-');
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatear(d) {
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    return dd + '/' + mm + '/' + d.getFullYear();
  }

  function aValorFecha(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function hoy() {
    var h = new Date();
    return new Date(h.getFullYear(), h.getMonth(), h.getDate());
  }

  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

  
  function validar(datos, referencia) {
    var errores = {};
    var desde = aFecha(datos.ingreso);
    var hasta = aFecha(datos.egreso);
    var base = referencia || hoy();
    if (!desde) errores.ingreso = 'Elegí la fecha de llegada.';
    else if (desde < base) errores.ingreso = 'La fecha de llegada no puede ser anterior a hoy.';
    if (!hasta) errores.egreso = 'Elegí la fecha de salida.';
    else if (desde && hasta <= desde) errores.egreso = 'La salida tiene que ser posterior a la llegada.';
    var adultos = parseInt(datos.adultos, 10);
    var menores = parseInt(datos.menores || '0', 10);
    if (!(adultos >= 1 && adultos <= 20)) errores.adultos = 'Indicá cuántos adultos viajan (al menos 1).';
    if (!(menores >= 0 && menores <= 20)) errores.menores = 'Revisá la cantidad de menores.';
    var nombre = (datos.nombre || '').trim();
    if (nombre.length < 2) errores.nombre = 'Escribí tu nombre.';
    var noches = desde && hasta && hasta > desde ? Math.round((hasta - desde) / MS_DIA) : 0;
    return { errores: errores, noches: noches, adultos: adultos, menores: isNaN(menores) ? 0 : menores, nombre: nombre };
  }

  
  function armarMensaje(datos, complejo) {
    var v = validar(datos, new Date(0));
    var huespedes = plural(v.adultos, 'adulto', 'adultos');
    if (v.menores > 0) huespedes += ' y ' + plural(v.menores, 'menor', 'menores');
    var texto = '¡Hola, ' + complejo + '! Soy ' + v.nombre + '. ' +
      'Quiero consultar disponibilidad del ' + formatear(aFecha(datos.ingreso)) +
      ' al ' + formatear(aFecha(datos.egreso)) + ' (' + plural(v.noches, 'noche', 'noches') + ') ' +
      'para ' + huespedes + '.';
    var comentario = (datos.comentario || '').trim();
    if (comentario) texto += '\n' + comentario;
    texto += '\n¿Tienen lugar y cuál sería la tarifa? ¡Gracias!';
    return texto;
  }

  function armarEnlace(numero, mensaje) {
    return 'https://wa.me/' + String(numero).replace(/\D/g, '') + '?text=' + encodeURIComponent(mensaje);
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validar: validar, armarMensaje: armarMensaje, armarEnlace: armarEnlace, aFecha: aFecha, AVISO_DEMO: AVISO_DEMO };
    return;
  }

  function iniciar() {
    var form = document.getElementById('form-reserva');
    if (!form) return;
    var numero = form.getAttribute('data-whatsapp');
    var complejo = form.getAttribute('data-complejo') || 'Complejo';
    var resumen = form.querySelector('[data-resumen-errores]');
    var aviso = document.querySelector('[data-aviso-demo]');
    var campos = ['ingreso', 'egreso', 'adultos', 'menores', 'nombre'];

    var ingreso = form.elements.ingreso, egreso = form.elements.egreso;
    ingreso.min = aValorFecha(hoy());
    function ajustarMinimoSalida() {
      var d = aFecha(ingreso.value);
      var base = d || hoy();
      egreso.min = aValorFecha(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1));
    }
    ingreso.addEventListener('change', ajustarMinimoSalida);
    ajustarMinimoSalida();

    Array.prototype.forEach.call(document.querySelectorAll('[data-fechas]'), function (boton) {
      boton.addEventListener('click', function () {
        var f = boton.getAttribute('data-fechas').split(',');
        ingreso.value = f[0]; egreso.value = f[1];
        ajustarMinimoSalida();
        form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        form.elements.nombre.focus({ preventScroll: true });
      });
    });

    function leer() {
      var d = {};
      ['ingreso', 'egreso', 'adultos', 'menores', 'nombre', 'comentario'].forEach(function (n) {
        d[n] = form.elements[n] ? form.elements[n].value : '';
      });
      return d;
    }

    function mostrarErrores(errores) {
      campos.forEach(function (n) {
        var campo = form.elements[n];
        var aviso = document.getElementById('error-' + n);
        if (!campo) return;
        if (errores[n]) {
          campo.setAttribute('aria-invalid', 'true');
          if (aviso) { aviso.textContent = errores[n]; aviso.hidden = false; }
        } else {
          campo.removeAttribute('aria-invalid');
          if (aviso) { aviso.textContent = ''; aviso.hidden = true; }
        }
      });
      var claves = Object.keys(errores);
      if (resumen) {
        resumen.textContent = claves.length ? 'Revisá ' + (claves.length === 1 ? 'un dato' : claves.length + ' datos') + ' del formulario.' : '';
        resumen.hidden = !claves.length;
      }
      if (claves.length) form.elements[campos.filter(function (n) { return errores[n]; })[0]].focus();
    }

    campos.forEach(function (n) {
      var campo = form.elements[n];
      if (campo) campo.addEventListener('input', function () {
        if (campo.getAttribute('aria-invalid') === 'true' && !validar(leer()).errores[n]) {
          campo.removeAttribute('aria-invalid');
          var aviso = document.getElementById('error-' + n);
          if (aviso) { aviso.textContent = ''; aviso.hidden = true; }
        }
      });
    });

    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var datos = leer();
      var r = validar(datos);
      mostrarErrores(r.errores);
      if (Object.keys(r.errores).length) return;
      var mensaje = armarMensaje(datos, complejo);
      if (!numero) {
        if (aviso) {
          aviso.textContent = '';
          var titulo = document.createElement('p');
          titulo.className = 'aviso-titulo';
          titulo.textContent = AVISO_DEMO;
          var bajada = document.createElement('p');
          bajada.textContent = 'Así se vería el mensaje:';
          var previa = document.createElement('blockquote');
          previa.className = 'aviso-mensaje';
          previa.style.whiteSpace = 'pre-line';
          previa.textContent = mensaje;
          aviso.appendChild(titulo); aviso.appendChild(bajada); aviso.appendChild(previa);
          var reducir = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
          aviso.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'nearest' });
        }
        return;
      }
      var ventana = window.open(armarEnlace(numero, mensaje), '_blank');
      if (ventana) ventana.opener = null;
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
