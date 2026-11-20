// End-to-end test of the PrintPricePro site.
// Usage: npm run test:e2e [-- baseUrl]   (default: https://www.printpricepro.com)
//        e.g. local: npm start & npm run test:e2e -- http://localhost:8000
// Needs Google Chrome and the sibling ../PrintPricePro repo (expected printer data is read from
// the app source via scripts/sync-printers.py, so the site is checked against the app, not itself).
// Firebase Analytics requests are blocked so test runs don't pollute real analytics.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const APP_DIR = process.env.APP_DIR || path.resolve(__dirname, '../../PrintPricePro');
const APP = JSON.parse(execFileSync('python3', ['-I', '-c', `
import importlib.util, json, sys
s = importlib.util.spec_from_file_location('sp', sys.argv[1] + '/scripts/sync-printers.py')
m = importlib.util.module_from_spec(s); s.loader.exec_module(m)
p = m.parse_presets(m.PRESETS_KT.read_text(), m.parse_printers(m.DB_MODULE.read_text()))
print(json.dumps({m.slug(n): dict(name=n, **v) for n, v in p.items()}))
`, APP_DIR]).toString());
const BASE = process.argv[2] || 'https://www.printpricepro.com';

const results = [];
const check = (name, ok, detail = '') => { results.push({ name, ok: !!ok, detail }); };
const money = (s) => parseFloat(String(s).replace(/[^0-9.\-]/g, ''));
const near = (a, b, tol = 0.011) => Math.abs(a - b) <= tol;

// Independent implementation of the documented formula (PRICING_FORMULA.md), not copied from script.js
function expected({ g, h, m, laborMin, elec, matKg, laborRate, machine, hw, hwMarkup, overhead, markup, ship, pack, gst, gateway, sell, watts }) {
  const t = h + m / 60;
  const material = g / 1000 * matKg, electricity = watts / 1000 * t * elec, labor = laborMin / 60 * laborRate;
  const mach = machine * t, direct = material + electricity + labor + mach + hw;
  const ovh = direct * overhead / 100, subtotal = direct + ovh;
  const hwShare = hw * (1 + overhead / 100);
  const mk = (subtotal - hwShare) * markup / 100 + hwShare * ((hwMarkup ?? markup) / 100);
  const beforeGst = subtotal + mk + ship + pack, gstV = beforeGst * gst / 100, final = beforeGst + gstV;
  let profit = null;
  if (sell > 0) { const taxes = sell - sell / (1 + gst / 100); profit = sell - taxes - (direct + ovh + ship + pack + sell * gateway / 100); }
  return { material, electricity, labor, mach, ovh, subtotal, mk, beforeGst, gstV, final, profit };
}

