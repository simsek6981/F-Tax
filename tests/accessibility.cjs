const{chromium}=require('playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');const path=require('node:path');
const out=process.env.FTAX_QA_DIR||path.resolve(__dirname,'../output/playwright');fs.mkdirSync(out,{recursive:true});
const base=process.env.FTAX_BASE_URL||'http://127.0.0.1:8000/Yilmaz/';
(async()=>{const b=await chromium.launch({channel:process.env.FTAX_BROWSER_CHANNEL||undefined,headless:true});const p=await b.newPage();const reports=[];
for(const width of[320,375,390,430,768,1440])for(const file of['index.html','steuerberatung.html','ueber-mich.html','impressum.html','datenschutz.html']){
 await p.setViewportSize({width,height:1000});await p.goto(base+file);await p.waitForTimeout(1300);
 if(file==='index.html'){await p.locator('.request-details').evaluate(e=>e.open=true);}
 await p.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
 const r=await p.evaluate(()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));
 reports.push({file,width,violations:r.violations});console.log(file,width,JSON.stringify(r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))));
}
fs.writeFileSync(path.join(out,'accessibility-qa.json'),JSON.stringify(reports,null,2));
assert.ok(reports.every(r=>r.violations.length===0),'Accessibility violations remain');
await p.goto(base+'docs/contact-notification-preview.html');await p.screenshot({path:path.join(out,'ftax-email.png'),fullPage:true});
await b.close();console.log('PASS: 30 axe-core WCAG checks.');})().catch(e=>{console.error(e);process.exit(1)});
