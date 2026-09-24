// Independent reconciliation against the workbook extract and manually reviewed glossary.
const {chromium} = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const audit = JSON.parse(fs.readFileSync(path.join(root, 'tools/i18n/publication-keywords-audit.json')));
const glossary = new Map();
for (const line of fs.readFileSync(path.join(root, 'tools/i18n/keyword-glossary.tsv'), 'utf8').trim().split(/\r?\n/).slice(1)) {
  const [originals, en, es] = line.split('\t');
  for (const original of originals.split('|')) glossary.set(original.toLowerCase(), {en, es});
}
const oldFile = name => execFileSync('git', ['show', `HEAD:${name}`], {cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024}).replace(/\r\n/g, '\n');
const read = name => fs.readFileSync(path.join(root, name), 'utf8').replace(/\r\n/g, '\n');
const stripKeywords = text => text.replace(/^[ \t]*<div class="publication-tags">[\s\S]*?<\/div>/gm, '')
  .replace(/^[ \t]*<p>\s*<strong data-i18n="content\.s0488">Keywords<\/strong>[\s\S]*?<\/p>/gm, '');
// Every byte outside the requested keyword markup stays unchanged, including abstracts.
if (process.argv.includes('--compare-head')) {
  assert.equal(read('investigacion.html'), stripKeywords(oldFile('investigacion.html')));
  assert.equal(read('assets/js/translations.js').split('// BEGIN AUDITED PUBLICATION KEYWORDS')[0].trim(), oldFile('assets/js/translations.js').trim());
}
assert.equal(audit.publications.length, 84);
const server = http.createServer((req, res) => {
  const target = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(target, (error, data) => {
    res.statusCode = error ? 404 : 200;
    res.setHeader('Content-Type', target.endsWith('.js') ? 'text/javascript; charset=utf-8' : target.endsWith('.html') ? 'text/html; charset=utf-8' : target.endsWith('.css') ? 'text/css' : 'application/octet-stream');
    res.end(error ? 'missing' : data);
  });
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({channel: 'msedge', headless: true, timeout: 20000});
  const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}/investigacion.html`);
  const originalTitles = await page.locator('[data-publication-card] h2').allTextContents();
  const sentinel = await page.evaluate(() => window.keywordQaSentinel = Math.random());
  for (const language of ['es', 'en', 'es']) {
    await page.locator(`[data-lang=${language}]`).click();
    assert.equal(await page.evaluate(() => window.keywordQaSentinel), sentinel, 'language switch must not reload');
    assert.deepEqual(await page.locator('[data-publication-card] h2').allTextContents(), originalTitles);
    const actual = await page.locator('[data-publication-card]').evaluateAll(cards => cards.map(card => ({
      id: card.dataset.publicationId,
      tags: [...card.querySelectorAll('.publication-tags span')].map(e => e.textContent),
      tagContainers: card.querySelectorAll('.publication-tags').length,
      detailBlocks: card.querySelectorAll('[data-publication-keywords]').length,
      detail: card.querySelector('[data-publication-keywords] .i18n-text')?.textContent,
    })));
    assert.equal(actual.length, 84);
    for (const record of audit.publications) {
      const expected = record.originalKeywords.map(term => glossary.get(term.toLowerCase())[language]);
      const card = actual.find(c => c.id === record.id);
      assert.deepEqual(card.tags, expected, `${record.id} ${language}`);
      assert.equal(card.tagContainers, expected.length ? 1 : 0, record.id);
      assert.equal(card.detailBlocks, expected.length ? 1 : 0, record.id);
      assert.equal(card.detail, expected.length ? expected.join('; ') : undefined, record.id);
    }
    for (const width of [320, 390, 500, 800, 986, 1050, 1440]) {
      await page.setViewportSize({width, height: 1000});
      // Check all cards, including records outside the current pagination page.
      const overflow = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('[data-publication-card]')];
        const hidden = cards.map(c => c.hidden);
        cards.forEach(c => c.hidden = false);
        const extra = document.documentElement.scrollWidth - innerWidth;
        cards.forEach((c, i) => c.hidden = hidden[i]);
        return extra;
      });
      assert.ok(overflow <= 1, `${language} ${width}: overflow ${overflow}`);
    }
  }
  assert.deepEqual(errors, []);
  if (process.env.QA_SCREENSHOT_DIR) {
    fs.mkdirSync(process.env.QA_SCREENSHOT_DIR, {recursive: true});
    await page.locator('[data-publication-toggle]').first().click();
    for (const width of [1440, 390]) {
      await page.setViewportSize({width, height: 1000});
      await page.locator('[data-publication-card]').first().screenshot({path: path.join(process.env.QA_SCREENSHOT_DIR, `keywords-es-${width}.png`)});
    }
  }
  console.log('PASS: 84 publications, exact audit concepts in EN/ES, chips/details match, 32 omitted blocks, protected data unchanged, no reload, 7 widths.');
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
