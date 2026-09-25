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

 const p=await browser.newPage();
 await p.route('https://fonts.googleapis.com/**',r=>r.abort());
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 const assert=(condition,message)=>{if(!condition)throw Error(message)};
 const failures=[];const exceptions=new Map();
 for(const name of ['index','investigacion','proyectos','proyecto','colaboradores','awards','contacto']) {
  await p.goto(base+pageRoutes[name]);
  for(const language of ['en','es']) {
   await p.evaluate(language=>FannyI18n.translatePage(language),language);
   const result=await p.evaluate(language=>{
    const pattern=language==='en' ? /\b(?:Universidad|Facultad|Escuela|Centro|Vicerrectoría|Investigación|Innovación|Fondo|Beca|Doctorado|Extranjero|Desarrollo|Prototipos|Género|Ciencia|Convocatoria|Académicas|Obras Civiles|Sociedad|Gobierno|Clínica|Registro)\b/i : /\b(?:University|Faculty|School|Vice-Rectorate|Directorate|Foundation|Research Center|Research Fund|Scholarship Abroad|Leadership Initiative|Working Group|Global Burden)\b/i;
    const failures=[];const exceptions=[];
    const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
    const check=(text,element,attribute=false)=>{
     if(!pattern.test(text))return;
     if(element.closest('script,style'))return;
     const parent=element.closest('.publication-detail-column');
     const citation=parent?.querySelector('h3')?.dataset.i18n==='content.s0482';
     let reason='';
     if(element.closest('.publication-authors,.publication-source') || element.closest('.publication-card-copy h2'))reason='Official article, author or journal';
     else if(citation && element.closest('[translate=no]'))reason='Original bibliographic reference';
     else if(attribute && /^(Preview of |Vista previa de )/.test(text))reason='Original article title in preview description';
     else if(text.trim()==='Cooperativa Ciencia ·')reason='Protected media brand';
     if(reason)exceptions.push({text:text.trim().slice(0,200),reason});
     else failures.push({text:text.trim().slice(0,200),element:element.tagName,attribute});
    };
    let node;while(node=walker.nextNode())check(node.nodeValue,node.parentElement);
    for(const e of document.querySelectorAll('[alt],[title],[aria-label],[placeholder],meta[name=description]')){
     for(const attr of ['alt','title','aria-label','placeholder','content'])if(e.hasAttribute(attr))check(e.getAttribute(attr),e,attr);
    }
    const referenceErrors=[];
    for(const section of Object.keys(FannyTranslations[language]))for(const key of Object.keys(FannyTranslations[language][section])){
     const value=FannyI18n.getTranslation(section+'.'+key,language);
     if(typeof value==='string' && value.includes('{@'))referenceErrors.push(section+'.'+key);
    }
    return {failures,exceptions,referenceErrors};
   },language);
   failures.push(...result.failures.map(f=>({name,language,...f})),...result.referenceErrors.map(key=>({name,language,key})));
   result.exceptions.forEach(e=>exceptions.set(e.reason+e.text,e));
   if(['index','contacto'].includes(name)){
    const privacy=p.locator('.privacy-principles-text');
    assert(await privacy.evaluate(e=>e.tagName==='SPAN' && !e.closest('a') && !e.hasAttribute('tabindex')),'privacy is plain text');
    assert(await privacy.evaluate(e=>getComputedStyle(e).color===getComputedStyle(e.parentElement).color),'privacy matches paragraph colour');
   }
  }
  if(name==='investigacion'){
   const link=p.locator('.publications-all-link a');
   await p.mouse.move(0,0);
   assert(await link.evaluate(e=>getComputedStyle(e).textDecorationLine)==='none','Scholar link normal state');
   await link.hover();assert((await link.evaluate(e=>getComputedStyle(e).textDecorationLine)).includes('underline'),'Scholar hover');
   await p.mouse.move(0,0);await link.focus();assert((await link.evaluate(e=>getComputedStyle(e).textDecorationLine)).includes('underline'),'Scholar keyboard focus');
   assert((await link.getAttribute('href')).includes('user=eS_SYGMAAAAJ'),'Scholar destination retained');
  }
 }
 const result={failures,exceptions:[...exceptions.values()],errors};
 fs.writeFileSync(path.join(root,'outputs/i18n-institutional-audit.json'),JSON.stringify(result,null,2));
 assert(failures.length===0,JSON.stringify(failures));assert(errors.length===0,errors.join(';'));
 console.log('PASS: all seven pages in EN/ES; institutional glossary, reference resolution, residual language audit, privacy text, Scholar hover/focus and destination. Exceptions logged.');
} finally {await browser?.close();server.close();}
