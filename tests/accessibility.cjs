const{chromium}=require('playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');const path=require('node:path');
const out=process.env.FTAX_QA_DIR||path.resolve(__dirname,'../qa');fs.mkdirSync(out,{recursive:true});
const base=process.env.FTAX_BASE_URL||'http://127.0.0.1:8000/Yilmaz/';
(async()=>{const b=await chromium.launch({channel:process.env.FTAX_BROWSER_CHANNEL||undefined,headless:true});const p=await b.newPage();const reports=[];
for(const width of[390,1440])for(const file of['index.html','steuerberatung.html','ueber-mich.html','impressum.html','datenschutz.html']){
 await p.setViewportSize({width,height:1000});await p.goto(base+file);await p.waitForTimeout(1300);
 if(file==='index.html'){await p.locator('.request-details').evaluate(e=>e.open=true);}
 await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
 const r=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
 reports.push({file,width,violations:r.violations});console.log(file,width,JSON.stringify(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))));
}
fs.writeFileSync(path.join(out,'accessibility-qa.json'),JSON.stringify(reports,null,2));
await p.setViewportSize({width:1440,height:1000});await p.goto(base);
const motion=await p.evaluate(async()=>{const steps=document.querySelector('.steps');const top=steps.getBoundingClientRect().top+scrollY;const vals=[];for(const y of[top-innerHeight,top,top+steps.offsetHeight/2]){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,80));vals.push(getComputedStyle(steps,'::after').transform);}return{nativeScroll:CSS.supports('animation-timeline:view()'),transforms:vals};});
console.log('Timeline:',JSON.stringify(motion));fs.writeFileSync(path.join(out,'motion-qa.json'),JSON.stringify(motion,null,2));
assert.ok(reports.every(r=>r.violations.length===0),'Accessibility violations remain');assert.ok(!motion.nativeScroll||new Set(motion.transforms).size>1,'Native timeline did not progress');
await p.goto(base+'docs/contact-notification-preview.html');await p.screenshot({path:path.join(out,'ftax-email.png'),fullPage:true});
await b.close();console.log('PASS: 10 axe-core WCAG checks and scroll-linked timeline.');})().catch(e=>{console.error(e);process.exit(1)});
