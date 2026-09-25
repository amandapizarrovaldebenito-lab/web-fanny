const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
const root=path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const server=http.createServer((req,res)=>{let target=path.join(root,decodeURIComponent(req.url.split('?')[0]));if(fs.existsSync(target) && fs.statSync(target).isDirectory())target=path.join(target,'index.html');if(!target.startsWith(root))return res.end();fs.readFile(target,(e,data)=>{res.statusCode=e?404:200;res.setHeader('Content-Type',target.endsWith('.js')?'text/javascript; charset=utf-8':target.endsWith('.css')?'text/css':target.endsWith('.html')?'text/html; charset=utf-8':target.endsWith('.svg')?'image/svg+xml':'application/octet-stream');res.end(e?'missing':data)});});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const pageRoutes={"index": "", "investigacion": "publications/", "proyectos": "projects/", "proyecto": "projects/act-early/", "colaboradores": "collaborations/", "awards": "awards/", "contacto": "contact/"};
const base=`http://127.0.0.1:${server.address().port}/`;
let browser;
try {
 browser=await chromium.launch({channel:'msedge',headless:true,timeout:20000});

 const p=await browser.newPage({locale:'es-CL'});
 if (process.env.OFFLINE_FONTS) await p.route('https://fonts.googleapis.com/**',r=>r.abort());
 p.setDefaultTimeout(8000);
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const assert=(v,msg)=>{if(!v)throw Error(msg)};
 const lang=async value=>{await p.evaluate(v=>FannyI18n.translatePage(v),value);};
 const visible=selector=>p.locator(selector).evaluateAll(es=>es.map((e,i)=>e.hidden ? null : i).filter(i=>i!==null));
 await p.goto(base+'');
 assert(await p.locator('html').getAttribute('lang')==='en','default ignores browser language');
 await p.locator('[data-lang=es]').click();
 assert(await p.evaluate(()=>localStorage.getItem('fanny-site-language'))==='es','saved preference');
 await p.reload();assert(await p.locator('html').getAttribute('lang')==='es','reload persistence');
 for(const name of ['index','investigacion','proyectos','colaboradores','contacto','awards','proyecto']){
  await p.goto(base+pageRoutes[name]);assert(await p.locator('html').getAttribute('lang')==='es','navigation persistence '+name);
  const names=await p.locator('[translate=no]').allTextContents();
  await p.locator('[data-lang=en]').click();
  assert(JSON.stringify(names)===JSON.stringify(await p.locator('[translate=no]').allTextContents()),'protected names '+name);
  await p.locator('[data-lang=es]').click();
 }
 await p.goto(base+'publications/');await lang('en');
 await p.locator('[data-publication-pagination] button').filter({hasText:/^2$/}).click();
 const page2=await p.locator('[data-publication-results]').textContent();
 const ids2=await visible('[data-publication-card]');await lang('es');
 assert((await p.locator('[data-publication-results]').textContent()).includes('Página 2'),'page persisted');
 assert(JSON.stringify(ids2)===JSON.stringify(await visible('[data-publication-card]')),'publication ids persisted');
 for(const selector of ['[data-publication-type]','[data-publication-period]','[data-publication-year]']){
  const n=await p.locator(selector).count();
  for(let i=0;i<n;i++){
   await p.locator(selector).nth(i).evaluate(e=>e.click());
   const ids=await p.locator('[data-publication-card]').evaluateAll(es=>es.filter(e=>!e.hidden).map(e=>e.querySelector('[data-publication-toggle]').getAttribute('aria-controls')));
   await lang('en');await lang('es');
   assert(JSON.stringify(ids)===JSON.stringify(await p.locator('[data-publication-card]').evaluateAll(es=>es.filter(e=>!e.hidden).map(e=>e.querySelector('[data-publication-toggle]').getAttribute('aria-controls')))),'publication selection persisted');
  }
 }
 for(const [name,selectors,cards] of [
  ['proyectos',['.projects-filters [data-filter]','[data-project-year]'],'[data-project-card]'],
  ['colaboradores',['[data-collaborator-filter]'],'[data-collaborator]'],
  ['colaboradores',['[data-thesis-status]','[data-thesis-year]'],'[data-thesis-student]']]){
  await p.goto(base+pageRoutes[name]);
  for(const selector of selectors){
   for(let i=0;i<await p.locator(selector).count();i++){
    await p.locator(selector).nth(i).evaluate(e=>e.click());
    const get=()=>p.locator(cards).evaluateAll(es=>es.map(e=>e.hidden));
    const flags=await get();await lang('en');await lang('es');assert(JSON.stringify(flags)===JSON.stringify(await get()),'filter persisted '+selector+i);
   }
  }
 }
 for(const name of ['index','contacto']){
  await p.goto(base+pageRoutes[name]);await lang('es');
  const form=p.locator('[data-contact-form]');
  const required=form.locator('[required]').first();
  assert((await required.evaluate(e=>e.validationMessage)).includes('Completa'),'localised validation');
  await form.locator('input:not([type=email])').first().fill('Prueba');
  await form.locator('input[type=email]').fill('fanny-test@example.com');
  await form.locator('select').selectOption({index:1});await form.locator('textarea').fill('Mensaje de prueba local.');
  const before=await form.evaluate(e=>[...new FormData(e).entries()]);await lang('en');
  assert(JSON.stringify(before)===JSON.stringify(await form.evaluate(e=>[...new FormData(e).entries()])),'form values persisted');
  await form.locator('[type=submit]').click();assert((await form.locator('[data-form-status]').textContent()).includes('submission service'),'English form status');
  await lang('es');assert((await form.locator('[data-form-status]').textContent()).includes('servicio'),'Spanish form status');
 }
 await p.setViewportSize({width:390,height:900});
 for(const name of ['investigacion','proyectos','colaboradores']){
  await p.goto(base+pageRoutes[name]);
  for(let i=0;i<await p.locator('.mobile-filters').count();i++){
   const shell=p.locator('.mobile-filters').nth(i);
   await shell.locator('.mobile-filter-toggle').click();
   const select=shell.locator('select').first();await select.selectOption({index:1});
   const value=await select.inputValue();await lang('en');assert(await select.inputValue()===value,'draft preserved');
   await lang('es');await shell.locator('.mobile-filter-actions button').last().click();
   assert(!(await shell.locator('.mobile-filter-panel').isVisible()),'apply closes');
   assert(await shell.locator('.mobile-filter-chip').count()===1,'chip');
   assert((await shell.locator('.mobile-filter-toggle').textContent()).includes('Filtros (1)'),'filter caption ES');
   await lang('en');assert((await shell.locator('.mobile-filter-toggle').textContent()).includes('Filters (1)'),'filter caption EN');
   await p.setViewportSize({width:1440,height:900});await p.setViewportSize({width:390,height:900});
   assert(await shell.locator('.mobile-filter-chip').count()===1,'breakpoint selection');
   await shell.locator('.mobile-filter-chip').click();assert(await shell.locator('.mobile-filter-chip').count()===0,'remove chip');
  }
  await p.locator('[data-menu-toggle]').click();await p.locator('[data-lang=es]').focus();await p.keyboard.press('Enter');
  assert(await p.locator('html').getAttribute('lang')==='es','keyboard language switch');
  assert(await p.locator('[data-menu-toggle]').getAttribute('aria-label')==='Cerrar navegación','open menu label');
  await p.keyboard.press('Escape');assert(await p.locator('[data-menu-toggle]').getAttribute('aria-expanded')==='false','Escape closes menu');
 }
 await p.goto(base+'publications/');await lang('es');
 await p.locator('.mobile-filter-toggle').click();await p.screenshot({path:root+'/outputs/i18n-publications-mobile-es.png',fullPage:false});
 await p.setViewportSize({width:800,height:900});await p.goto(base+'publications/');await p.screenshot({path:root+'/outputs/i18n-publications-tablet-es.png'});
 await p.setViewportSize({width:1440,height:900});await p.goto(base+'');await p.screenshot({path:root+'/outputs/i18n-home-desktop-es.png'});
 await p.goto(base+'collaborations/');
 await lang('es');
 for(const toggle of await p.locator('[data-reveal-toggle]').all()) {
  await toggle.evaluate(e=>e.click());await lang('en');
  assert((await toggle.textContent()).includes('fewer'),'expanded reveal label');
  await lang('es');assert((await toggle.textContent()).includes('menos'),'translated reveal label');
 }
 await p.goto(base+'publications/');await lang('es');
 const detail=p.locator('[data-publication-toggle]').first();await detail.click();
 assert((await detail.textContent()).includes('Ocultar'),'details label');
 await lang('en');assert((await detail.textContent()).includes('Hide'),'expanded details label retained');
 const blocked=await browser.newPage();await blocked.addInitScript(()=>Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Unavailable','SecurityError')}}));
 await blocked.goto(base+'');assert(await blocked.locator('html').getAttribute('lang')==='en','storage unavailable defaults to English');
 await blocked.evaluate(()=>FannyI18n.translatePage('es'));assert(await blocked.locator('html').getAttribute('lang')==='es','storage unavailable can switch');await blocked.close();
 await p.evaluate(()=>localStorage.setItem('fanny-site-language','invalid'));await p.reload();assert(await p.locator('html').getAttribute('lang')==='en','invalid stored language');
 assert(errors.length===0,'console errors '+errors.join(';'));
 console.log('PASS: default, persistence, all seven pages, protected names, every desktop filter, publication pagination, mobile panels/chips/drafts/breakpoint, keyboard menu, both forms/validation.');
} finally {await browser?.close();server.close();}


