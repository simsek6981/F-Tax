const {chromium}=require('playwright');
const fs=require('node:fs');
const assert=require('node:assert/strict');
const path=require('node:path');
const out=process.env.FTAX_QA_DIR||path.resolve(__dirname,'../qa');
fs.mkdirSync(out,{recursive:true});
const base=process.env.FTAX_BASE_URL||'http://127.0.0.1:8000/Yilmaz/';
const report={viewports:[],functional:[],errors:[],requests:new Set()};
async function check(label,fn){await fn();report.functional.push(label);console.log('PASS: '+label);}
async function overflow(p){return p.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,over:[...document.querySelectorAll('main *,header *,footer *')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)&&!e.closest('.form-honeypot,.hero-art,.identity-art')}).map(e=>e.tagName+'.'+e.className).slice(0,8)}));}
(async()=>{
 const b=await chromium.launch({channel:process.env.FTAX_BROWSER_CHANNEL||undefined,headless:true});
 const context=await b.newContext({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 const p=await context.newPage();
 p.on('pageerror',e=>report.errors.push(String(e)));
 p.on('request',r=>report.requests.add(r.url()));
 for(const width of [360,390,768,1024,1440,1920]){
  await p.setViewportSize({width,height:width<700?844:1000});
  for(const file of ['index.html','steuerberatung.html','ueber-mich.html','impressum.html','datenschutz.html']){
   const response=await p.goto(base+file);assert.equal(response.status(),200);
   await p.evaluate(()=>document.fonts.ready);
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
 await check('30 page/viewport combinations have no horizontal overflow',async()=>assert.equal(report.viewports.length,30));
 await p.setViewportSize({width:390,height:844});await p.goto(base);
 await check('Mobile menu: open, Escape focus return, link navigation, desktop transition',async()=>{
  const menu=p.locator('.menu-toggle');
  await menu.click();assert.equal(await menu.getAttribute('aria-expanded'),'true');
  await p.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.ok(await menu.evaluate(e=>e===document.activeElement));
  await menu.click();await p.locator('#navigation').getByRole('link',{name:'Steuerberatung',exact:true}).click();await p.waitForURL('**/steuerberatung.html');
  await menu.click();await p.setViewportSize({width:1024,height:1000});await p.waitForFunction(()=>document.querySelector('.menu-toggle').getAttribute('aria-expanded')==='false');
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
  for(const [legacy,target]of [['buchhaltung.html','steuerberatung.html#buchhaltung'],['bilanzierung.html','steuerberatung.html#bilanzierung'],['lohnverrechnung.html','steuerberatung.html#lohnverrechnung'],['kontakt.html','index.html#termin']]){await p.goto(base+legacy);await p.waitForURL(base+target);}
  const r=await p.goto(base+'missing/nested/page');assert.equal(r.status(),404);assert.ok(await p.locator('h1').isVisible());assert.ok(await p.locator('.brand img').first().evaluate(e=>e.complete&&e.naturalWidth>0));
 });
 const nojs=await b.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const np=await nojs.newPage();
 await check('Without JavaScript: readable content, visible navigation, direct contact fallback',async()=>{
  await np.goto(base);assert.ok(await np.locator('h1').isVisible());assert.ok(await np.locator('#navigation').isVisible());assert.ok(await np.locator('[data-contact-notice]').isVisible());assert.ok(await np.locator('.form-submit').isDisabled());assert.ok((await overflow(np)).scroll<=390);
 });
 await nojs.close();
 assert.deepEqual(report.errors,[]);report.functional.push('No JavaScript page errors');
 assert.ok([...report.requests].filter(u=>!u.startsWith(base)).every(u=>u.startsWith('https://api.emailjs.com/')));report.functional.push('Assets, fonts and graphics load locally; EmailJS only at submit (mocked)');
 report.requests=[...report.requests];fs.writeFileSync(path.join(out,'browser-qa.json'),JSON.stringify(report,null,2));
 await b.close();console.log(`PASS: ${report.functional.length} browser checks; ${report.viewports.length} responsive combinations.`);
})().catch(e=>{console.error(e);process.exit(1);});
