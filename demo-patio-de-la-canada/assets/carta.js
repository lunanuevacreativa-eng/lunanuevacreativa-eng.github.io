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
  function renderSection(sec){
    var items=(sec.items||[]).filter(function(i){return i.visible!==false&&i.nombre});
    var dest=items.filter(function(i){return i.destacado});
    var rest=items.filter(function(i){return !i.destacado});
    var h='';
    if(dest.length){h+='<div class="mc-dest">'+dest.map(function(i){return '<div class="mc-dest__item"><span class="mc-dest__tag">Sugerencia</span><h4>'+esc(i.nombre)+'</h4>'+(i.detalle?'<p>'+esc(i.detalle)+'</p>':'')+'</div>'}).join('')+'</div>'}
    h+='<ul class="mc-list">'+rest.map(function(i){return '<li><span class="mc-n">'+esc(i.nombre)+'</span>'+(i.detalle?'<span class="mc-d">'+esc(i.detalle)+'</span>':'')+'</li>'}).join('')+'</ul>';
    if(!items.length)h='<p class="mc-empty">Sin platos visibles en esta sección.</p>';
    return h;
  }
  function render(data,tabsEl,bodyEl,opts){
    opts=opts||{};
    var secs=(data.secciones||[]).filter(function(s){return s.titulo});
    var cur=Math.min(opts.index||0,Math.max(secs.length-1,0));
    function show(i,focus){
      cur=i;
      [].forEach.call(tabsEl.children,function(b,j){b.setAttribute('aria-selected',j===i?'true':'false');b.tabIndex=j===i?0:-1;if(j===i&&focus)b.focus()});
      bodyEl.classList.remove('is-in');void bodyEl.offsetWidth;
      bodyEl.innerHTML='<h3 class="mc-title">'+esc(secs[i]?secs[i].titulo:'')+'</h3>'+(secs[i]?renderSection(secs[i]):'');
      bodyEl.classList.add('is-in');
      if(opts.onChange)opts.onChange(i);
    }
    tabsEl.innerHTML=secs.map(function(s,i){return '<button type="button" role="tab" id="tab-'+i+'" aria-controls="'+bodyEl.id+'">'+esc(s.titulo)+'</button>'}).join('');
    bodyEl.setAttribute('role','tabpanel');
    [].forEach.call(tabsEl.children,function(b,i){
      b.addEventListener('click',function(){show(i)});
      b.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();show((i+1)%secs.length,true)}if(e.key==='ArrowLeft'){e.preventDefault();show((i-1+secs.length)%secs.length,true)}});
    });
    if(secs.length)show(cur);
    return {show:show,current:function(){return cur}};
  }
  window.PDLC={KEY:KEY,load:load,fetchBase:fetchBase,render:render,getOverride:getOverride,setOverride:setOverride,clearOverride:clearOverride,esc:esc};
})();
