(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.documentElement;
  function $(s,c){return (c||document).querySelector(s)}
  function $$(s,c){return [].slice.call((c||document).querySelectorAll(s))}
  var esc=window.PDLC?PDLC.esc:function(s){return s};

  /* loader */
  var done=false;function finish(){if(done)return;done=true;root.classList.add('loaded')}
  window.addEventListener('load',function(){setTimeout(finish,350)});setTimeout(finish,1800);

  /* toast */
  var toastEl=$('#toast'),tt;function toast(m){toastEl.textContent=m;toastEl.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toastEl.classList.remove('show')},3200)}

  /* nav + fab */
  var nav=$('#nav'),fab=$('.fab');
  function onScroll(){var y=window.scrollY;nav.classList.toggle('is-solid',y>40);if(fab)fab.classList.toggle('show',y>window.innerHeight*.8)}
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  var tg=$('.nav__toggle'),mm=$('#menu-movil');
  tg.addEventListener('click',function(){var o=tg.getAttribute('aria-expanded')==='true';tg.setAttribute('aria-expanded',String(!o));mm.hidden=o;nav.classList.add('is-solid')});
  $$('a',mm).forEach(function(a){a.addEventListener('click',function(){tg.setAttribute('aria-expanded','false');mm.hidden=true})});

  /* reveal: chequeo por posición (robusto con clip-path, saltos de ancla y scroll rápido) */
  var pend=$$('[data-anim]');
  if(!reduce){
    pend.forEach(function(el){var sib=el.parentElement?[].indexOf.call(el.parentElement.children,el):0;el.style.transitionDelay=Math.min(sib,5)*90+'ms'});
    var rq=false;
    function reveal(){rq=false;var lim=window.innerHeight*.94;pend=pend.filter(function(el){if(el.getBoundingClientRect().top<lim){el.classList.add('in');return false}return true});if(!pend.length){window.removeEventListener('scroll',onRv);window.removeEventListener('resize',onRv)}}
    function onRv(){if(!rq){rq=true;requestAnimationFrame(reveal)}}
    window.addEventListener('scroll',onRv,{passive:true});window.addEventListener('resize',onRv);window.addEventListener('load',onRv);reveal();
  } else pend.forEach(function(el){el.classList.add('in')});

  /* parallax */
  var px=$$('[data-speed]');
  if(!reduce&&px.length){
    var ticking=false;
    function upd(){var vh=window.innerHeight;px.forEach(function(el){var r=el.parentElement.getBoundingClientRect();if(r.bottom<-200||r.top>vh+200)return;var c=(r.top+r.height/2-vh/2);el.style.transform='translate3d(0,'+(c*parseFloat(el.dataset.speed)).toFixed(1)+'px,0)'});ticking=false}
    window.addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(upd)}},{passive:true});upd();
  }

  /* hero slides */
  var slides=$$('.hero__slide'),si=0;
  if(slides.length>1&&!reduce){setInterval(function(){slides[si].classList.remove('is-on');si=(si+1)%slides.length;slides[si].classList.add('is-on')},6500)}

  /* embers */
  var em=$('.embers');
  if(em&&!reduce){for(var i=0;i<30;i++){var s=document.createElement('i');s.style.left=(Math.random()*100)+'%';s.style.setProperty('--dx',(Math.random()*140-70)+'px');s.style.animationDuration=(7+Math.random()*9)+'s';s.style.animationDelay=(-Math.random()*14)+'s';var z=1+Math.random()*2.6;s.style.width=s.style.height=z+'px';em.appendChild(s)}}

  /* magnetic buttons (desktop) */
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce){
    $$('.btn--gold').forEach(function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.transform='translate('+((e.clientX-r.left-r.width/2)*.12)+'px,'+((e.clientY-r.top-r.height/2)*.2)+'px)'});
      b.addEventListener('mouseleave',function(){b.style.transform=''});
    });
  }

  /* lightbox */
  var items=$$('.gal__item,[data-lb]'),lb=$('#lb'),lbImg=$('img',lb),cap=$('figcaption',lb),idx=0,last;
  function show(i){idx=(i+items.length)%items.length;var a=items[idx];lbImg.src=a.getAttribute('href');lbImg.alt=$('img',a).alt;cap.textContent=a.dataset.cap||''}
  function openLb(i){last=document.activeElement;show(i);lb.hidden=false;document.body.style.overflow='hidden';$('.lb__close',lb).focus()}
  function closeLb(){lb.hidden=true;document.body.style.overflow='';if(last)last.focus()}
  items.forEach(function(a,i){a.addEventListener('click',function(e){e.preventDefault();openLb(i)})});
  $('.lb__close',lb).addEventListener('click',closeLb);
  $('.lb__prev',lb).addEventListener('click',function(){show(idx-1)});
  $('.lb__next',lb).addEventListener('click',function(){show(idx+1)});
  lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
  var x0=null;lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)show(idx+(dx<0?1:-1));x0=null});

  /* modal */
  var gm=$('#gift-modal'),gmLast;
  function openModal(){gmLast=document.activeElement;gm.hidden=false;document.body.style.overflow='hidden';requestAnimationFrame(function(){gm.classList.add('open')});$('.modal__ok',gm).focus({preventScroll:true});$('.modal__box',gm).scrollTop=0}
  function closeModal(){gm.classList.remove('open');gm.hidden=true;document.body.style.overflow='';if(gmLast)gmLast.focus()}
  $('.modal__x',gm).addEventListener('click',closeModal);$('.modal__ok',gm).addEventListener('click',closeModal);
  gm.addEventListener('click',function(e){if(e.target===gm)closeModal()});
  document.addEventListener('keydown',function(e){
    if(!gm.hidden&&e.key==='Escape')closeModal();
    if(!lb.hidden){if(e.key==='Escape')closeLb();if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1)}
  });

  /* carta */
  var cartaData=null;
  function loadCarta(){
    if(!window.PDLC)return;
    PDLC.load('assets/carta.json').then(function(r){
      cartaData=r.data;
      PDLC.render(r.data,$('#carta-tabs'),$('#carta-body'));
      $('#carta-demo-flag').hidden=!r.edited;
      if(r.data.nota)$('#carta-nota').textContent=r.data.nota;
      buildCava(r.data.cava||[]);
    }).catch(function(){$('#carta-body').innerHTML='<p class="mc-empty">No pudimos cargar la carta. <a href="assets/carta-patio-de-la-canada.pdf">Ver la carta en PDF</a>.</p>'});
  }
  $('#carta-reset').addEventListener('click',function(){PDLC.clearOverride();loadCarta();toast('Volviste a la carta original.')});
  window.addEventListener('storage',function(e){if(e.key===PDLC.KEY){loadCarta();toast('La carta se actualizó en vivo.')}});
  loadCarta();

  /* cava: carril de bodegas (robusto, sin 3D) */
  var cavaBuilt=false;
  function money(p){return p?'$ '+String(p).replace(/\B(?=(\d{3})+(?!\d))/g,'.'):''}
  function buildCava(bodegas){
    if(cavaBuilt||!bodegas||!bodegas.length)return;cavaBuilt=true;
    var rail=$('#cava-rail'),detail=$('#cava-detail'),bar=$('#cava-bar'),sel=-1;
    rail.innerHTML=bodegas.map(function(b,i){var v=b.vinos||[];var ch=b.bodega==='Champaña';
      return '<button type="button" class="cvc" role="option" aria-selected="false" data-i="'+i+'"><span class="cvc__in"><span class="cvc__k">'+(ch?'Selección':'Bodega')+'</span><span class="cvc__orn">✦</span><span class="cvc__name">'+esc(b.bodega)+'</span><span class="cvc__rule"></span><span class="cvc__list">'+v.slice(0,3).map(function(w){return '<span>'+esc(w.nombre)+'</span>'}).join('')+'</span><span class="cvc__count">'+v.length+' etiquetas</span></span></button>'}).join('');
    var cards=$$('.cvc',rail);
    function select(i,scroll){
      i=(i+cards.length)%cards.length;if(i===sel&&!scroll)return;sel=i;
      cards.forEach(function(c,j){c.classList.toggle('is-on',j===i);c.setAttribute('aria-selected',j===i?'true':'false')});
      var b=bodegas[i],v=b.vinos||[];
      detail.classList.remove('is-in');void detail.offsetWidth;
      detail.innerHTML='<div class="cd__head"><span class="cd__k">'+(b.bodega==='Champaña'?'Champañas y espumantes':'Bodega')+'</span><h3>'+esc(b.bodega)+'</h3><span class="cd__c">'+v.length+' etiquetas</span></div>'+PDLC.acc('Ver etiquetas y precios',0,'<ul class="cd__list">'+v.map(function(w){return '<li><span class="cd__n">'+esc(w.nombre)+(w.varietal?'<small>'+esc(w.varietal)+'</small>':'')+'</span><span class="cd__p">'+money(w.precio)+'</span></li>'}).join('')+'</ul>');
      detail.classList.add('is-in');
      if(scroll){var c=cards[i];rail.scrollTo({left:c.offsetLeft-(rail.clientWidth-c.offsetWidth)/2,behavior:reduce?'auto':'smooth'})}
    }
    function prog(){var m=rail.scrollWidth-rail.clientWidth;bar.style.width=(m>0?Math.max(8,rail.scrollLeft/m*100):100)+'%'}
    rail.addEventListener('scroll',prog,{passive:true});window.addEventListener('resize',prog);
    /* arrastre con mouse; el dedo usa el scroll nativo */
    var down=false,sx=0,sl=0,moved=false;
    rail.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=rail.scrollLeft;rail.classList.add('grab')});
    window.addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4)moved=true;rail.scrollLeft=sl-dx});
    window.addEventListener('pointerup',function(){if(!down)return;down=false;rail.classList.remove('grab');setTimeout(function(){moved=false},30)});
    rail.addEventListener('dragstart',function(e){e.preventDefault()});
    cards.forEach(function(c,i){c.addEventListener('click',function(e){if(moved){e.preventDefault();return}select(i,true)})});
    rail.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();select(sel+1,true);cards[sel].focus({preventScroll:true})}if(e.key==='ArrowLeft'){e.preventDefault();select(sel-1,true);cards[sel].focus({preventScroll:true})}});
    $('#cava-next').addEventListener('click',function(){select(sel+1,true)});
    $('#cava-prev').addEventListener('click',function(){select(sel-1,true)});
    select(0,false);prog();
  }
  if(window.PDLC_FALLBACK&&window.PDLC_FALLBACK.cava)buildCava(window.PDLC_FALLBACK.cava);

  /* gift card */
  var gf=$('#gift-form'),gc=$('#gcard');
  var titles={parrilla:'Experiencia Parrilla',dos:'Cena para dos',libre:'Regalo a elección'};
  function fmt(v){var d=String(v).replace(/\D/g,'').replace(/^0+/,'').slice(0,9);return d?d.replace(/\B(?=(\d{3})+(?!\d))/g,'.'):''}
  function syncGift(){
    var f=gf.elements,dsg=gf.querySelector('input[name=design]:checked').value;
    gc.dataset.design=dsg;$('#gc-title').textContent=titles[dsg];
    $('#gc-to').textContent=f.to.value.trim()||'—';$('#gc-from').textContent=f.from.value.trim()||'—';
    $('#gc-msg').textContent=f.msg.value.trim()||'Para compartir un gran asado.';
    var a=fmt(f.amount.value);$('#gc-amt').textContent=a?'$ '+a:'A elección';
  }
  gf.addEventListener('input',function(e){if(e.target.name==='amount'){var p=fmt(e.target.value);e.target.value=p}syncGift()});
  gf.addEventListener('change',syncGift);
  gf.addEventListener('submit',function(e){
    e.preventDefault();var f=gf.elements,err=[];
    $$('.field',gf).forEach(function(x){x.classList.remove('bad')});
    function bad(n,m){f[n].closest('.field').classList.add('bad');err.push(m)}
    if(!f.to.value.trim())bad('to','Indicá para quién es.');
    if(!f.from.value.trim())bad('from','Indicá de parte de quién.');
    if(!fmt(f.amount.value))bad('amount','Ingresá el monto que querés regalar.');
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()))bad('email','Revisá el email de entrega.');
    $('#gift-err').textContent=err[0]||'';
    if(err.length){gf.querySelector('.bad input').focus();return}
    var dsg=gf.querySelector('input[name=design]:checked').value;
    $('#gm-sum').innerHTML=[['Diseño',titles[dsg]],['Para',f.to.value],['De',f.from.value],['Dedicatoria',f.msg.value||'Para compartir un gran asado.'],['Monto','$ '+fmt(f.amount.value)],['Entrega',f.email.value]].map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd></div>'}).join('');
    openModal();
  });
  if(window.matchMedia('(hover:hover) and (pointer:fine)').matches&&!reduce){
    var pv=$('.gift__preview');
    pv.addEventListener('mousemove',function(e){var r=pv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;gc.style.transform='rotateY('+(x*14)+'deg) rotateX('+(-y*12)+'deg)';gc.style.setProperty('--mx',(x+.5)*100+'%');gc.style.setProperty('--my',(y+.5)*100+'%')});
    pv.addEventListener('mouseleave',function(){gc.style.transform=''});
  }
  syncGift();

  /* reserva */
  var rf=$('#rform'),rd=$('#rdone');
  var horas={almuerzo:['12:30','13:00','13:30','14:00','14:30','15:00'],cena:['20:30','21:00','21:30','22:00','22:30','23:00','23:30']};
  var t0=new Date();var iso=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  var slotsEl=$('#slots');
  function fillHoras(){var t=rf.querySelector('input[name=turno]:checked').value,sel=rf.elements.hora,prev=sel.value;
    var list=horas[t].slice(),fv=rf.elements.fecha.value,now=new Date();
    if(fv===iso(now)){list=list.filter(function(h){var p=h.split(':');var d=new Date();d.setHours(+p[0],+p[1],0,0);return d-now>3600000})}
    sel.innerHTML='<option value="">Elegí un horario</option>'+list.map(function(h){return '<option'+(h+' hs'===prev?' selected':'')+'>'+h+' hs</option>'}).join('');
    if(slotsEl){slotsEl.innerHTML=list.length?list.map(function(h){var on=(h+' hs'===sel.value);return '<button type="button" class="slot'+(on?' is-on':'')+'" role="radio" aria-checked="'+on+'" data-h="'+h+' hs">'+h+'</button>'}).join(''):'<p class="slots__none">No quedan horarios para hoy en este turno.</p>'}
  }
  if(slotsEl)slotsEl.addEventListener('click',function(e){var b=e.target.closest('.slot');if(!b)return;rf.elements.hora.value=b.dataset.h;$$('.slot',slotsEl).forEach(function(x){var on=x===b;x.classList.toggle('is-on',on);x.setAttribute('aria-checked',on)});var fe=rf.elements.hora.closest('.field');fe&&fe.classList.remove('bad')});
  /* calendario */
  var calG=$('#cal-grid'),calT=$('#cal-title'),calM=new Date();calM.setDate(1);calM.setHours(0,0,0,0);
  var calMin=new Date(calM),calMax=new Date(calM);calMax.setMonth(calMax.getMonth()+3);
  var almR=rf.querySelector('input[name=turno][value=almuerzo]'),cenR=rf.querySelector('input[name=turno][value=cena]');
  function renderCal(){if(!calG)return;var y=calM.getFullYear(),m=calM.getMonth();
    var mt=calM.toLocaleDateString('es-AR',{month:'long',year:'numeric'});calT.textContent=mt.charAt(0).toUpperCase()+mt.slice(1);
    var first=(new Date(y,m,1).getDay()+6)%7,days=new Date(y,m+1,0).getDate(),today=new Date();today.setHours(0,0,0,0);
    var sel=rf.elements.fecha.value,html='';
    for(var i=0;i<first;i++)html+='<span class="cal__d is-empty"></span>';
    for(var d=1;d<=days;d++){var dt=new Date(y,m,d),v=iso(dt),past=dt<today,mon=dt.getDay()===1;
      var cls='cal__d'+(past?' is-off':'')+(mon&&!past?' is-mon':'')+(v===sel?' is-sel':'')+(dt.getTime()===today.getTime()?' is-today':'');
      html+='<button type="button" class="'+cls+'" data-v="'+v+'"'+(past?' disabled':'')+' aria-label="'+dt.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long'})+(mon?' (solo cena)':'')+'" aria-pressed="'+(v===sel)+'">'+d+'</button>'}
    calG.innerHTML=html;
    $('#cal-prev').disabled=calM<=calMin;$('#cal-next').disabled=calM>=calMax;
  }
  if(calG){
    $('#cal-prev').addEventListener('click',function(){calM.setMonth(calM.getMonth()-1);renderCal()});
    $('#cal-next').addEventListener('click',function(){calM.setMonth(calM.getMonth()+1);renderCal()});
    calG.addEventListener('click',function(e){var b=e.target.closest('.cal__d');if(!b||b.disabled||!b.dataset.v)return;rf.elements.fecha.value=b.dataset.v;
      var p=b.dataset.v.split('-'),isMon=new Date(+p[0],+p[1]-1,+p[2]).getDay()===1;
      almR.disabled=isMon;almR.closest('label').classList.toggle('is-dis',isMon);
      if(isMon&&almR.checked){cenR.checked=true;toast&&toast('Los lunes abrimos solo a la noche: elegimos cena.')}
      var fe=calG.closest('.field');fe&&fe.classList.remove('bad');renderCal();fillHoras()});
    renderCal();
  }
  rf.elements.personas.innerHTML='<option value="">¿Cuántos?</option>'+Array.from({length:12},function(_,i){return '<option>'+(i+1)+(i?' personas':' persona')+'</option>'}).join('')+'<option>Más de 12 personas</option>';
  fillHoras();$$('input[name=turno]',rf).forEach(function(r){r.addEventListener('change',fillHoras)});
  function fechaLarga(v){var p=v.split('-');var d=new Date(+p[0],+p[1]-1,+p[2]);return d.toLocaleDateString('es-AR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
  var lastReq='';
  rf.addEventListener('submit',function(e){
    e.preventDefault();var f=rf.elements,err=[];
    $$('.field',rf).forEach(function(x){x.classList.remove('bad')});
    function bad(n,m){var el=f[n].length&&!f[n].tagName?f[n][0]:f[n];el.closest('.field').classList.add('bad');err.push(m)}
    if(f.nombre.value.trim().length<2)bad('nombre','Ingresá tu nombre y apellido.');
    if(f.tel.value.replace(/\D/g,'').length<7)bad('tel','Ingresá un teléfono válido para que te confirmemos.');
    if(!f.fecha.value)bad('fecha','Elegí la fecha.');
    else{var p=f.fecha.value.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]);var today=new Date();today.setHours(0,0,0,0);
      if(d<today)bad('fecha','La fecha no puede ser anterior a hoy.');
      else if(d.getDay()===1&&rf.querySelector('input[name=turno]:checked').value==='almuerzo')bad('fecha','Los lunes abrimos solo a la noche. Elegí cena u otro día.');}
    if(!f.hora.value)bad('hora','Elegí un horario.');
    if(!f.personas.value)bad('personas','Indicá cuántas personas son.');
    $('#rform-err').textContent=err[0]||'';
    if(err.length){var b=rf.querySelector('.bad input, .bad select');if(b)b.focus();return}
    var turno=rf.querySelector('input[name=turno]:checked').value==='almuerzo'?'Almuerzo':'Cena';
    var rows=[['Nombre',f.nombre.value.trim()],['Teléfono',f.tel.value.trim()],['Fecha',fechaLarga(f.fecha.value)],['Turno',turno+' · '+f.hora.value],['Personas',f.personas.value]];
    if(f.ocasion.value)rows.push(['Ocasión',f.ocasion.value]);
    if(f.comentarios.value.trim())rows.push(['Comentarios',f.comentarios.value.trim()]);
    $('#rdone-sum').innerHTML=rows.map(function(r){return '<div><dt>'+r[0]+'</dt><dd>'+esc(r[1])+'</dd></div>'}).join('');
    lastReq='Pedido de reserva – Patio de La Cañada\n'+rows.map(function(r){return r[0]+': '+r[1]}).join('\n')+'\n\n(Pedido sujeto a confirmación telefónica del restaurante.)';
    $('#rdone-mail').href='mailto:patiodelacanada@gmail.com?subject='+encodeURIComponent('Pedido de reserva – '+f.nombre.value.trim()+' – '+fechaLarga(f.fecha.value))+'&body='+encodeURIComponent(lastReq);
    rf.hidden=true;rd.hidden=false;rd.classList.remove('is-in');void rd.offsetWidth;rd.classList.add('is-in');rd.focus();
  });
  $('#rdone-back').addEventListener('click',function(){rd.hidden=true;rf.hidden=false;rf.elements.nombre.focus()});
  $('#rdone-copy').addEventListener('click',function(){
    function ok(){toast('Pedido copiado. Tenelo a mano al llamar.')}
    if(navigator.clipboard)navigator.clipboard.writeText(lastReq).then(ok,function(){fallback()});else fallback();
    function fallback(){var ta=document.createElement('textarea');ta.value=lastReq;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');ok()}catch(e){}ta.remove()}
  });
})();
