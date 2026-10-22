const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../assets/js/main.js'),'utf8');

function element(){
  const classes=new Set(),attrs={},events={};
  return {classes,attrs,events,contains:()=>false,focus(){this.focused=true;},
    classList:{add:n=>classes.add(n),remove:n=>classes.delete(n),toggle(n,v){if(v===undefined)v=!classes.has(n);if(v)classes.add(n);else classes.delete(n);return v;},contains:n=>classes.has(n)},
    setAttribute:(n,v)=>{attrs[n]=v;},getAttribute:n=>attrs[n],addEventListener:(n,fn)=>{events[n]=fn;},matches:()=>false};
}
function harness({reduce=false,mobile=false,observer=true,failObserver=false,focused=false}={}){
  const root=element(),header=element(),toggle=element(),nav=element(),link=element();
  toggle.attrs['aria-expanded']='false';nav.querySelectorAll=()=>[link];
  const targets=[element(),element()];const animations=[];
  targets.forEach(el=>el.animate=(frames,options)=>{
    const events={};const animation={frames,options,canceled:false,addEventListener:(n,fn)=>{events[n]=fn;},cancel(){this.canceled=true;events.cancel?.();}};
    animations.push(animation);return animation;
  });
  if(focused)targets[0].contains=()=>true;
  const docEvents={},winEvents={},frames=[],queries=new Map(),observers=[];
  const query=s=>{if(!queries.has(s))queries.set(s,{matches:s.includes('reduced-motion')?reduce:s.includes('max-width')?mobile:false,events:{},addEventListener(n,fn){this.events[n]=fn;}});return queries.get(s);};
  const document={documentElement:root,activeElement:{},querySelector:s=>({'.menu-toggle':toggle,'#navigation':nav,'.site-header':header}[s]),querySelectorAll:s=>s==='[data-year]'?[]:targets,addEventListener:(n,fn)=>{docEvents[n]=fn;}};
  const window={scrollY:0,matchMedia:query,addEventListener:(n,fn,options)=>{winEvents[n]={fn,options};},requestAnimationFrame:fn=>frames.push(fn)};
  if(observer)window.IntersectionObserver=class{
    constructor(callback,options){if(failObserver)throw Error('unavailable');this.callback=callback;this.options=options;this.observed=[];observers.push(this);}
    observe(el){this.observed.push(el);}unobserve(el){this.observed=this.observed.filter(x=>x!==el);}disconnect(){this.disconnected=true;}
  };
  vm.runInNewContext(source,{document,window,Date});
  return {window,root,header,toggle,nav,link,targets,animations,docEvents,winEvents,frames,queries,observers};
}

test('Reduced motion leaves content static and creates no reveal observer',()=>{
  const h=harness({reduce:true});assert.equal(h.root.classes.has('motion-enabled'),false);assert.equal(h.observers.length,0);assert.equal(h.animations.length,0);
});
test('Reveals animate only intersecting elements and never replay',()=>{
  const h=harness(),o=h.observers[0];
  o.callback([{target:h.targets[0],isIntersecting:false}]);assert.equal(h.animations.length,0);
  o.callback([{target:h.targets[0],isIntersecting:true}]);assert.equal(h.animations.length,1);
  o.callback([{target:h.targets[0],isIntersecting:true}]);assert.equal(h.animations.length,1);
  assert.equal(h.animations[0].options.duration,540);assert.ok(h.animations[0].frames[0].opacity>0);
  assert.equal(h.targets[0].attrs.hidden,undefined);
});
test('Mobile reveals use shorter travel, shorter duration and no stagger',()=>{
  const h=harness({mobile:true});h.observers[0].callback(h.targets.map(target=>({target,isIntersecting:true})));
  for(const a of h.animations){assert.equal(a.options.duration,430);assert.equal(a.options.delay,0);assert.ok(a.frames[0].transform.includes('6px'));}
});
test('Changing reduced-motion cancels active animation and disconnects observers',()=>{
  const h=harness();h.observers[0].callback([{target:h.targets[0],isIntersecting:true}]);
  const q=h.queries.get('(prefers-reduced-motion: reduce)');q.matches=true;q.events.change();
  assert.equal(h.animations[0].canceled,true);assert.equal(h.root.classes.has('motion-enabled'),false);assert.equal(h.observers[0].disconnected,true);
});
test('A focused section does not move; unsupported observers leave the page usable',()=>{
  const h=harness({focused:true});h.observers[0].callback([{target:h.targets[0],isIntersecting:true}]);assert.equal(h.animations.length,0);
  assert.doesNotThrow(()=>harness({observer:false}));assert.doesNotThrow(()=>harness({failObserver:true}));
});
test('Sticky appearance uses a passive scroll handler and coalesces updates',()=>{
  const h=harness();assert.equal(h.winEvents.scroll.options.passive,true);
  h.winEvents.scroll.fn();h.winEvents.scroll.fn();assert.equal(h.frames.length,1);
  h.window.scrollY=32;h.frames.shift()();assert.equal(h.header.classes.has('is-scrolled'),true);
  h.window.scrollY=0;h.winEvents.scroll.fn();h.frames.shift()();assert.equal(h.header.classes.has('is-scrolled'),false);
});
test('Mobile navigation still closes on Escape, link activation and desktop transition',()=>{
  const h=harness();h.toggle.events.click();assert.equal(h.toggle.attrs['aria-expanded'],'true');
  h.docEvents.keydown({key:'Escape'});assert.equal(h.toggle.attrs['aria-expanded'],'false');assert.equal(h.toggle.focused,true);
  h.toggle.events.click();h.link.events.click();assert.equal(h.nav.classes.has('is-open'),false);
  h.toggle.events.click();h.queries.get('(min-width: 901px)').events.change();assert.equal(h.toggle.attrs['aria-expanded'],'false');
});

test('Editorial headings, service rows and identity art have distinct reveal treatments',()=>{
  const lines=harness();lines.targets[0].attrs['data-reveal']='lines';lines.observers[0].callback([{target:lines.targets[0],isIntersecting:true}]);
  assert.equal(lines.animations[0].frames[0].clipPath,'inset(0 0 26% 0)');
  const row=harness();row.targets[0].attrs['data-reveal']='row';row.observers[0].callback([{target:row.targets[0],isIntersecting:true}]);
  assert.equal(row.animations[0].frames[0].transform,'translateX(-12px)');
  const image=harness();image.targets[0].attrs['data-reveal']='image';image.observers[0].callback([{target:image.targets[0],isIntersecting:true}]);
  assert.equal(image.animations[0].options.duration,760);assert.equal(image.animations[0].frames[0].clipPath,'inset(0 8% 0 0)');
});
test('Moving keyboard focus out of mobile navigation closes the panel',()=>{
  const h=harness();h.toggle.events.click();h.docEvents.focusin({target:{}});assert.equal(h.toggle.attrs['aria-expanded'],'false');
});
