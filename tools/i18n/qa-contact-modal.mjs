// Controlled Promise tests only: no emails are sent and no test transport ships to the site.
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../../',import.meta.url)));
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
  for (const name of ['index.html','contact/index.html']) {
    const page=await browser.newPage({viewport:{width:1440,height:900}});
    await page.route('https://fonts.googleapis.com/**',route=>route.abort());
    await page.route('https://cdn.jsdelivr.net/npm/@emailjs/**',route=>route.fulfill({contentType:'text/javascript',body:'window.emailjs={init:options=>window.testInit=options};'}));
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(pathToFileURL(path.join(root,name)).href);
    const form=page.locator('[data-contact-form]');
    const submit=form.locator('[type=submit]');
    const modal=page.locator('.contact-status-modal');
    await page.evaluate(()=>{
      window.testCalls=[];
      window.emailjs={sendForm:(service,template,form,options)=>{
        testCalls.push({service,template,options,values:Object.fromEntries(new FormData(form))});
        return new Promise((resolve,reject)=>{window.testResolve=resolve;window.testReject=reject});
      }};
    });
    const calls=()=>page.evaluate(()=>testCalls.length);
    const state=async expected=>{await page.waitForFunction(s=>document.querySelector('.contact-status-modal').dataset.state===s,expected)};
    const fill=async()=>{
      await form.locator('[name=name]').fill('Modal QA');
      await form.locator('[name=email]').fill('qa@example.invalid');
      await form.locator('[name=institution]').fill('Test institution');
      await form.locator('[name=contact_purpose]').selectOption({index:1});
      await form.locator('[name=message]').fill('Controlled test; no email sent.');
    };
    await submit.click();assert.equal(await calls(),0);assert.equal(await modal.isVisible(),false);
    await fill();await form.locator('[name=email]').fill('invalid');
    await submit.click();assert.equal(await calls(),0);assert.equal(await modal.isVisible(),false);
    await form.locator('[name=email]').fill('qa@example.invalid');
    for (const language of ['en','es']) {
      await page.evaluate(language=>FannyI18n.translatePage(language),language);
      await fill();const before=await calls();
      await submit.click();await state('sending');
      assert.equal(await calls(),before+1);
      const sent=await page.evaluate(()=>testCalls.at(-1));
      assert.equal(sent.service,'service_238se1p');assert.equal(sent.template,'template_ae6yeqi');
      assert.equal(sent.values.language,language.toUpperCase());assert.equal(sent.values.page_url,page.url());
      assert.deepEqual(Object.keys(sent.values).sort(),['name','email','institution','contact_purpose','message','language','page_url'].sort());
      assert.equal(await page.evaluate(()=>testInit.publicKey),'KP7mPpxrPnFpwfeqH');
      assert.ok(await submit.isDisabled());
      assert.equal(await form.locator('[name=name]').inputValue(),'Modal QA');
      assert.equal(await modal.locator('h2').textContent(),language==='en'?'Sending message':'Enviando mensaje');
      assert.ok(await modal.locator('.contact-status-spinner').isVisible());
      await page.evaluate(()=>document.querySelector('[data-contact-form]').dispatchEvent(new Event('submit',{cancelable:true})));
      assert.equal(await calls(),before+1,'duplicate submit blocked');
      await page.keyboard.press('Escape');assert.ok(await modal.isVisible());
      for(const key of ['Tab','Shift+Tab']) {await page.keyboard.press(key);assert.ok(await modal.evaluate(e=>e.contains(document.activeElement)));}
      await page.evaluate(()=>document.querySelector('.brand').focus());
      assert.ok(await modal.evaluate(e=>e.contains(document.activeElement)),'background inert');
      for(const width of [320,390,800,1440]) {
        await page.setViewportSize({width,height:900});
        const bounds=await modal.boundingBox();assert.ok(bounds.width<=width-32+1 && bounds.x>=15);
        assert.ok(await modal.evaluate(e=>e.scrollWidth<=e.clientWidth));
      }
      await page.emulateMedia({reducedMotion:'reduce'});
      assert.equal(await modal.locator('.contact-status-spinner').evaluate(e=>getComputedStyle(e).animationName),'none');
      await page.emulateMedia({reducedMotion:'no-preference'});
      assert.equal(await modal.locator('.contact-status-spinner').evaluate(e=>getComputedStyle(e).animationName),'contact-status-spin');
      if(name==='index.html' && language==='es') {
        fs.mkdirSync(path.join(root,'outputs/contact-modal'),{recursive:true});
        await page.screenshot({path:path.join(root,'outputs/contact-modal/sending-desktop.png')});
      }
      await page.evaluate(()=>testReject(new Error('Private provider error must never be displayed')));
      await state('error');assert.ok(await submit.isEnabled());
      assert.equal(await form.locator('[name=name]').inputValue(),'Modal QA');
      assert.ok(!(await modal.textContent()).includes('Private provider'));
      for(const width of [320,800,1440]) {
        await page.setViewportSize({width,height:600});
        assert.ok(await modal.evaluate(e=>e.scrollWidth<=e.clientWidth),'error text fits');
      }
      await modal.locator('[data-contact-primary]').click();await state('sending');
      assert.equal(await calls(),before+2);
      await page.evaluate(()=>testResolve({status:200,text:'OK'}));await state('success');
      assert.equal(await form.locator('[name=name]').inputValue(),'');
      assert.ok(await submit.isEnabled());
      assert.equal(await modal.locator('h2').textContent(),language==='en'?'Message sent':'Mensaje enviado');
      for(let i=0;i<5;i++) {await page.keyboard.press('Tab');assert.ok(await modal.evaluate(e=>e.contains(document.activeElement)));}
      await modal.locator('.contact-status-x').focus();await page.keyboard.press('Shift+Tab');
      assert.ok(await modal.locator('[data-contact-primary]').evaluate(e=>e===document.activeElement));
      if(name==='index.html' && language==='es') {
        await page.screenshot({path:path.join(root,'outputs/contact-modal/success-desktop.png')});
        await page.setViewportSize({width:390,height:900});
        await page.screenshot({path:path.join(root,'outputs/contact-modal/success-mobile.png')});
      }
      await modal.locator('[data-contact-primary]').click();
      await page.waitForFunction(()=>!document.querySelector('.contact-status-modal').open);
      assert.ok(await submit.evaluate(e=>document.activeElement===e),'focus restored');
      assert.equal(await page.locator('.contact-status-modal').count(),1);
      for(const dismiss of ['x','escape']) {
        await fill();await submit.click();await state('sending');
        await page.evaluate(()=>testResolve({status:200,text:'OK'}));await state('success');
        if(dismiss==='x') await modal.locator('.contact-status-x').click();
        else await page.keyboard.press('Escape');
        await page.waitForFunction(()=>!document.querySelector('.contact-status-modal').open);
        assert.ok(await submit.evaluate(e=>document.activeElement===e));
      }
    }
    // Real unavailable-SDK branch: never report success or clear the form.
    await page.evaluate(()=>{delete window.emailjs;});
    await fill();await submit.click();await state('error');
    assert.equal(await form.locator('[name=name]').inputValue(),'Modal QA');
    await modal.locator('.contact-status-x').click();await page.waitForFunction(()=>!document.querySelector('dialog').open);
    await submit.click();await state('error');await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('dialog').open);
    assert.ok(await submit.evaluate(e=>document.activeElement===e));
    assert.deepEqual(errors,[]);
    console.log('PASS',name,'validation, EN/ES, controlled send/retry/success/error, no duplicate, reset/preserve, focus, close, breakpoints, reduced motion, unavailable SDK');
    await page.close();
  }
} finally {await browser.close();}
