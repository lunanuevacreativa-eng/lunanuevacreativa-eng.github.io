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

})();
