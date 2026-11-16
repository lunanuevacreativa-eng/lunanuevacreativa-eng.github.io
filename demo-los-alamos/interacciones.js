(function () {
  'use strict';
  document.documentElement.classList.add('js');
  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var bloques = document.querySelectorAll('.revelar');
  if (reducir || !('IntersectionObserver' in window)) {
    bloques.forEach(function (b) { b.classList.add('visible'); });
  } else {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); observador.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    bloques.forEach(function (b) { observador.observe(b); });
  }

  var cuenta = document.querySelector('[data-cuenta-regresiva]');
  if (cuenta) {
    var p = cuenta.getAttribute('data-cuenta-regresiva').split('-');
    var fiesta = new Date(+p[0], +p[1] - 1, +p[2]);
    var h = new Date(); var hoy = new Date(h.getFullYear(), h.getMonth(), h.getDate());
    var dias = Math.round((fiesta - hoy) / 86400000);
    if (dias > 1) cuenta.textContent = 'Faltan ' + dias + ' días';
    else if (dias === 1) cuenta.textContent = 'Falta 1 día';
  }

  var botonMenu = document.querySelector('.menu-boton');
  var navMenu = document.getElementById('menu-principal');
  var etiquetaMenu = botonMenu ? botonMenu.querySelector('.menu-boton__etiqueta') : null;
  var encabezado = document.querySelector('.encabezado');
  var consultaMovil = window.matchMedia('(max-width: 899px)');

  function menuAbierto() {
    return document.body.classList.contains('menu-abierto');
  }

  function posicionarMenu() {
    if (!encabezado) return;
    document.documentElement.style.setProperty('--menu-top', Math.round(encabezado.getBoundingClientRect().bottom) + 'px');
  }

  function cerrarMenu() {
    if (!botonMenu) return;
    document.body.classList.remove('menu-abierto');
    botonMenu.setAttribute('aria-expanded', 'false');
    if (etiquetaMenu) etiquetaMenu.textContent = 'Abrir menú';
  }

  function abrirMenu() {
    if (!botonMenu) return;
    posicionarMenu();
    document.body.classList.add('menu-abierto');
    botonMenu.setAttribute('aria-expanded', 'true');
    if (etiquetaMenu) etiquetaMenu.textContent = 'Cerrar menú';
  }

  if (botonMenu && navMenu) {
    botonMenu.addEventListener('click', function () {
      if (menuAbierto()) cerrarMenu();
      else abrirMenu();
    });

    navMenu.querySelectorAll('a').forEach(function (enlace) {
      enlace.addEventListener('click', cerrarMenu);
    });

    var marca = document.querySelector('.marca a');
    if (marca) marca.addEventListener('click', cerrarMenu);

    document.addEventListener('keydown', function (e) {
      if (!menuAbierto()) return;
      if (e.key === 'Escape') {
        cerrarMenu();
        botonMenu.focus();
        return;
      }
      if (e.key !== 'Tab') return;
      var focables = [botonMenu].concat(Array.prototype.slice.call(navMenu.querySelectorAll('a')));
      var i = focables.indexOf(document.activeElement);
      if (e.shiftKey) {
        if (i <= 0) { e.preventDefault(); focables[focables.length - 1].focus(); }
      } else if (i === focables.length - 1) {
        e.preventDefault();
        focables[0].focus();
      }
    });

    window.addEventListener('resize', function () {
      if (consultaMovil.matches && menuAbierto()) posicionarMenu();
    });
    window.addEventListener('scroll', function () {
      if (consultaMovil.matches && menuAbierto()) posicionarMenu();
    }, { passive: true });

    if (consultaMovil.addEventListener) {
      consultaMovil.addEventListener('change', function (mq) {
        if (!mq.matches) cerrarMenu();
      });
    } else if (consultaMovil.addListener) {
      consultaMovil.addListener(function (mq) {
        if (!mq.matches) cerrarMenu();
      });
    }
  }

})();
