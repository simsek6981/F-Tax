const {chromium}=require('playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const base=process.env.FTAX_BASE_URL||'http://127.0.0.1:8000/Yilmaz/';
const out=process.env.FTAX_QA_DIR||path.resolve(__dirname,'../output/playwright');
const widths=[320,375,390,430,768];
const pages=['index.html','steuerberatung.html','ueber-mich.html','impressum.html','datenschutz.html','404.html'];
fs.mkdirSync(out,{recursive:true});
async function layout(page,width){
 const state=await page.evaluate(()=>({viewport:innerWidth,scroll:document.documentElement.scrollWidth,small:[...document.querySelectorAll('.menu-toggle,.header-appointment,.hero-actions a,.text-link,.service-nav a,.footer-grid a:not(.brand),.footer-bottom a,.contact-details a,summary,button,input:not([type="hidden"]),select,textarea')].filter(e=>{const r=e.getBoundingClientRect();return r.width&&r.height&&!e.closest('.form-honeypot')&&(r.width<43.9||r.height<43.9)}).map(e=>({tag:e.tagName,text:e.textContent.trim(),width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height}))}));
 assert.equal(state.viewport,width);assert.ok(state.scroll<=width,JSON.stringify(state));assert.deepEqual(state.small,[]);
}
(async()=>{
 const browser=await chromium.launch({channel:process.env.FTAX_BROWSER_CHANNEL||undefined});
 const report={viewports:[],forms:[],errors:[],console:[]};
 try{
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:width===768?1024:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
   // Any accidental real submit fails; responses below are always local mocks.
   await context.route('https://api.emailjs.com/**',route=>route.abort());
   const page=await context.newPage();
   page.on('pageerror',e=>report.errors.push(String(e)));
   page.on('console',m=>{if(['error','warning'].includes(m.type()))report.console.push(m.text());});
   for(const file of pages){
    const response=await page.goto(base+file);assert.equal(response.status(),200);
    await page.evaluate(()=>document.fonts.ready);
    assert.ok(await page.title());assert.ok(await page.locator('h1').isVisible());
    assert.ok(await page.locator('.site-header').evaluate(e=>e.getBoundingClientRect().height<=120));
    await layout(page,width);
    const menu=page.locator('.menu-toggle');await menu.tap();
    assert.equal(await menu.getAttribute('aria-expanded'),'true');
    for(const link of await page.locator('#navigation a').all())assert.ok(await link.isVisible());
    await layout(page,width);
    await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');
    assert.ok(await menu.evaluate(e=>e===document.activeElement));
    for(const fraction of [0,.5,1]){await page.evaluate(f=>scrollTo({top:(document.documentElement.scrollHeight-innerHeight)*f,behavior:'instant'}),fraction);await layout(page,width);}
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    if(width<=430)assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>!('transitionProperty' in a)).length),0);
    if(file==='index.html'){
     const portrait=await page.locator('.hero-portrait img').evaluate(e=>({source:e.currentSrc,fit:getComputedStyle(e).objectFit,transform:getComputedStyle(e).transform,complete:e.complete&&e.naturalWidth>0,clip:getComputedStyle(e.parentElement).clipPath}));
     assert.match(portrait.source,/ferhat-yilmaz-(640|1149)\.webp$/);assert.equal(portrait.fit,'contain');assert.equal(portrait.clip,'none');assert.equal(portrait.transform,'none');assert.ok(portrait.complete);
    }
    if(file==='steuerberatung.html'&&width<=430)assert.match(await page.locator('main img').first().evaluate(e=>e.currentSrc),/-640\.webp$/);
    assert.equal(await page.locator('.header-appointment').getAttribute('aria-label'),'Termin');
    assert.equal(await page.locator('.header-appointment').getAttribute('href'),'index.html#termin');
    for(const phone of await page.locator('a[href^="tel:"]').all())assert.equal(await phone.getAttribute('href'),'tel:+4368110373970');
    await page.screenshot({path:path.join(out,`mobile-${file.replace('.html','')}-${width}.png`),fullPage:true,scale:'css'});
    if(file==='index.html')await page.screenshot({path:path.join(out,`mobile-hero-${width}.png`),scale:'css'});
    report.viewports.push({file,width,overflow:false,touchTargets:'44px minimum'});
   }
   await page.goto(base);await page.locator('.menu-toggle').tap();
   await page.screenshot({path:path.join(out,`mobile-menu-${width}.png`),scale:'css'});
   await page.locator('#navigation').getByRole('link',{name:'Steuerberatung',exact:true}).tap();
   await page.waitForURL(base+'steuerberatung.html');assert.ok(await page.locator('#navigation a[aria-current="page"]').getAttribute('href')==='steuerberatung.html');
   await page.locator('.service-nav a[href="#lohnverrechnung"]').tap();
   const heading=page.locator('#lohnverrechnung h2');await heading.waitFor();
   await page.waitForFunction(()=>Math.abs(document.querySelector('#lohnverrechnung').getBoundingClientRect().top-120)<3);
   await page.locator('.header-appointment').tap();await page.waitForURL(base+'index.html#termin');
   const details=page.locator('.request-details');assert.equal(await details.evaluate(e=>e.open),false);
   await page.locator('.form-submit').tap();assert.equal(await page.locator('#request-name').getAttribute('aria-invalid'),'true');
   await page.fill('#request-name','Mobile QA');await page.fill('#request-email','invalid');
   await page.locator('.form-submit').tap();assert.equal(await page.locator('#request-email').getAttribute('aria-invalid'),'true');
   await page.fill('#request-email','mobile@example.com');
   await details.locator('summary').tap();assert.equal(await details.evaluate(e=>e.open),true);
   await page.selectOption('#request-topic','Buchhaltung');await page.fill('#request-message','Bitte um einen Termin.');
   await details.locator('summary').tap();await details.locator('summary').tap();
   assert.equal(await page.locator('#request-message').inputValue(),'Bitte um einen Termin.');
   await layout(page,width);await page.screenshot({path:path.join(out,`mobile-form-${width}.png`),fullPage:true,scale:'css'});
   let calls=0,payload;
   await page.route('https://api.emailjs.com/**',async route=>{calls++;payload=route.request().postDataJSON();await route.fulfill({status:500,body:'Test error'});});
   await page.locator('.form-submit').tap();await page.waitForFunction(()=>document.querySelector('[data-contact-status]').dataset.state==='error');
   assert.equal(await page.locator('#request-name').inputValue(),'Mobile QA');assert.ok(await page.locator('.form-submit').isEnabled());
   await page.unroute('https://api.emailjs.com/**');
   await page.route('https://api.emailjs.com/**',route=>{calls++;payload=route.request().postDataJSON();return route.fulfill({status:200,body:'OK'});});
   await page.locator('.form-submit').tap();await page.waitForFunction(()=>document.querySelector('[data-contact-status]').dataset.state==='success');
   assert.equal(calls,2);assert.equal(payload.template_params.topic,'Buchhaltung');assert.equal(payload.template_params.reply_to,'mobile@example.com');
   assert.equal(await page.locator('#request-name').inputValue(),'');await layout(page,width);
   await page.goto(base+'?thema=Buchhaltung#termin');assert.equal(await details.evaluate(e=>e.open),true);assert.equal(await page.locator('#request-topic').inputValue(),'Buchhaltung');
   report.forms.push({width,validation:true,optionalFields:true,mockedErrorAndRetry:true,mockedSuccess:true,topicDeepLink:true});
   const nojs=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,javaScriptEnabled:false});
   const fallback=await nojs.newPage();await fallback.goto(base);assert.ok(await fallback.locator('#navigation').isVisible());await layout(fallback,width);await nojs.close();
   await context.close();console.log(`PASS: ${width}px — six pages, touch menu, section links, contact, form validation/error/retry/success, no-JS.`);
  }
  assert.deepEqual(report.errors,[]);assert.ok(report.console.every(m=>/Failed to load resource: the server responded with a status of 500/.test(m)),JSON.stringify(report.console));
  fs.writeFileSync(path.join(out,'mobile-qa.json'),JSON.stringify(report,null,2));console.log('PASS: 30 mobile layouts and five complete touch/form flows.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
