// Browser checks for direct Windows file navigation, HTTP root/subpath and mocked HTTPS.
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const routes = JSON.parse(fs.readFileSync(new URL('./routes.json', import.meta.url)));
const pages = Object.values(routes);
const clean = file => file.slice(0, -10);
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.pdf':'application/pdf'};
function resource(url) {
  const relative = decodeURIComponent(new URL(url).pathname).replace(/^\/repository\//, '/');
  let target = path.resolve(root, '.' + relative);
  if (!target.startsWith(root + path.sep) && target !== root) return {status:403, body:'forbidden'};
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  return fs.existsSync(target) ? {status:200, contentType:types[path.extname(target).toLowerCase()] || 'application/octet-stream', body:fs.readFileSync(target)} : {status:404, body:'missing'};
}
const server = http.createServer((request, response) => {
  const result = resource('http://localhost' + request.url);
  response.writeHead(result.status, {'Content-Type':result.contentType || 'text/plain'});
  response.end(result.body);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
const results = [];
try {
  browser = await chromium.launch({channel:'msedge', headless:true, timeout:20000});
  const modes = [
    {name:'file', base:pathToFileURL(root + path.sep).href},
    {name:'http-root', base:`http://127.0.0.1:${server.address().port}/`},
    {name:'http-project', base:`http://127.0.0.1:${server.address().port}/repository/`},
    {name:'https-project-simulated', base:'https://url-qa.invalid/repository/'},
  ];
  for (const mode of modes) {
    const context = await browser.newContext({viewport:{width:1440,height:900}});
    await context.route('https://fonts.googleapis.com/**', route => route.abort());
    await context.route('https://url-qa.invalid/**', route => route.fulfill(resource(route.request().url())));
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.url().startsWith(mode.base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    page.on('requestfailed', request => { if (request.url().startsWith(mode.base)) errors.push(request.url() + ' ' + request.failure()?.errorText); });
    const url = file => mode.base + (mode.name === 'file' ? file : clean(file));
    const settled = async file => {
      await page.waitForURL(url(file));
      await page.locator('main h1').waitFor();
      await page.waitForFunction(() => Boolean(window.FannyI18n));
      assert.equal(await page.title().then(title => title.startsWith('Index of')), false);
    };
    const go = async file => { await page.goto(url(file)); await settled(file); };
    const clickTo = async (selector, file) => {
      const links = page.locator(selector);
      const index = await links.evaluateAll((items, target) => items.findIndex(a => a.href === target), url(file));
      assert.ok(index >= 0, `${mode.name}: ${selector} -> ${file}`);
      await links.nth(index).evaluate(a => a.click());
      await settled(file);
    };
    for (const file of pages) {
      await go(file);
      const links = await page.locator('a[href]').evaluateAll(items => items.map(a => ({href:a.getAttribute('href'), resolved:a.href})));
      for (const link of links.filter(a => a.resolved.startsWith(mode.base) && !a.href.startsWith('#'))) {
        const pathname = new URL(link.resolved).pathname;
        if (pathname.endsWith('/') || pathname.endsWith('.html')) {
          assert.ok(mode.name === 'file' ? pathname.endsWith('/index.html') : pathname.endsWith('/'), `${mode.name} ${file} ${link.href}`);
        }
      }
      await page.locator('[data-lang=es]').click();
      assert.equal(await page.locator('html').getAttribute('lang'), 'es');
      await page.reload();
      assert.equal(await page.locator('html').getAttribute('lang'), 'es', 'language persists after reload');
      await page.locator('[data-lang=en]').click();
      assert.equal(await page.locator('html').getAttribute('lang'), 'en');
      await page.locator('[data-publication-toggle]').first().evaluateAll(items => items[0]?.click());
      await page.locator('[data-reveal-toggle]').first().evaluateAll(items => items[0]?.click());
      await page.setViewportSize({width:390,height:900});
      await page.locator('[data-menu-toggle]').click();
      assert.equal(await page.locator('[data-menu-toggle]').getAttribute('aria-expanded'), 'true');
      await page.locator('.nav-dropdown-toggle').click();
      assert.equal(await page.locator('.nav-dropdown-toggle').getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape');
      await page.locator('.mobile-filter-toggle').first().evaluateAll(items => items[0]?.click());
      await page.locator('img[src]').evaluateAll(images => images.forEach(image => image.loading='eager'));
      await page.waitForFunction(() => [...document.querySelectorAll('img[src]')].filter(image => image.getAttribute('src')).every(image => image.complete));
      const broken = await page.locator('img[src]').evaluateAll(images => images.filter(image => image.getAttribute('src') && !image.naturalWidth).map(image => image.src));
      assert.deepEqual(broken, [], `${mode.name}: ${file} images`);
      await page.setViewportSize({width:1440,height:900});
      const footerInternal = await page.locator('footer a[href]').evaluateAll((items, base) => items.find(a => a.href.startsWith(base) && !a.getAttribute('href').startsWith('#'))?.href, mode.base);
      if (footerInternal) {
        await page.locator('footer a[href]').evaluateAll((items, target) => items.find(a => a.href === target).click(), footerInternal);
        await page.waitForURL(footerInternal);
        await page.locator('main h1').waitFor();
      }
      await clickTo('.brand', 'index.html');
    }
    // Actual header journeys and the Projects dropdown on mobile.
    for (const file of pages.filter(file => file !== 'index.html')) {
      await go('index.html');
      await page.setViewportSize({width:390,height:900});
      await page.locator('[data-menu-toggle]').click();
      if (file.startsWith('projects/')) await page.locator('.nav-dropdown-toggle').click();
      const nav = page.locator('[data-main-nav] a');
      const index = await nav.evaluateAll((items,target) => items.findIndex(a => a.href === target),url(file));
      await nav.nth(index).click();
      await settled(file);
      await page.locator('.brand').click();
      await settled('index.html');
    }
    await page.setViewportSize({width:1440,height:900});
    await go('projects/index.html');
    await clickTo('main a[href]', 'projects/act-early/index.html');
    await clickTo('[data-main-nav] a', 'projects/index.html');
    await go('index.html');
    await clickTo('main a[href]', 'projects/act-early/index.html');
    // Query strings and anchors survive legacy redirects in every protocol.
    for (const [old, file] of Object.entries(routes).filter(([old,file]) => old !== file)) {
      await page.goto(mode.base + old + '?source=legacy#main');
      await page.waitForURL(url(file) + '?source=legacy#main');
      await page.locator('main h1').waitFor();
    }
    // Exercise file-only adaptation without changing public or external hrefs.
    await go('index.html');
    const fixtures = ['projects/?source=test#featured-project','#main','https://example.org/','//example.org/','mailto:test@example.org','tel:123','javascript:void(0)','Información/CV - Fanny Petermann.pdf'];
    const adapted = await page.evaluate(fixtures => {
      const links = fixtures.map(href => { const a=document.createElement('a'); a.href=href; document.body.append(a); return a; });
      enableLocalFileNavigation();
      const values=links.map(a=>a.getAttribute('href'));links.forEach(a=>a.remove());return values;
    }, fixtures);
    assert.deepEqual(adapted, fixtures.map((href,i) => mode.name==='file' && i===0 ? 'projects/index.html?source=test#featured-project' : href));
    assert.deepEqual(errors, [], mode.name);
    results.push({mode:mode.name,pages:7,legacyRedirects:6,images:'pass',header:'pass',footer:'pass',mobileMenu:'pass',language:'pass',projectsActEarly:'pass'});
    console.log('PASS', JSON.stringify(results.at(-1)));
    await context.close();
  }
  // With JavaScript disabled, redirect fallback still opens a file, never a folder.
  const fallback = await browser.newContext({javaScriptEnabled:false});
  const fallbackPage = await fallback.newPage();
  for (const [old,file] of Object.entries(routes).filter(([old,file])=>old!==file)) {
    await fallbackPage.goto(pathToFileURL(path.join(root,old)).href);
    await fallbackPage.waitForURL(pathToFileURL(path.join(root,file)).href);
    await fallbackPage.locator('main h1').waitFor();
  }
  await fallback.close();
  fs.mkdirSync(path.join(root,'outputs'),{recursive:true});
  fs.writeFileSync(path.join(root,'outputs/url-qa.json'),JSON.stringify({results,localRedirectsWithoutJavaScript:'pass'},null,2));
  console.log('PASS: all six local no-JavaScript redirect fallbacks.');
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
