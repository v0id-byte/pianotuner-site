#!/usr/bin/env node
/*
 * 无依赖 CDP 验收驱动（Node 24 自带 WebSocket + fetch）。REPO_ONLY，永不发布。
 *
 *   node scripts/qa/cdp.mjs shoot  <baseUrl> <outDir> [--mobile] [--motion]   10 类页面整页截图（默认 reduced-motion = 静态构图）
 *   node scripts/qa/cdp.mjs flash  <url> [--mobile]                           首帧闪烁：从文档创建起逐帧采样首屏元素
 *   node scripts/qa/cdp.mjs audit  <url> <expr> [--reduced] [--mobile]        注入 motion-audit.js 后求值 expr（可 await）
 *   node scripts/qa/cdp.mjs keys   <url>                                      键盘：菜单焦点收容 / Esc 归还 / FAQ Enter·Space
 *   node scripts/qa/cdp.mjs nav    <baseUrl>                                  导航：hash 冷/暖落点、BFCache 复位、快速连点
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const PAGES = ['/', '/pro.html', '/demo.html', '/buy.html', '/about.html', '/contact.html', '/support.html', '/piano-tuning-frequency.html', '/privacy.html', '/terms.html'];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launch() {
  const dir = mkdtempSync(join(process.env.PTQA_TMP || tmpdir(), 'ptqa-'));
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${dir}`,
    '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--mute-audio', 'about:blank',
  ], { stdio: 'ignore' });
  let ver;
  for (let i = 0; i < 200 && !ver; i++) {
    try { ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); } catch { await sleep(100); }
  }
  if (!ver) throw new Error('chrome did not start');
  const tgt = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(tgt.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0;
  const pending = new Map();
  const listeners = [];
  ws.onmessage = (m) => {
    const msg = JSON.parse(m.data);
    if (msg.id && pending.has(msg.id)) { const { res, rej } = pending.get(msg.id); pending.delete(msg.id); msg.error ? rej(new Error(msg.error.message)) : res(msg.result); }
    else if (msg.method) listeners.forEach((l) => l(msg));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const once = (method, ms = 15000) => new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error(`timeout ${method}`)), ms);
    const l = (msg) => { if (msg.method === method) { clearTimeout(t); listeners.splice(listeners.indexOf(l), 1); res(msg.params); } };
    listeners.push(l);
  });
  const close = () => { try { ws.close(); } catch { /* */ } proc.kill('SIGKILL'); setTimeout(() => rmSync(dir, { recursive: true, force: true }), 500); };
  await send('Page.enable'); await send('Runtime.enable');
  return { send, once, close, listeners };
}

async function setup(c, { mobile = false, reduced = false } = {}) {
  const w = mobile ? 390 : 1440, h = mobile ? 844 : 900;
  await c.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
  if (mobile) await c.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  await c.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }] });
}
const evaluate = async (c, expr) => {
  const r = await c.send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
};
async function go(c, url, settle = 1200) {
  const loaded = c.once('Page.loadEventFired', 30000);
  await c.send('Page.navigate', { url });
  await loaded;
  await evaluate(c, 'document.fonts ? document.fonts.ready.then(()=>1) : 1');
  await sleep(settle);
}
const injectQA = (c) => evaluate(c, readFileSync(join(HERE, 'motion-audit.js'), 'utf8'));

const [cmd, ...rest] = process.argv.slice(2);
const flags = new Set(rest.filter((a) => a.startsWith('--')));
const args = rest.filter((a) => !a.startsWith('--'));
const mobile = flags.has('--mobile');

