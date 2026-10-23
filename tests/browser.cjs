const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const out=process.env.FTAX_QA_DIR||path.resolve(__dirname,'../output/playwright');
fs.mkdirSync(out,{recursive:true});
const base=process.env.FTAX_BASE_URL||'http://127.0.0.1:8000/Yilmaz/';
const report={viewports:[],functional:[],errors:[],console:[],requests:new Set()};
async function check(label,fn){await fn();report.functional.push(label);console.log('PASS: '+label);}
async function overflow(p){return p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,over:[...document.querySelectorAll('main *,header *,footer *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)&&!e.closest('.form-honeypot,.hero-art,.identity-art')}).map(e=>e.tagName+'.'+e.className).slice(0,8)}));}
(async()=>{
 const b=await chromium.launch({channel:process.env.FTAX_BROWSER_CHANNEL||undefined,headless:true});
 const context=await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const p=await context.newPage();
 p.on('pageerror',e=>report.errors.push(String(e)));
 p.on('console',m=>{if(['error','warning'].includes(m.type()))report.console.push(m.text());});
 p.on('request',r=>report.requests.add(r.url()));
 for(const width of [320,375,390,430,768,1024,1440]){
  await p.setViewportSize({width,height:width<700?844:1000});
  for(const file of ['index.html','steuerberatung.html','ueber-mich.html','impressum.html','datenschutz.html']){
   const response=await p.goto(base+file);assert.equal(response.status(),200);
   await p.evaluate(()=>document.fonts.ready);
   const copy=await p.locator('body').innerText();
   assert.doesNotMatch(copy,/\b(wir|uns|unser\w*|mandant\w*|prozessoptimierung|honorar\w*|kostenlos)\b/i);
   assert.ok(await p.locator('.header-appointment').isVisible());
   const brand=await p.locator('.site-header .brand img').evaluate(e=>({source:e.getAttribute('src'),width:e.width,height:e.height,naturalWidth:e.naturalWidth,naturalHeight:e.naturalHeight}));
   assert.equal(brand.source,'assets/icons/logo.png');
   assert.ok(Math.abs(brand.width/brand.height-brand.naturalWidth/brand.naturalHeight)<.01,'Reference logo proportions must be preserved');
   assert.equal(await p.locator('.site-header .brand > span').count(),0,'Logo lettering must come from the supplied image');
   assert.equal(await p.locator('.header-appointment').getAttribute('aria-label'),'Termin');
   assert.equal(await p.locator('#navigation').getByRole('link',{name:'Kontakt',exact:true,includeHidden:true}).count(),0);
   for(const phone of await p.locator('a[href^="tel:"]').all())assert.equal(await phone.getAttribute('href'),'tel:+4368110373970');
   assert.doesNotMatch(copy,/\+43 676/);
   if(file==='steuerberatung.html'){assert.equal(await p.locator('.compact-contact').count(),0);assert.equal(await p.locator('.service').count(),5);assert.equal(await p.locator('#gruendung .checks li').count(),4);}
   if(file==='impressum.html')assert.doesNotMatch(copy,/GUT ZU WISSEN/);
   assert.ok(await p.locator('#navigation').evaluate(e=>[...e.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE).every(n=>!n.textContent.trim())),'Navigation must not contain stray text');
   assert.deepEqual(await p.locator('main p,main li,main label,main input,main select,main textarea').evaluateAll(items=>items.filter(e=>e.getBoundingClientRect().height>0&&parseFloat(getComputedStyle(e).fontSize)<16&&!e.closest('.form-honeypot')).map(e=>e.tagName+'.'+e.className)),[],'Content text must be at least 16px');
   if(file==='index.html')assert.equal(await p.locator('h1').innerText(),'Steuern sauber erledigt. Weiter gedacht.');
   if(file==='ueber-mich.html'){
    assert.equal(await p.locator('main > *').count(),2);
    assert.equal(await p.locator('main > section.hero').count(),1);
    assert.equal(await p.locator('.about-story .prose p').count(),2);
    assert.equal(await p.locator('main article,main aside,main .brand-portrait,main ul').count(),0);
    assert.match(copy,/Klienten/);
   }
   for(const part of [0,.5,1]){
    await p.evaluate(f=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*f,behavior:'instant'}),part);
    await p.waitForTimeout(30);
    const r=await overflow(p);assert.ok(r.scroll<=width+1,`${file} ${width}px overflow ${JSON.stringify(r)}`);
   }
   report.viewports.push({file,width,overflow:false});
   if(width===390||width===1440){
    await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    await p.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=650){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,5));}scrollTo({top:0,behavior:'instant'});});
    await p.waitForTimeout(1200);
    await p.screenshot({path:path.join(out,`ftax-${file.replace('.html','')}-${width}.png`),fullPage:true});
    if(file==='index.html')await p.screenshot({path:path.join(out,width===390?'ftax-mobile.png':'ftax-desktop.png')});
   }
  }
 }
 await check('35 page/viewport combinations have no horizontal overflow',async()=>assert.equal(report.viewports.length,35));
 await p.setViewportSize({width:390,height:844});await p.goto(base);
 await check('Mobile menu: open, Escape focus return, link navigation, desktop transition',async()=>{
  const menu=p.locator('.menu-toggle');
  await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');
  await p.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.ok(await menu.evaluate(e=>e===document.activeElement));
  await menu.click();await p.locator('#navigation').getByRole('link',{name:'Steuerberatung',exact:true}).click();await p.waitForURL('**/steuerberatung.html');
  await menu.click();await p.setViewportSize({width:1024,height:1000});await p.waitForFunction(()=>document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false');
 });
 await check('Appointment button reaches the visible appointment form',async()=>{
  await p.locator('.header-appointment').click();
  await p.waitForURL(base+'index.html#termin');assert.ok(await p.locator('[data-contact-form]').isVisible());
 });
 await check('Invalid form focuses the named field and sends no network request',async()=>{
  await p.goto(base+'#termin');let calls=0;
  await p.route('https://api.emailjs.com/**',async r=>{calls++;await r.fulfill({status:200,body:'OK'});});
  await p.getByRole('button',{name:'Terminanfrage senden',exact:true}).click();
  assert.equal(calls,0);assert.equal(await p.locator('#request-name').getAttribute('aria-invalid'),'true');assert.ok(await p.locator('#request-name').evaluate(e=>e===document.activeElement));
  await p.unroute('https://api.emailjs.com/**');
 });
 await check('EmailJS mock: pending, double-submit lock, correct payload, success, reset and cooldown',async()=>{
  await p.goto(base+'?thema=Buchhaltung#termin');
  assert.equal(await p.locator('#request-topic').inputValue(),'Buchhaltung');assert.ok(await p.locator('.request-details').getAttribute('open')!==null);
  await p.fill('#request-name','QA Beispiel');await p.fill('#request-email','qa@example.com');
  let calls=0,payload;
  await p.route('https://api.emailjs.com/**',async route=>{calls++;payload=route.request().postDataJSON();await new Promise(r=>setTimeout(r,500));await route.fulfill({status:200,body:'OK'});});
  const submit=p.getByRole('button',{name:'Terminanfrage senden',exact:true});await submit.click();
  assert.ok(await p.locator('[data-contact-form]').getAttribute('aria-busy')==='true');assert.ok(await p.locator('.form-submit').isDisabled());
  await p.locator('form').evaluate(e=>e.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  await p.waitForFunction(()=>document.querySelector('[data-contact-status]').dataset.state==='success');
  assert.equal(calls,1);assert.equal(payload.service_id,'service_ja02fgi');assert.equal(payload.template_id,'template_tk14gwp');assert.equal(payload.user_id,'VaQ_PnlLN756oJY4H');assert.equal(payload.template_params.reply_to,'qa@example.com');assert.equal(payload.template_params.topic,'Buchhaltung');
  assert.equal(await p.locator('#request-name').inputValue(),'');
  await submit.click();assert.equal(calls,1);assert.match(await p.locator('[data-contact-status]').textContent(),/bereits übermittelt/);
  await p.unroute('https://api.emailjs.com/**');
 });
 await check('EmailJS mock: service error preserves input and permits retry',async()=>{
  await p.goto(base+'#termin');await p.fill('#request-name','QA Beispiel');await p.fill('#request-email','qa@example.com');
  await p.route('https://api.emailjs.com/**',r=>r.fulfill({status:500,body:'Service unavailable'}));await p.locator('.form-submit').click();
  await p.waitForFunction(()=>document.querySelector('[data-contact-status]').dataset.state==='error');assert.equal(await p.locator('#request-name').inputValue(),'QA Beispiel');assert.ok(await p.locator('.form-submit').isEnabled());
  await p.unroute('https://api.emailjs.com/**');
 });
 await check('Reduced motion: no hero, reveal, parallax or scroll-linked animation',async()=>{
  await p.emulateMedia({reducedMotion:'reduce'});await p.goto(base);await p.evaluate(()=>scrollTo(0,1200));await p.waitForTimeout(100);
  assert.equal(await p.evaluate(()=>document.getAnimations().length),0);assert.ok(!await p.locator('html').evaluate(e=>e.classList.contains('motion-enabled')));await p.emulateMedia({reducedMotion:'no-preference'});
 });
 await check('Legacy URLs lead to the correct sections; custom nested 404 retains working assets',async()=>{
  for(const [legacy,target]of [['buchhaltung.html','steuerberatung.html#buchhaltung'],['bilanzierung.html','steuerberatung.html#bilanzierung'],['lohnverrechnung.html','steuerberatung.html#lohnverrechnung'],['kontakt.html','index.html']]){await p.goto(base+legacy);await p.waitForURL(base+target);}
  const r=await p.goto(base+'missing/nested/page');assert.equal(r.status(),404);assert.ok(await p.locator('h1').isVisible());assert.ok(await p.locator('.brand img').first().evaluate(e=>e.complete&&e.naturalWidth>0));
 });
 const nojs=await b.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const np=await nojs.newPage();
 await check('Without JavaScript: readable content, visible navigation, direct contact fallback',async()=>{
  await np.goto(base);assert.ok(await np.locator('h1').isVisible());assert.ok(await np.locator('#navigation').isVisible());assert.ok(await np.locator('[data-contact-notice]').isVisible());assert.ok(await np.locator('.form-submit').isDisabled());assert.ok((await overflow(np)).scroll<=390);
 });
 await nojs.close();
 assert.deepEqual(report.errors,[]);report.functional.push('No JavaScript page errors');
 assert.ok(report.console.every(m=>/Failed to load resource: the server responded with a status of (404|500)/.test(m)),JSON.stringify(report.console));report.functional.push('No unexpected console warnings or errors (only mocked HTTP 500 and intentional 404)');
 assert.ok([...report.requests].filter(u=>!u.startsWith(base)).every(u=>u.startsWith('https://api.emailjs.com/')));report.functional.push('Assets, fonts and graphics load locally; EmailJS only at submit (mocked)');
 report.requests=[...report.requests];fs.writeFileSync(path.join(out,'browser-qa.json'),JSON.stringify(report,null,2));
 await b.close();console.log(`PASS: ${report.functional.length} browser checks; ${report.viewports.length} responsive combinations.`);
})().catch(e=>{console.error(e);process.exit(1);});
