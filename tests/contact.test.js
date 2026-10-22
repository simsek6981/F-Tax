const { test } = require('node:test');
const assert = require('node:assert/strict');
const api = require('../assets/js/contact.js');
const fs = require('node:fs');
const path = require('node:path');
const config = { serviceId:'service_test', templateId:'template_test', publicKey:'public_test' };
const data = { from_name:'  Muster Person ', from_email:' person@example.com ', company:'Beispiel GmbH', phone:'', appointment:'', topic:'Buchhaltung', message:'Bitte informieren Sie mich über die laufende Buchhaltung.', website:'' };

test('HTML template variables match the actual API payload and stay HTML-escaped', async () => {
  const html = fs.readFileSync(path.join(__dirname, '../assets/email-templates/contact-notification.html'), 'utf8');
  let params;
  await api.sendMessage(data, config, async (_, options) => {
    params = JSON.parse(options.body).template_params;
    return {ok:true,status:200};
  });
  const variables = [...new Set([...html.matchAll(/\{\{[#^/]?([a-z_]+)\}\}/g)].map(match => match[1]))].sort();
  assert.deepEqual(variables, Object.keys(params).sort());
  assert.equal(html.includes('{{{'), false);
  assert.equal(/<script\b/i.test(html), false);
  assert.equal(html.includes('white-space:pre-wrap'), true);
  for (const field of ['company', 'phone']) assert.ok(html.includes('{{^'+field+'}}Nicht angegeben{{/'+field+'}}'));
});

test('Missing keys and placeholder keys cannot enable sending', () => {
  assert.equal(api.isConfigured({}), false);
  assert.equal(api.isConfigured({...config,publicKey:'YOUR_PUBLIC_KEY'}), false);
  assert.equal(api.isConfigured(config), true);
});

test('A minimal appointment request needs only name and email and supplies safe defaults', async () => {
  let payload;
  await api.sendMessage({from_name:'Alex Beispiel',from_email:'alex@example.com'},config,async(_,options)=>{
    payload=JSON.parse(options.body).template_params;return {ok:true,status:200};
  });
  assert.equal(payload.topic,'Erstgespräch');
  for(const name of ['company','phone','appointment','message'])assert.equal(payload[name],'');
  assert.equal(payload.reply_to,'alex@example.com');
  for(const appointment of ['x'.repeat(161),'Dienstag\r\nInjected'])assert.throws(()=>api.normalizeAndValidate({...data,appointment}),e=>e.code==='validation');
});
test('Validation normalizes valid values and rejects unknown topics, invalid email and oversized messages', () => {
  assert.equal(api.normalizeAndValidate(data).from_name,'Muster Person');
  assert.equal(api.normalizeAndValidate(data).from_email,'person@example.com');
  for (const input of [{...data,topic:'Digitalisierung'}, {...data,from_email:'invalid'}, {...data,from_name:'Name\nInjected'}, {...data,message:'x'.repeat(4001)}]) assert.throws(()=>api.normalizeAndValidate(input),error=>error.code==='validation');
});
test('EmailJS receives the expected payload and no client-selected recipient or private key', async () => {
  let call;
  const result = await api.sendMessage(data,config,async(url,options)=>{call={url,options};return {ok:true,status:200};});
  assert.deepEqual(result,{accepted:true});
  assert.equal(call.url,'https://api.emailjs.com/api/v1.0/email/send');
  assert.equal(call.options.method,'POST');
  const body=JSON.parse(call.options.body);
  assert.equal(body.user_id,config.publicKey);
  assert.equal(body.template_params.reply_to,'person@example.com');
  assert.equal(body.template_params.topic,'Buchhaltung');
  assert.equal('to_email' in body.template_params,false);
  assert.equal('accessToken' in body,false);
});
test('Unconfigured form and honeypot never trigger the network', async()=>{
  let calls=0;const fetcher=async()=>{calls++;return {ok:true,status:200};};
  await assert.rejects(api.sendMessage(data,{},fetcher),error=>error.code==='configuration');
  await assert.rejects(api.sendMessage({...data,website:'spam'},config,fetcher),error=>error.code==='spam');
  assert.equal(calls,0);
});
test('Rate limits, service errors, network failures and timeouts never become successful sends', async()=>{
  await assert.rejects(api.sendMessage(data,config,async()=>({ok:false,status:429})),error=>error.code==='rate_limit');
  await assert.rejects(api.sendMessage(data,config,async()=>({ok:false,status:500})),error=>error.code==='service');
  await assert.rejects(api.sendMessage(data,config,async()=>{throw new TypeError('offline');}),error=>error.code==='network');
  await assert.rejects(api.sendMessage(data,config,async()=>{const e=new Error();e.name='AbortError';throw e;}),error=>error.code==='timeout');
});

function harness(settings=config) {
  const fields={};
  for(const [key,value] of Object.entries(data)) fields[key]={value,addEventListener(){},setCustomValidity(){},setAttribute(){},removeAttribute(){},focus(){},reportValidity(){return true;}};
  const button={disabled:true,textContent:''},status={textContent:'',dataset:{}},notice={hidden:false,textContent:''},counter={textContent:''};
  const form={elements:{namedItem:key=>fields[key]},querySelector:()=>button,querySelectorAll:()=>Object.values(fields),setAttribute(){},reportValidity:()=>true,reset(){for(const field of Object.values(fields))field.value='';},addEventListener(name,handler){if(name==='submit')this.submit=handler;}};
  const doc={querySelector:selector=>({'[data-contact-form]':form,'[data-contact-status]':status,'[data-contact-notice]':notice,'[data-message-count]':counter}[selector]),getElementById:()=>({textContent:JSON.stringify(settings)})};
  api.mount(doc);return {form,fields,button,status,notice};
}
test('Successful submit resets the form and prevents an immediate duplicate', async()=>{
  const previous=global.fetch;let calls=0;global.fetch=async()=>{calls++;return {ok:true,status:200};};
  try{const h=harness();assert.equal(h.button.disabled,false);await h.form.submit({preventDefault(){}});assert.equal(h.status.dataset.state,'success');assert.equal(h.fields.message.value,'');h.fields.message.value=data.message;await h.form.submit({preventDefault(){}});assert.equal(calls,1);}finally{global.fetch=previous;}
});
test('Failed submit preserves user input and unlocks the button', async()=>{
  const previous=global.fetch;global.fetch=async()=>({ok:false,status:500});
  try{const h=harness();await h.form.submit({preventDefault(){}});assert.equal(h.fields.message.value,data.message);assert.equal(h.status.dataset.state,'error');assert.equal(h.button.disabled,false);}finally{global.fetch=previous;}
});
test('Missing configuration and offline previews cannot send even with configured public keys', async()=>{
  const previous=global.fetch;let calls=0;global.fetch=async()=>{calls++;return {ok:true,status:200};};
  try{const h=harness({});assert.equal(h.button.disabled,true);await h.form.submit({preventDefault(){}});global.FTAX_PREVIEW_ONLY=true;const p=harness();assert.equal(p.button.disabled,true);await p.form.submit({preventDefault(){}});assert.equal(calls,0);}finally{global.fetch=previous;delete global.FTAX_PREVIEW_ONLY;}
});

