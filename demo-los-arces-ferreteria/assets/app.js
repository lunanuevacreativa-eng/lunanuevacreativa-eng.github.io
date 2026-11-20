(function(){
  var WA = '5493492373953';
  function linkWA(texto){ return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(texto); }

  // Rubros tomados de la descripción pública de Los Arces
  var rubros = [
    {id:'hogar-jardin', grupo:'hogar', ico:'c-jardin', nombre:'Hogar y jardín', texto:'Productos para el cuidado del hogar y el jardín, para mantener todo en orden en cada temporada.'},
    {id:'buloneria', grupo:'obra', ico:'c-bulon', nombre:'Bulonería y tornillería', texto:'Bulones, tornillos y fijaciones para cada trabajo. Consultá por medida y cantidad.'},
    {id:'plomeria', grupo:'obra', ico:'c-plomeria', nombre:'Plomería', texto:'Artículos de plomería para instalaciones, arreglos y mantenimiento.'},
    {id:'pintureria', grupo:'hogar', ico:'c-pintura', nombre:'Pinturería', texto:'Pinturas y accesorios para renovar ambientes, aberturas y superficies.'},
    {id:'electricidad', grupo:'obra', ico:'c-electricidad', nombre:'Electricidad', texto:'Materiales eléctricos para la casa, la obra y el taller.'},
    {id:'construccion', grupo:'obra', ico:'c-construccion', nombre:'Construcción', texto:'Materiales y herramientas para la obra, de la base a la terminación.'},
    {id:'herreria-carpinteria', grupo:'herramientas', ico:'c-carpinteria', nombre:'Herrería y carpintería', texto:'Todo lo necesario para trabajar el hierro y la madera.'},
    {id:'electricas', grupo:'herramientas', ico:'c-taladro', nombre:'Herramientas eléctricas', texto:'Herramientas eléctricas e inalámbricas, con marcas como Einhell, Bosch y Stihl.'},
    {id:'mano-repuestos', grupo:'herramientas', ico:'c-llave', nombre:'Herramientas de mano y repuestos', texto:'Herramientas de mano y repuestos para que tus equipos sigan funcionando.'}
  ];

  // Catálogo
  var grilla = document.getElementById('grilla');
  grilla.innerHTML = rubros.map(function(r){
    var msg = 'Hola Los Arces, quisiera consultar por productos de ' + r.nombre.toLowerCase() + '.';
    return '<article class="cat revelar" data-grupo="' + r.grupo + '">' +
      '<div class="ico"><svg><use href="#' + r.ico + '"/></svg></div>' +
      '<h3>' + r.nombre + '</h3><p>' + r.texto + '</p>' +
      '<a class="consultar" href="' + linkWA(msg) + '" target="_blank" rel="noopener">Consultar por WhatsApp <svg width="18" height="18"><use href="#i-flecha"/></svg></a>' +
      '</article>';
  }).join('');

  // Filtros
  var filtros = document.querySelectorAll('.filtro');
  filtros.forEach(function(b){
    b.addEventListener('click', function(){
      var f = b.getAttribute('data-filtro');
      filtros.forEach(function(x){ x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      grilla.querySelectorAll('.cat').forEach(function(c){
        c.hidden = !(f === 'todos' || c.getAttribute('data-grupo') === f);
      });
    });
  });

  // Botones de destacados
  document.querySelectorAll('[data-wa]').forEach(function(a){
    a.href = linkWA(a.getAttribute('data-wa'));
    a.target = '_blank'; a.rel = 'noopener';
  });

  // Formulario de pedido
  var sel = document.getElementById('rubro');
  sel.innerHTML = '<option value="">Elegí un rubro</option>' + rubros.map(function(r){ return '<option>' + r.nombre + '</option>'; }).join('') + '<option>Otro / no estoy seguro</option>';
  var prod = document.getElementById('producto'), cant = document.getElementById('cantidad'), nom = document.getElementById('nombre'), vista = document.getElementById('vista');
  function armar(){
    var t = 'Hola Los Arces';
    if (nom.value.trim()) t += ', soy ' + nom.value.trim();
    t += '. Quisiera consultar';
    if (prod.value.trim()) t += ' por ' + prod.value.trim();
    var c = parseInt(cant.value, 10);
    if (c > 1) t += ' (cantidad: ' + c + ')';
    if (sel.value) t += ', del rubro ' + sel.value.toLowerCase();
    t += '. ¿Tienen disponibilidad?';
    return t;
  }
  function pintar(){ vista.innerHTML = '<span>Así va a llegar tu mensaje</span>'; vista.appendChild(document.createTextNode(armar())); }
  [sel, prod, cant, nom].forEach(function(el){ el.addEventListener('input', pintar); });
  pintar();
  document.getElementById('formPedido').addEventListener('submit', function(e){
    e.preventDefault();
    if (!prod.value.trim()) { prod.focus(); prod.setAttribute('placeholder', 'Contanos qué producto o trabajo necesitás'); return; }
    window.open(linkWA(armar()), '_blank', 'noopener');
  });

  // Menú móvil
  var btn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
  btn.addEventListener('click', function(){
    var abierto = nav.classList.toggle('abierta');
    btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    btn.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ nav.classList.remove('abierta'); btn.setAttribute('aria-expanded','false'); }); });

  // Aparición al hacer scroll
  var els = document.querySelectorAll('.revelar');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entradas){
      entradas.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); } });
    }, {threshold: .12});
    els.forEach(function(el){ io.observe(el); });
  } else { els.forEach(function(el){ el.classList.add('visible'); }); }
})();
