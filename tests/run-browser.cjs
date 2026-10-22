const {spawn}=require('node:child_process');
const fs=require('node:fs');const path=require('node:path');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..');
const suites={browser:'browser.cjs',mobile:'mobile.cjs',accessibility:'accessibility.cjs'};
const selected=process.argv.slice(2);
let server;
async function main(){
 if(!selected.length||selected.some(name=>!suites[name]))throw Error('Select browser, mobile or accessibility.');
 const env={...process.env,FTAX_QA_DIR:process.env.FTAX_QA_DIR||path.join(root,'output/playwright')};
 if(!env.FTAX_BROWSER_CHANNEL&&!fs.existsSync(chromium.executablePath())){
  if(process.platform==='win32'&&['PROGRAMFILES','PROGRAMFILES(X86)','LOCALAPPDATA'].some(key=>process.env[key]&&fs.existsSync(path.join(process.env[key],'Microsoft/Edge/Application/msedge.exe'))))env.FTAX_BROWSER_CHANNEL='msedge';
  else throw Error('Chromium is missing. Run npx playwright install chromium or set FTAX_BROWSER_CHANNEL.');
 }
 if(!env.FTAX_BASE_URL){
  server=spawn(process.env.PYTHON||'python',['tools/serve.py','--port','0'],{cwd:root,stdio:['ignore','pipe','pipe'],windowsHide:true});
  env.FTAX_BASE_URL=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Preview server did not start within 15 seconds.')),15000);
   let output='',errors='';
   server.stdout.on('data',data=>{output+=data;const match=output.match(/Local: (http:\/\/127\.0\.0\.1:\d+\/\S*)/);if(match){clearTimeout(timer);resolve(match[1]);}});
   server.stderr.on('data',data=>{errors+=data;});
   server.once('error',error=>{clearTimeout(timer);reject(error);});
   server.once('exit',code=>{clearTimeout(timer);reject(Error(`Preview server exited (${code}): ${errors}`));});
  });
 }
 console.log(`Browser: ${env.FTAX_BROWSER_CHANNEL||'Chromium'}; preview: ${env.FTAX_BASE_URL}`);
 for(const name of selected)await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,[path.join(__dirname,suites[name])],{cwd:root,env,stdio:'inherit',windowsHide:true});
  child.once('error',reject);child.once('exit',code=>code===0?resolve():reject(Error(`${name} failed (${code}).`)));
 });
}
main().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>server?.kill());
process.on('SIGINT',()=>{server?.kill();process.exit(130);});
process.on('SIGTERM',()=>{server?.kill();process.exit(143);});