const c = await launch();
try {
  if (cmd === 'shoot') {
    const [base, out] = args;
    mkdirSync(out, { recursive: true });
    await setup(c, { mobile, reduced: !flags.has('--motion') });
    for (const p of PAGES) {
      await go(c, base + p, 1500);
      if (flags.has('--motion')) { await injectQA(c); await evaluate(c, '__ptQA.scrollThrough({step:0.8,pause:80})'); await evaluate(c, 'scrollTo(0,0)'); await sleep(800); }
      const { cssContentSize } = await c.send('Page.getLayoutMetrics');
      const shot = await c.send('Page.captureScreenshot', {
        format: 'png', captureBeyondViewport: true,
        clip: { x: 0, y: 0, width: cssContentSize.width, height: Math.min(cssContentSize.height, 16000), scale: 1 },
      });
      const name = (p === '/' ? 'index' : p.replace(/^\/|\.html$/g, '')) + (mobile ? '-m' : '') + '.png';
      writeFileSync(join(out, name), Buffer.from(shot.data, 'base64'));
      console.log('shot', name, Math.round(cssContentSize.height));
    }
  } else if (cmd === 'flash') {
    const [url] = args;
    await setup(c, { mobile });
    await c.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => {
      const seqs = new Map(); let els = null; const t0 = performance.now();
      const tick = () => {
        if (document.body) {
          if (!els) { const vh = innerHeight; els = [...document.querySelectorAll('main h1, main h2, main p, main .hero__actions, main .hero__eyebrow, main .card, main .step, main .sec-head')].filter((e) => { const r = e.getBoundingClientRect(); return r.height > 0 && r.top < vh && r.bottom > 0; }); }
          els.forEach((e, i) => { let op = 1; for (let n = e; n && n.nodeType === 1; n = n.parentElement) op *= +getComputedStyle(n).opacity; const lines = e.querySelectorAll('.split-line'); if (lines.length) { const vis = [...lines].some((l) => +getComputedStyle(l).opacity > 0.5); const covered = [...e.querySelectorAll('.line-box')].some((b) => +getComputedStyle(b).opacity > 0.5 && Math.abs(b.getBoundingClientRect().left - b.parentElement.getBoundingClientRect().left) < 4); if (!vis && !covered) op = 0; } const s = seqs.get(i) || []; s.push(op > 0.5 ? 1 : 0); seqs.set(i, s); });
        }
        if (performance.now() - t0 < 3000) requestAnimationFrame(tick);
        else window.__flash = { n: els ? els.length : 0, flashes: (els || []).map((e, i) => ({ el: (e.tagName + '.' + e.className).slice(0, 60), s: (seqs.get(i) || []).join('').replace(/(.)\\1+/g, '$1') })).filter((x) => /101/.test(x.s)) };
      };
      requestAnimationFrame(tick);
    })();` });
    await go(c, url, 3400);
    console.log(JSON.stringify(await evaluate(c, 'window.__flash'), null, 1));
  } else if (cmd === 'audit') {
    const [url, expr] = args;
    const errors = [];
    c.listeners.push((m) => {
      if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description?.split('\n')[0] || m.params.exceptionDetails.text);
      if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') errors.push(m.params.args.map((a) => a.value || a.description).join(' ').slice(0, 160));
    });
    await setup(c, { mobile, reduced: flags.has('--reduced') });
    await go(c, url, 1500);
    const at = [...flags].find((f) => f.startsWith('--reload-at='));
    if (at) {
      const f = parseFloat(at.split('=')[1]);
      await evaluate(c, `scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * ${f}))`); await sleep(400);
      const loaded = c.once('Page.loadEventFired', 30000); await c.send('Page.reload'); await loaded; await sleep(2500);
    }
    await injectQA(c);
    const value = await evaluate(c, `(async()=>(${expr}))()`);
    console.log(JSON.stringify({ value, errors }, null, 1));
  } else if (cmd === 'snap') {
    // snap <url> <out.png> <expr>：expr 返回 {clip:{x,y,width,height}, hover?:{x,y}, wait?:ms, click?:{x,y}}（视口坐标）
    const [url, out, expr] = args;
    await setup(c, { mobile, reduced: flags.has('--reduced') });
    await go(c, url, 1500);
    await injectQA(c);
    const plan = await evaluate(c, `(async()=>(${expr}))()`);
    if (plan.hover) { await c.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: plan.hover.x, y: plan.hover.y }); }
    if (plan.click) { for (const t of ['mousePressed', 'mouseReleased']) await c.send('Input.dispatchMouseEvent', { type: t, x: plan.click.x, y: plan.click.y, button: 'left', clickCount: 1 }); }
    await sleep(plan.wait ?? 900);
    const shot = await c.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { ...plan.clip, scale: 1 } });
    writeFileSync(out, Buffer.from(shot.data, 'base64'));
    console.log('snap', out);
  } else if (cmd === 'keys') {
    const [url] = args;
    const key = async (k, code, extra = {}) => {
      const { vk, ...rest } = extra;
      const text = k === 'Enter' ? '\r' : k === ' ' ? ' ' : undefined;
      const base = { key: k, code, windowsVirtualKeyCode: vk || 0, nativeVirtualKeyCode: vk || 0, ...rest };
      await c.send('Input.dispatchKeyEvent', { type: 'keyDown', ...base, ...(text ? { text, unmodifiedText: text } : {}) });
      await c.send('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
      await sleep(120);
    };
    const active = () => evaluate(c, `(()=>{const a=document.activeElement;return a?(a.tagName+'.'+(a.className||'')+'|'+(a.textContent||'').trim().slice(0,24)):null})()`);
    const out = {};
    await setup(c, { mobile: true });
    await go(c, url, 1500);
    await evaluate(c, `document.querySelector('.nav__burger').focus()`);
    await key('Enter', 'Enter', { vk: 13 }); await sleep(500);
    out.menuOpen = await evaluate(c, `document.querySelector('dialog.menu').open`);
    out.focusInMenu = await evaluate(c, `document.querySelector('dialog.menu').contains(document.activeElement)`);
    const trail = [];
    for (let i = 0; i < 14; i++) { await key('Tab', 'Tab', { vk: 9 }); trail.push(await evaluate(c, `document.querySelector('dialog.menu').contains(document.activeElement) || document.activeElement===document.body`)); }
    out.tabStaysInMenu = trail.every(Boolean);
    await key('Escape', 'Escape', { vk: 27 }); await sleep(400);
    out.menuClosedByEsc = !(await evaluate(c, `document.querySelector('dialog.menu').open`));
    out.focusReturned = await active();
    await setup(c, { mobile: false });
    await go(c, url, 1200);
    const faq = await evaluate(c, `!!document.querySelector('.faq__q')`);
    if (faq) {
      await evaluate(c, `(()=>{const s=document.querySelector('.faq__q');s.scrollIntoView();s.focus();})()`); await sleep(300);
      await key('Enter', 'Enter', { vk: 13 }); await sleep(900);
      out.faqEnterOpen = await evaluate(c, `document.querySelector('.faq__item').open`);
      await key(' ', 'Space', { vk: 32 }); await sleep(900);
      out.faqSpaceClosed = !(await evaluate(c, `document.querySelector('.faq__item').open`));
    }
    console.log(JSON.stringify(out, null, 1));
  } else if (cmd === 'nav') {
    const [base] = args;
    const out = {};
    await setup(c, {});
    const faqTop = () => evaluate(c, `Math.round(document.getElementById('faq').getBoundingClientRect().top)`);
    const navH = () => evaluate(c, `document.querySelector('.nav').offsetHeight`);
    await go(c, `${base}/#faq`, 3500);
    out.coldHash = { faqTop: await faqTop(), navH: await navH() };
    await go(c, `${base}/pro.html`, 1500);
    await go(c, `${base}/#faq`, 3500);
    out.warmHash = { faqTop: await faqTop() };
    // footer link from another page
    await go(c, `${base}/support.html`, 1500);
    await evaluate(c, `document.querySelector('.footer a[href$="#faq"]').click()`); await c.once('Page.loadEventFired', 20000).catch(() => {}); await sleep(3500);
    out.footerHash = { faqTop: await faqTop() };
    // BFCache: scroll 70% on home, go to pro, back
    await go(c, `${base}/`, 2500);
    await evaluate(c, `(window.__lenis?window.__lenis.scrollTo(Math.round((document.documentElement.scrollHeight-innerHeight)*0.7),{immediate:true}):scrollTo(0,(document.documentElement.scrollHeight-innerHeight)*0.7))`); await sleep(1500);
    const before = await evaluate(c, 'Math.round(scrollY)');
    await go(c, `${base}/pro.html`, 1500);
    const hist = await c.send('Page.getNavigationHistory');
    const back = c.once('Page.frameNavigated', 20000);
    await c.send('Page.navigateToHistoryEntry', { entryId: hist.entries[hist.currentIndex - 1].id }); await back; await sleep(2500);
    out.bfcache = { before, after: await evaluate(c, 'Math.round(scrollY)') };
    // rapid navigation A→B→C
    await go(c, `${base}/`, 1500);
    await evaluate(c, `location.href='${base}/pro.html'`); await sleep(100);
    await evaluate(c, `location.href='${base}/about.html'`).catch(() => {}); await sleep(2500);
    out.rapid = await evaluate(c, `({path:location.pathname, navs:document.querySelectorAll('.nav').length, bodyOverflow:getComputedStyle(document.body).overflow, lenisStopped: !!(window.__lenis && window.__lenis.isStopped), vt: document.documentElement.dataset.vt || null})`);
    console.log(JSON.stringify(out, null, 1));
  } else {
    console.log('usage: see header');
  }
} finally {
  c.close();
}