async function fill(page, vals) {
  for (const [id, v] of Object.entries(vals)) {
    await page.fill('#' + id, String(v));
  }
  await page.waitForTimeout(50);
}
const txt = (page, sel) => page.textContent(sel);
// Opens the HW Markup % info popup, returns its bold status line, closes it
async function hwStatus(page) {
  // Normal (not forced) click: Playwright then waits for the icon to be stable, so the page's
  // smooth scrolling can't move it between scroll-into-view and the click (that was the flake).
  await page.click('.info-icon[data-info="hardware-markup"]');
  await page.waitForSelector('#infoModal.active');
  const t = await page.textContent('#modalContent strong');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('#infoModal.active'));
  return t;
}

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const ctx = await browser.newContext({ serviceWorkers: 'allow' });
  // Keep test traffic out of the real analytics
  await ctx.route(/gstatic\.com\/firebasejs|google-analytics\.com|googletagmanager\.com|firebaseinstallations|firebaselogging/, r => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/firebase|gstatic|ERR_FAILED|net::/i.test(m.text())) errors.push('console: ' + m.text()); });

  // 1. Fresh load
  const resp = await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  check('home loads 200', resp.status() === 200, resp.status());
  check('title present', (await page.title()).length > 0, await page.title());
  await page.waitForTimeout(700);

  // 2. Printer dropdown vs app data
  const opts = await page.$$eval('#printer option', os => os.map(o => ({ v: o.value, t: o.textContent, sel: o.selected })));
  check('dropdown has 104 printers + Other', opts.length === 105, opts.length);
  check('default printer is Bambu Lab A1', opts.find(o => o.sel)?.v === 'bambu-lab-a1', opts.find(o => o.sel)?.v);
  const siteSlugs = new Set(opts.map(o => o.v).filter(v => v !== 'other'));
  const missing = Object.keys(APP).filter(s => !siteSlugs.has(s));
  const extra = [...siteSlugs].filter(s => !APP[s]);
  check('site printer set == app printer set', !missing.length && !extra.length, JSON.stringify({ missing, extra }));
  const labelMismatch = opts.filter(o => APP[o.v] && !o.t.includes(`${APP[o.v].name} (~${APP[o.v].watts}W avg)`)).map(o => o.t);
  check('every label shows app name + app watts', !labelMismatch.length, labelMismatch.slice(0, 5).join(' | '));
  check('SparkX i7 listed', opts.some(o => o.t === 'Creality SparkX i7 (~110W avg)'));
  check('H2D corrected to 200W', opts.some(o => o.t === 'Bambu Lab H2D (~200W avg)'));
  check('machine cost prefilled for A1 (6.8)', (await page.inputValue('#machine-cost-per-hour')) === '6.8', await page.inputValue('#machine-cost-per-hour'));
  check('material label per kg for FDM', /per kg/.test(await txt(page, 'label[for="material-cost"]')));

  // 3. Every printer: select → machine cost + watts used in calc match app
  await fill(page, { 'material-weight': 100, 'print-time-hours': 1, 'print-time-minutes': 0 });
  const perPrinterFail = [];
  for (const o of opts) {
    if (o.v === 'other') continue;
    await page.selectOption('#printer', o.v);
    const mc = parseFloat(await page.inputValue('#machine-cost-per-hour'));
    const calcE = await txt(page, '#calc-electricity');
    const label = await txt(page, 'label[for="material-cost"]');
    const a = APP[o.v];
    const unitOk = a.type === 'RESIN' ? /per liter/.test(label) : /per kg/.test(label);
    if (!near(mc, a.cost, 0.001) || !calcE.startsWith(`(${a.watts} W / 1000)`) || !unitOk)
      perPrinterFail.push(`${o.v}: mc=${mc}/${a.cost} calc="${calcE.slice(0, 20)}" unitOk=${unitOk}`);
  }
  check('all 104 printers: machine cost, watts in formula, kg/liter label match app', !perPrinterFail.length, perPrinterFail.slice(0, 6).join(' | '));

  // 4. Full calculation, INR, new printer (SparkX i7)
  await page.selectOption('#printer', 'creality-sparkx-i7');
  const c1 = { g: 150, h: 3, m: 30, laborMin: 20, elec: 8, matKg: 1200, laborRate: 100, machine: 7.8, hw: 0, hwMarkup: null, overhead: 15, markup: 30, ship: 0, pack: 0, gst: 12, gateway: 2, sell: 0, watts: 110 };
  await fill(page, { 'material-weight': c1.g, 'print-time-hours': c1.h, 'print-time-minutes': c1.m, 'labor-time': c1.laborMin, 'electricity-rate': c1.elec, 'material-cost': c1.matKg, 'labor-rate': c1.laborRate, 'hardware-cost': 0, 'overhead-percentage': 15, 'markup-percentage': 30, 'shipping-cost': 0, 'packaging-cost': 0, 'gst-percentage': 12, 'selling-price': '' });
  let e = expected(c1);
  const rows = { 'result-material': e.material, 'result-electricity': e.electricity, 'result-labor': e.labor, 'result-machine': e.mach, 'result-overhead': e.ovh, 'result-subtotal': e.subtotal, 'result-markup': e.mk, 'result-gst': e.gstV, 'result-final': e.final };
  const bad = [];
  for (const [id, v] of Object.entries(rows)) { const s = money(await txt(page, '#' + id)); if (!near(s, v)) bad.push(`${id} site=${s} exp=${v.toFixed(2)}`); }
  check('INR calc (SparkX i7, 150g, 3h30, GST 12) all rows correct', !bad.length, bad.join(' | ') || `final ₹${e.final.toFixed(2)}`);
  check('selling-price section hidden when no selling price entered', !(await page.isVisible('#selling-price-results')));
  check('sticky price bar == final', near(money(await txt(page, '#sticky-price-value')), e.final));
  check('HW Markup % enabled at hardware = 0 and prefilled with Markup (30)', await page.isEnabled('#hardware-markup-percentage') && (await page.inputValue('#hardware-markup-percentage')) === '30', await page.inputValue('#hardware-markup-percentage'));
  check('markup→margin hint (30% → 23.1%)', /23\.1% margin/.test(await txt(page, '#markup-margin-hint')), await txt(page, '#markup-margin-hint'));

  // 5. Hardware markup
  await fill(page, { 'hardware-cost': 500 });
  check('popup status: following (30%)', /Same as Markup % \(30%\) · follows Markup/.test(await hwStatus(page)), await hwStatus(page));
  e = expected({ ...c1, hw: 500 });
  check('untouched HW markup == main markup on whole subtotal', near(money(await txt(page, '#result-markup')), e.mk), `${await txt(page, '#result-markup')} vs ${e.mk.toFixed(2)}`);
  await fill(page, { 'hardware-markup-percentage': 10 });
  e = expected({ ...c1, hw: 500, hwMarkup: 10 });
  check('HW markup 10% applied to hardware share only', near(money(await txt(page, '#result-markup')), e.mk) && near(money(await txt(page, '#result-final')), e.final), `${await txt(page, '#result-markup')} vs ${e.mk.toFixed(2)}`);
  check('popup status switches to custom text', /Only for hardware · Markup % is 30%/.test(await hwStatus(page)), await hwStatus(page));
  await fill(page, { 'hardware-markup-percentage': '' });
  e = expected({ ...c1, hw: 500 });
  check('clearing HW markup reverts', near(money(await txt(page, '#result-markup')), e.mk));

  // 6. Shipping/packaging pass-through, GST 0 hides rows
  await fill(page, { 'hardware-cost': 0, 'shipping-cost': 60, 'packaging-cost': 15, 'gst-percentage': 0 });
  e = expected({ ...c1, ship: 60, pack: 15, gst: 0 });
  check('shipping+packaging added after markup, not marked up', near(money(await txt(page, '#result-final')), e.final), `${await txt(page, '#result-final')} vs ${e.final.toFixed(2)}`);
  check('shipping/packaging rows visible', await page.isVisible('#result-shipping-row') && await page.isVisible('#result-packaging-row'));
  check('GST rows hidden at 0%', !(await page.isVisible('#result-gst-row')));

  // 7. Selling price → profit split
  await fill(page, { 'gst-percentage': 12, 'gateway-percentage': 2, 'selling-price': 1500 });
  e = expected({ ...c1, ship: 60, pack: 15, sell: 1500 });
  check('selling-price section visible', await page.isVisible('#selling-price-results'));
  check('actual profit correct', near(money((await txt(page, '#result-profit')).split('(')[0]), e.profit), `${await txt(page, '#result-profit')} vs ${e.profit.toFixed(2)}`);

  // 8. Formulas toggle
  await page.click('#toggle-formulas');
  check('Show Formulas toggles', /Hide/.test(await txt(page, '#toggle-formulas')) && await page.isVisible('#calc-final'));
  await page.click('#toggle-formulas');

  // 9. Info modal
  await page.click('.info-icon[data-info="power-consumption"]');
  await page.waitForTimeout(400);
  const modalOpen = await page.isVisible('#infoModal');
  const modalText = modalOpen ? await txt(page, '#modalContent') : '';
  check('info modal opens with average-power guidance', modalOpen && /AVERAGE/i.test(modalText));
  await page.keyboard.press('Escape');
  await page.waitForTimeout(700); // 300ms fade-out
  check('Escape closes modal', !(await page.isVisible('#infoModal')));

  // 10. Persistence across reload
  const finalBefore = await txt(page, '#result-final');
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(700);
  check('reload keeps printer', (await page.inputValue('#printer')) === 'creality-sparkx-i7', await page.inputValue('#printer'));
  check('reload keeps inputs + same final price', (await page.inputValue('#material-weight')) === '150' && (await txt(page, '#result-final')) === finalBefore, `${await txt(page, '#result-final')} vs ${finalBefore}`);

  // 11. Currency switch
  await page.selectOption('#currency', 'USD'); await page.waitForTimeout(100);
  check('USD: labels use $', /\$\/kWh/.test(await txt(page, 'label[for="electricity-rate"]')));
  check('USD: elec 8→0.12, labor 100→15, material 1200→25', (await page.inputValue('#electricity-rate')) === '0.12' && (await page.inputValue('#labor-rate')) === '15' && (await page.inputValue('#material-cost')) === '25',
    [await page.inputValue('#electricity-rate'), await page.inputValue('#labor-rate'), await page.inputValue('#material-cost')].join(','));
  check('USD: final formatted with $', (await txt(page, '#result-final')).startsWith('$'), await txt(page, '#result-final'));
  await page.selectOption('#currency', 'INR'); await page.waitForTimeout(100);

  // 12. Reset
  await page.click('#reset-calculator'); await page.waitForTimeout(200);
  const pAfter = await page.inputValue('#printer'), mcAfter = await page.inputValue('#machine-cost-per-hour');
  check('Reset selects default printer (bambu-lab-a1)', pAfter === 'bambu-lab-a1', `printer="${pAfter}"`);
  check('Reset prefills A1 machine cost 6.8', mcAfter === '6.8', `machine="${mcAfter}"`);
  check('Reset clears weight + selling price', (await page.inputValue('#material-weight')) === '' && !(await page.isVisible('#selling-price-results')));

  // 13. Service worker / cache version
  const sw = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return r ? (r.active || r.installing || r.waiting)?.scriptURL : null; });
  check('service worker registered', !!sw, sw);
  const cacheKeys = await page.evaluate(async () => { await new Promise(r => setTimeout(r, 800)); return caches.keys(); });
  const liveCache = (await (await ctx.request.get(BASE + '/sw.js')).text()).match(/CACHE_NAME = '([^']+)'/)[1];
  check('only the current SW cache exists (' + liveCache + ')', cacheKeys.length === 1 && cacheKeys[0] === liveCache, cacheKeys.join(','));

  // 14. Other pages + links
  for (const p of ['app-guide.html', 'privacy.html', 'robots.txt', 'sitemap.xml', 'manifest.json']) {
    const r = await ctx.request.get(`${BASE}/${p}`); check(`${p} 200`, r.status() === 200, r.status());
  }
  const p2 = await ctx.newPage(); const errs2 = [];
  p2.on('pageerror', e => errs2.push(e.message));
  await p2.goto(BASE + '/app-guide.html', { waitUntil: 'networkidle' });
  check('app guide renders without JS errors', !errs2.length && (await p2.$$('h2')).length > 0, errs2.join(' | '));
  await p2.close();
  const play = await page.getAttribute('a[href*="play.google.com"]', 'href');
  check('Play Store link points at app id', /id=tech\.anubias\.printpricepro/.test(play || ''), play);

  // 15. Mobile layout
  const mctx = await browser.newContext({ viewport: { width: 375, height: 800 }, isMobile: true, hasTouch: true });
  await mctx.route(/gstatic\.com\/firebasejs|google-analytics\.com/, r => r.abort());
  const mp = await mctx.newPage();
  await mp.goto(BASE + '/', { waitUntil: 'networkidle' });
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('mobile 375px: no horizontal scroll', overflow <= 0, `overflow=${overflow}px`);
  if (await mp.isVisible('#nav-toggle')) {
    await mp.click('#nav-toggle');
    check('mobile hamburger opens menu', (await mp.getAttribute('#nav-toggle', 'aria-expanded')) === 'true');
  } else check('mobile hamburger visible', false);
  await mp.fill('#material-weight', '100'); await mp.fill('#print-time-hours', '2');
  await mp.waitForTimeout(100);
  check('mobile: sticky price updates', money(await mp.textContent('#sticky-price-value')) > 0, await mp.textContent('#sticky-price-value'));
  await mctx.close();

  check('no JS errors on home page during whole run', !errors.length, errors.slice(0, 5).join(' | '));
  await browser.close();

  const failed = results.filter(r => !r.ok);
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail !== '' && (!r.ok || process.env.V) ? '  — ' + r.detail : ''}`);
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
