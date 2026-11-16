(function () {
  'use strict';

  var MS_DIA = 86400000;
  var AVISO_DEMO = 'En la web final, esta consulta llega directo al WhatsApp del complejo';
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  var DIAS_CORTOS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do'];
  var DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  var MESES_ADELANTE = 17;

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

  function sumarDias(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function inicioMes(d) { return new Date(d.getFullYear(), d.getMonth(), 1); }
  function sumarMeses(d, n) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }
  function mismoDia(a, b) { return !!a && !!b && a.getTime() === b.getTime(); }
  function indiceMes(d) { return d.getFullYear() * 12 + d.getMonth(); }
  function diaLunesPrimero(d) { return (d.getDay() + 6) % 7; }

  function fechaLarga(d) {
    return DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear();
  }

  function fechaResumen(d) {
    var texto = DIAS[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES[d.getMonth()];
    return d.getFullYear() !== hoy().getFullYear() ? texto + ' de ' + d.getFullYear() : texto;
  }

  function plural(n, uno, varios) { return n + ' ' + (n === 1 ? uno : varios); }

  function validar(datos, referencia) {
    var errores = {};
    var desde = aFecha(datos.ingreso);
    var hasta = aFecha(datos.egreso);
    var base = referencia || hoy();
    if (!desde) errores.ingreso = 'Elegí en el calendario el día de llegada.';
    else if (desde < base) errores.ingreso = 'La fecha de llegada no puede ser anterior a hoy.';
    if (!hasta) errores.egreso = 'Elegí en el calendario el día de salida.';
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

  function crear(etiqueta, clase, texto) {
    var el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto != null) el.textContent = texto;
    return el;
  }

  function Calendario(raiz, alCambiar) {
    var self = this;
    var minimo = hoy();
    var maximo = new Date(minimo.getFullYear(), minimo.getMonth() + MESES_ADELANTE + 1, 0);
    var contenedor = raiz.querySelector('[data-cal-meses]');
    var periodo = raiz.querySelector('[data-cal-periodo]');
    var resumen = raiz.querySelector('[data-cal-resumen]');
    var anterior = raiz.querySelector('[data-cal-anterior]');
    var siguiente = raiz.querySelector('[data-cal-siguiente]');
    var borrar = raiz.querySelector('[data-cal-borrar]');
    var dosMeses = window.matchMedia('(min-width: 1100px)');

    var estado = { inicio: null, fin: null, vista: inicioMes(minimo), foco: minimo };

    function cantidad() { return dosMeses.matches ? 2 : 1; }

    function acotar(d) {
      if (d < minimo) return minimo;
      if (d > maximo) return maximo;
      return d;
    }

    function asegurarVisible(d) {
      var n = cantidad();
      var primero = indiceMes(estado.vista);
      var buscado = indiceMes(d);
      if (buscado < primero) estado.vista = inicioMes(d);
      else if (buscado > primero + n - 1) estado.vista = sumarMeses(inicioMes(d), -(n - 1));
      if (indiceMes(estado.vista) < indiceMes(minimo)) estado.vista = inicioMes(minimo);
    }

    function textoPeriodo() {
      var a = estado.vista;
      if (cantidad() === 1) return MESES[a.getMonth()] + ' de ' + a.getFullYear();
      var b = sumarMeses(a, 1);
      if (a.getFullYear() === b.getFullYear()) return MESES[a.getMonth()] + ' y ' + MESES[b.getMonth()] + ' de ' + a.getFullYear();
      return MESES[a.getMonth()] + ' de ' + a.getFullYear() + ' y ' + MESES[b.getMonth()] + ' de ' + b.getFullYear();
    }

    function etiquetaDia(d, pasado) {
      var partes = [fechaLarga(d)];
      if (mismoDia(d, minimo)) partes.push('hoy');
      if (mismoDia(d, estado.inicio)) partes.push('llegada');
      else if (mismoDia(d, estado.fin)) partes.push('salida');
      else if (estado.inicio && estado.fin && d > estado.inicio && d < estado.fin) partes.push('dentro de la estadía');
      if (pasado) partes.push('no disponible');
      return partes.join(', ');
    }

    function dibujarMes(mes, indice) {
      var bloque = crear('div', 'calendario__mes');
      var idTitulo = 'calendario-mes-' + indice;
      var titulo = crear('p', 'calendario__mes-titulo', MESES[mes.getMonth()] + ' de ' + mes.getFullYear());
      titulo.id = idTitulo;
      bloque.appendChild(titulo);

      var tabla = crear('table', 'calendario__tabla');
      tabla.setAttribute('aria-labelledby', idTitulo);
      var cabeza = crear('thead');
      var filaCabeza = crear('tr');
      DIAS_CORTOS.forEach(function (corto, i) {
        var th = crear('th');
        th.scope = 'col';
        var abbr = crear('abbr', null, corto);
        abbr.title = DIAS_SEMANA[i];
        th.appendChild(abbr);
        filaCabeza.appendChild(th);
      });
      cabeza.appendChild(filaCabeza);
      tabla.appendChild(cabeza);

      var cuerpo = crear('tbody');
      var desplazamiento = diaLunesPrimero(mes);
      var diasDelMes = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).getDate();
      var fila = crear('tr');
      for (var v = 0; v < desplazamiento; v++) fila.appendChild(crear('td', 'calendario__vacio'));
      for (var dia = 1; dia <= diasDelMes; dia++) {
        var d = new Date(mes.getFullYear(), mes.getMonth(), dia);
        var celda = crear('td');
        var boton = crear('button', 'calendario__dia', String(dia));
        boton.type = 'button';
        boton.setAttribute('data-fecha', aValorFecha(d));
        var pasado = d < minimo || d > maximo;
        var esInicio = mismoDia(d, estado.inicio);
        var esFin = mismoDia(d, estado.fin);
        var enRango = estado.inicio && estado.fin && d > estado.inicio && d < estado.fin;
        if (pasado) { boton.disabled = true; boton.classList.add('es-pasado'); }
        if (mismoDia(d, minimo)) { boton.classList.add('es-hoy'); boton.setAttribute('aria-current', 'date'); }
        if (esInicio) { boton.classList.add('es-inicio'); celda.classList.add('celda-inicio'); }
        if (esFin) { boton.classList.add('es-fin'); celda.classList.add('celda-fin'); }
        if (enRango) { boton.classList.add('en-rango'); celda.classList.add('celda-rango'); }
        if (estado.inicio && estado.fin) celda.classList.add('con-rango');
        boton.setAttribute('aria-pressed', esInicio || esFin || enRango ? 'true' : 'false');
        boton.setAttribute('aria-label', etiquetaDia(d, pasado));
        boton.tabIndex = mismoDia(d, estado.foco) ? 0 : -1;
        celda.appendChild(boton);
        fila.appendChild(celda);
        if (diaLunesPrimero(d) === 6) { cuerpo.appendChild(fila); fila = crear('tr'); }
      }
      if (fila.children.length) {
        while (fila.children.length < 7) fila.appendChild(crear('td', 'calendario__vacio'));
        cuerpo.appendChild(fila);
      }
      tabla.appendChild(cuerpo);
      bloque.appendChild(tabla);
      return bloque;
    }

    function dibujar(enfocar) {
      var n = cantidad();
      if (indiceMes(estado.foco) < indiceMes(estado.vista) || indiceMes(estado.foco) > indiceMes(estado.vista) + n - 1) {
        var candidato = estado.inicio && indiceMes(estado.inicio) >= indiceMes(estado.vista) && indiceMes(estado.inicio) <= indiceMes(estado.vista) + n - 1 ? estado.inicio : estado.vista;
        estado.foco = acotar(candidato);
      }
      contenedor.textContent = '';
      contenedor.classList.toggle('calendario__meses--dos', n === 2);
      for (var i = 0; i < n; i++) contenedor.appendChild(dibujarMes(sumarMeses(estado.vista, i), i));
      periodo.textContent = textoPeriodo();
      anterior.disabled = indiceMes(estado.vista) <= indiceMes(minimo);
      siguiente.disabled = indiceMes(estado.vista) + n - 1 >= indiceMes(maximo);

      var noches = estado.inicio && estado.fin ? Math.round((estado.fin - estado.inicio) / MS_DIA) : 0;
      resumen.textContent = 'Llegada: ' + (estado.inicio ? fechaResumen(estado.inicio) : 'sin elegir') +
        ' · Salida: ' + (estado.fin ? fechaResumen(estado.fin) : 'sin elegir') +
        ' · ' + plural(noches, 'noche', 'noches');
      borrar.disabled = !estado.inicio;

      if (enfocar) {
        var activo = contenedor.querySelector('[data-fecha="' + aValorFecha(estado.foco) + '"]');
        if (activo) activo.focus();
      }
    }

    function avisar() {
      alCambiar(estado.inicio ? aValorFecha(estado.inicio) : '', estado.fin ? aValorFecha(estado.fin) : '');
    }

    function elegir(d) {
      if (!estado.inicio || estado.fin || d <= estado.inicio) {
        estado.inicio = d;
        estado.fin = null;
      } else {
        estado.fin = d;
      }
      estado.foco = d;
      dibujar(true);
      avisar();
    }

    contenedor.addEventListener('click', function (e) {
      var boton = e.target.closest('.calendario__dia');
      if (!boton || boton.disabled) return;
      elegir(aFecha(boton.getAttribute('data-fecha')));
    });

    contenedor.addEventListener('keydown', function (e) {
      var boton = e.target.closest('.calendario__dia');
      if (!boton) return;
      var actual = aFecha(boton.getAttribute('data-fecha'));
      var destino = null;
      switch (e.key) {
        case 'ArrowLeft': destino = sumarDias(actual, -1); break;
        case 'ArrowRight': destino = sumarDias(actual, 1); break;
        case 'ArrowUp': destino = sumarDias(actual, -7); break;
        case 'ArrowDown': destino = sumarDias(actual, 7); break;
        case 'Home': destino = sumarDias(actual, -diaLunesPrimero(actual)); break;
        case 'End': destino = sumarDias(actual, 6 - diaLunesPrimero(actual)); break;
        case 'PageUp': destino = new Date(actual.getFullYear(), actual.getMonth() - 1, Math.min(actual.getDate(), new Date(actual.getFullYear(), actual.getMonth(), 0).getDate())); break;
        case 'PageDown': destino = new Date(actual.getFullYear(), actual.getMonth() + 1, Math.min(actual.getDate(), new Date(actual.getFullYear(), actual.getMonth() + 2, 0).getDate())); break;
        default: return;
      }
      e.preventDefault();
      estado.foco = acotar(destino);
      asegurarVisible(estado.foco);
      dibujar(true);
    });

    anterior.addEventListener('click', function () {
      estado.vista = sumarMeses(estado.vista, -1);
      dibujar(false);
    });
    siguiente.addEventListener('click', function () {
      estado.vista = sumarMeses(estado.vista, 1);
      dibujar(false);
    });
    borrar.addEventListener('click', function () {
      estado.inicio = null; estado.fin = null;
      dibujar(false);
      avisar();
      var activo = contenedor.querySelector('.calendario__dia[tabindex="0"]');
      if (activo) activo.focus();
    });

    var alCambiarMedida = function () { asegurarVisible(estado.foco); dibujar(false); };
    if (dosMeses.addEventListener) dosMeses.addEventListener('change', alCambiarMedida);
    else if (dosMeses.addListener) dosMeses.addListener(alCambiarMedida);

    self.fijar = function (valorInicio, valorFin) {
      var a = aFecha(valorInicio), b = aFecha(valorFin);
      if (!a || a < minimo) return;
      estado.inicio = a;
      estado.fin = b && b > a ? b : null;
      estado.foco = a;
      estado.vista = inicioMes(a);
      dibujar(false);
      avisar();
    };
    self.enfocar = function () {
      var activo = contenedor.querySelector('.calendario__dia[tabindex="0"]');
      if (activo) activo.focus();
    };

    dibujar(false);
  }

  function iniciar() {
    var form = document.getElementById('form-reserva');
    if (!form) return;
    var complejo = form.getAttribute('data-complejo') || 'Complejo';
    var resumen = form.querySelector('[data-resumen-errores]');
    var aviso = document.querySelector('[data-aviso-demo]');
    var raizCalendario = form.querySelector('[data-calendario]');
    var campos = ['ingreso', 'egreso', 'adultos', 'menores', 'nombre'];
    var fechas = { ingreso: true, egreso: true };

    function leer() {
      var d = {};
      ['ingreso', 'egreso', 'adultos', 'menores', 'nombre', 'comentario'].forEach(function (n) {
        d[n] = form.elements[n] ? form.elements[n].value : '';
      });
      return d;
    }

    function marcar(n, mensaje) {
      var campo = form.elements[n];
      var salida = document.getElementById('error-' + n);
      if (salida) { salida.textContent = mensaje || ''; salida.hidden = !mensaje; }
      if (fechas[n]) {
        var conError = !!(document.getElementById('error-ingreso').textContent || document.getElementById('error-egreso').textContent);
        raizCalendario.classList.toggle('calendario--error', conError);
      } else if (campo) {
        if (mensaje) campo.setAttribute('aria-invalid', 'true');
        else campo.removeAttribute('aria-invalid');
      }
    }

    var calendario = new Calendario(raizCalendario, function (inicio, fin) {
      form.elements.ingreso.value = inicio;
      form.elements.egreso.value = fin;
      var errores = validar(leer()).errores;
      ['ingreso', 'egreso'].forEach(function (n) {
        if (document.getElementById('error-' + n).textContent && !errores[n]) marcar(n, '');
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-fechas]'), function (boton) {
      boton.addEventListener('click', function () {
        var f = boton.getAttribute('data-fechas').split(',');
        calendario.fijar(f[0], f[1]);
        raizCalendario.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
        form.elements.nombre.focus({ preventScroll: true });
      });
    });

    function mostrarErrores(errores) {
      campos.forEach(function (n) { marcar(n, errores[n]); });
      var claves = Object.keys(errores);
      if (resumen) {
        resumen.textContent = claves.length ? 'Revisá ' + (claves.length === 1 ? 'un dato' : claves.length + ' datos') + ' del formulario.' : '';
        resumen.hidden = !claves.length;
      }
      if (!claves.length) return;
      var primero = campos.filter(function (n) { return errores[n]; })[0];
      if (fechas[primero]) calendario.enfocar();
      else form.elements[primero].focus();
    }

    ['adultos', 'menores', 'nombre'].forEach(function (n) {
      var campo = form.elements[n];
      if (campo) campo.addEventListener('input', function () {
        if (campo.getAttribute('aria-invalid') === 'true' && !validar(leer()).errores[n]) marcar(n, '');
      });
    });

    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var datos = leer();
      var r = validar(datos);
      mostrarErrores(r.errores);
      if (Object.keys(r.errores).length || !aviso) return;
      aviso.textContent = '';
      aviso.appendChild(crear('p', 'aviso-titulo', AVISO_DEMO));
      aviso.appendChild(crear('p', null, 'Así se vería el mensaje:'));
      var previa = crear('blockquote', 'aviso-mensaje', armarMensaje(datos, complejo));
      aviso.appendChild(previa);
      var reducir = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
      aviso.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'nearest' });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
