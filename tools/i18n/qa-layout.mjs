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
 const p=await browser.newPage();if (process.env.OFFLINE_FONTS) await p.route('https://fonts.googleapis.com/**',r=>r.abort());
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,364,390,480,500,768,800,986,1024,1050,1440]){
 await p.setViewportSize({width,height:900});
 for(const name of ['index','investigacion','proyectos','colaboradores','contacto','awards','proyecto']){
  await p.goto(base+pageRoutes[name]);
  await p.evaluate(() => document.fonts.ready);
  for(const lang of ['en','es']){
   await p.evaluate(lang=>FannyI18n.translatePage(lang),lang);
   const data=await p.evaluate(()=>({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth,wide:[...document.querySelectorAll('body *')].filter(e=>{const b=e.getBoundingClientRect();return b.width && b.right>innerWidth+1 && getComputedStyle(e).position!=='fixed'}).slice(0,8).map(e=>[e.tagName,e.className,e.textContent.trim().slice(0,40)]),missing:[...document.querySelectorAll('[data-i18n]')].filter(e=>!FannyI18n.getTranslation(e.dataset.i18n)).map(e=>e.dataset.i18n),title:document.querySelector('h1').innerText}));
   console.log(JSON.stringify({name,width,...data}));
   if(data.overflow || data.missing.length) throw Error('Layout or missing key: '+name+' '+width+' '+lang);
  }
 }
 }
 if(errors.length) throw Error(errors.join(';'));
 console.log('PASS: layout matrix complete');
} finally {await browser?.close();server.close();}

