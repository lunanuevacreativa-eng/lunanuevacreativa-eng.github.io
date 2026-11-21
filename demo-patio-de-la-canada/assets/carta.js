/* Patio de La Cañada · carta data-driven (compartido por la web y el panel demo) */
(function(){
  var KEY='pdlc-carta-demo-v1';
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function getOverride(){try{var r=localStorage.getItem(KEY);return r?JSON.parse(r):null}catch(e){return null}}
  function setOverride(d){localStorage.setItem(KEY,JSON.stringify(d))}
  function clearOverride(){localStorage.removeItem(KEY)}
  function fetchBase(url){return fetch(url||'assets/carta.json',{cache:'no-cache'}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json()}).catch(function(e){if(window.PDLC_FALLBACK)return JSON.parse(JSON.stringify(window.PDLC_FALLBACK));throw e})}
  function load(url){
    return fetchBase(url).then(function(base){
      var o=getOverride();
      if(o&&o.secciones){var d=JSON.parse(JSON.stringify(base));d.secciones=o.secciones;return {data:d,base:base,edited:true}}
      return {data:base,base:base,edited:false};
    });
  }
  function money(p){return p?'$ '+String(p).replace(/\B(?=(\d{3})+(?!\d))/g,'.'):''}
  function row(n,d,p){return '<li><div class="mc-row"><span class="mc-n">'+esc(n)+'</span><span class="mc-dots" aria-hidden="true"></span><span class="mc-p">'+(p?money(p):'<em>Consultar</em>')+'</span></div>'+(d?'<span class="mc-d">'+esc(d)+'</span>':'')+'</li>'}
  var accN=0;
  function acc(label,count,inner){var id='acc-'+(++accN);return '<div class="acc"><button type="button" class="acc__btn" aria-expanded="false" aria-controls="'+id+'"><span class="acc__l">'+esc(label)+'</span>'+(count?'<span class="acc__c">'+count+'</span>':'')+'<span class="acc__i" aria-hidden="true"></span></button><div class="acc__panel" id="'+id+'" role="region" aria-label="'+esc(label)+'"><div class="acc__in">'+inner+'</div></div></div>'}
  if(!window.__pdlcAcc){window.__pdlcAcc=true;document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.acc__btn');if(!b)return;var o=b.getAttribute('aria-expanded')==='true',l=b.querySelector('.acc__l');b.setAttribute('aria-expanded',String(!o));b.parentNode.classList.toggle('is-open',!o);if(l)l.textContent=o?l.textContent.replace(/^Ocultar /,'Ver '):l.textContent.replace(/^Ver /,'Ocultar ')})}
  function renderSection(sec){
    if(sec.vinos){
      var tot=0;sec.vinos.forEach(function(b){tot+=(b.vinos||[]).length});
      return '<p class="mc-intro">'+sec.vinos.length+' bodegas y champañas · '+tot+' etiquetas</p>'+acc('Ver etiquetas y precios',tot,'<div class="mc-wines">'+sec.vinos.map(function(b){return '<div class="mc-bod"><h4>'+esc(b.bodega)+'</h4><ul class="mc-list mc-list--w">'+(b.vinos||[]).map(function(w){return row(w.nombre,w.varietal,w.precio)}).join('')+'</ul></div>'}).join('')+'</div>');
    }
    var items=(sec.items||[]).filter(function(i){return i.visible!==false&&i.nombre});
    var dest=items.filter(function(i){return i.destacado});
    var rest=items.filter(function(i){return !i.destacado});
    var h='';
    if(dest.length){h+='<div class="mc-feats">'+dest.map(function(i){return '<div class="mc-feat"><div><span class="mc-feat__tag">Sugerencia de la casa</span><h4>'+esc(i.nombre)+'</h4>'+(i.detalle?'<p>'+esc(i.detalle)+'</p>':'')+'</div>'+(i.precio?'<span class="mc-feat__p">'+money(i.precio)+'</span>':'')+'</div>'}).join('')+'</div>'}
    if(rest.length)h+=acc('Ver platos y precios',rest.length,'<ul class="mc-list">'+rest.map(function(i){return row(i.nombre,i.detalle,i.precio)}).join('')+'</ul>');
    if(!items.length)h='<p class="mc-empty">Sin platos visibles en esta sección.</p>';
    return h;
  }
  function render(data,tabsEl,bodyEl,opts){
    opts=opts||{};
    var secs=(data.secciones||[]).filter(function(s){return s.titulo});if(data.cava&&data.cava.length&&!opts.noWines)secs=secs.concat([{titulo:'Vinos',vinos:data.cava}]);
    var cur=Math.min(opts.index||0,Math.max(secs.length-1,0));
    function show(i,focus){
      cur=i;
      [].forEach.call(tabsEl.children,function(b,j){b.setAttribute('aria-selected',j===i?'true':'false');b.tabIndex=j===i?0:-1;if(j===i&&focus)b.focus()});
      bodyEl.classList.remove('is-in');void bodyEl.offsetWidth;
      bodyEl.innerHTML=(secs[i]?renderSection(secs[i]):'');
      bodyEl.classList.add('is-in');
      if(opts.onChange)opts.onChange(i);
    }
    tabsEl.innerHTML=secs.map(function(s,i){return '<button type="button" role="tab" id="tab-'+i+'" aria-controls="'+bodyEl.id+'">'+esc(s.titulo)+'</button>'}).join('');
    bodyEl.setAttribute('role','tabpanel');
    [].forEach.call(tabsEl.children,function(b,i){
      b.addEventListener('click',function(){show(i);if(b.scrollIntoView&&tabsEl.scrollWidth>tabsEl.clientWidth)tabsEl.scrollTo({left:b.offsetLeft-(tabsEl.clientWidth-b.offsetWidth)/2,behavior:'smooth'})});
      b.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();show((i+1)%secs.length,true)}if(e.key==='ArrowLeft'){e.preventDefault();show((i-1+secs.length)%secs.length,true)}});
    });
    if(secs.length)show(cur);
    return {show:show,current:function(){return cur}};
  }
  window.PDLC={acc:acc,KEY:KEY,load:load,fetchBase:fetchBase,render:render,getOverride:getOverride,setOverride:setOverride,clearOverride:clearOverride,esc:esc};
})();
