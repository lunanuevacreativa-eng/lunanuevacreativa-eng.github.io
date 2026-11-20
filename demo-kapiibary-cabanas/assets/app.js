(function () {
  'use strict';
  var WA = '5493546530290';

  // Header sólido al scrollear
  var top = document.getElementById('top');
  function onScroll() { top.classList.toggle('is-solid', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Menú móvil
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }
  });

  // Aparición suave
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('is-in'); }); }

  // Galería con visor
  var links = Array.prototype.slice.call(document.querySelectorAll('#gallery a'));
  var lb = document.getElementById('lb'), lbImg = document.getElementById('lbImg'), idx = 0;
  function show(i) {
    idx = (i + links.length) % links.length;
    lbImg.src = links[idx].getAttribute('href');
    lbImg.alt = links[idx].querySelector('img').alt;
  }
  links.forEach(function (a, i) {
    a.addEventListener('click', function (e) { e.preventDefault(); show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; });
  });
  function close() { lb.hidden = true; document.body.style.overflow = ''; }
  document.getElementById('lbClose').addEventListener('click', close);
  document.getElementById('lbPrev').addEventListener('click', function () { show(idx - 1); });
  document.getElementById('lbNext').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  // Formulario de consulta
  var ad = document.getElementById('adultos'), me = document.getElementById('menores');
  for (var i = 1; i <= 8; i++) ad.add(new Option(String(i), String(i), i === 2, i === 2));
  for (var j = 0; j <= 7; j++) me.add(new Option(String(j), String(j)));

  var llegada = document.getElementById('llegada'), salida = document.getElementById('salida');
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var hoy = new Date();
  llegada.min = iso(hoy);
  salida.min = iso(new Date(hoy.getTime() + 864e5));
  llegada.addEventListener('change', function () {
    if (!llegada.value) return;
    var p = llegada.value.split('-');
    var sig = new Date(+p[0], +p[1] - 1, +p[2] + 1);
    salida.min = iso(sig);
    if (!salida.value || salida.value <= llegada.value) salida.value = iso(sig);
  });

  // Botones "Consultar esta cabaña"
  var tipo = document.getElementById('tipo');
  document.querySelectorAll('.chip[data-tipo]').forEach(function (b) {
    b.addEventListener('click', function () {
      tipo.value = b.getAttribute('data-tipo');
      document.getElementById('consulta').scrollIntoView({ behavior: 'smooth' });
      setTimeout(function () { llegada.focus({ preventScroll: true }); }, 700);
    });
  });

  function fmt(v) { var p = v.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
  var err = document.getElementById('error');
  document.getElementById('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var nombre = document.getElementById('nombre').value.trim();
    err.textContent = '';
    if (!llegada.value || !salida.value) { err.textContent = 'Elegí las fechas de llegada y salida.'; return; }
    if (salida.value <= llegada.value) { err.textContent = 'La fecha de salida tiene que ser posterior a la llegada.'; return; }
    if (!nombre) { err.textContent = 'Contanos tu nombre.'; document.getElementById('nombre').focus(); return; }
    var p1 = llegada.value.split('-'), p2 = salida.value.split('-');
    var noches = Math.round((new Date(+p2[0], +p2[1] - 1, +p2[2]) - new Date(+p1[0], +p1[1] - 1, +p1[2])) / 864e5);
    var a = +ad.value, m = +me.value;
    var lineas = [
      '¡Hola, Kapiibary! Soy ' + nombre + ' y quiero consultar disponibilidad:',
      '• Llegada: ' + fmt(llegada.value),
      '• Salida: ' + fmt(salida.value) + ' (' + noches + (noches === 1 ? ' noche)' : ' noches)'),
      '• Personas: ' + a + (a === 1 ? ' adulto' : ' adultos') + (m ? ' y ' + m + (m === 1 ? ' menor' : ' menores') : ''),
      '• Cabaña: ' + tipo.value
    ];
    if (document.getElementById('mascota').checked) lineas.push('• Viajo con mascota');
    var c = document.getElementById('comentario').value.trim();
    if (c) lineas.push('• Comentario: ' + c);
    lineas.push('¡Gracias!');
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lineas.join('\n')), '_blank', 'noopener');
  });
})();
