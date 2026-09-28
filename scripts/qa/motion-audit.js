/*
 * 动效 / 配色验收探针 —— 浏览器内注入（Claude 浏览器面板的 javascript_tool，或 DevTools 控制台）。
 * REPO_ONLY：scripts/ 永不发布。依赖页面暴露的 window.__ptMotion = { gsap, ScrollTrigger }。
 *
 * 用法：先整段执行本文件定义 window.__ptQA，然后按闸门调用：
 *   await __ptQA.fps()               环境有效性：预热 1s 后采样 1s，<45 帧 → SKIP，不评判动效
 *   __ptQA.reveal()                  data-reveal 各状态计数（Gate C：沉降后 pending/visible 必须为 0）
 *   await __ptQA.scrollThrough()     逐屏滚到底（让所有显现触发），返回 { longTasks, cls, frameP95 }
 *   __ptQA.visibility()              Gate B：内容元素 computed opacity 低于目标 / visibility:hidden 的列表
 *   __ptQA.hoverComposition()        Gate D：残留 inline transform/opacity 的 hover 目标
 *   __ptQA.contrast()                Gate E：纯色岛上的主题文字对比度（< 4.5 的列表）
 *   __ptQA.triggers()                ScrollTrigger 数量与各自 start/end
 *   await __ptQA.flash(url)          Gate C 首帧闪烁：同源 iframe 从 0ms 起逐帧采样首屏元素 opacity
 *   __ptQA.gateF()                   Gate I：每个含 ±2 的文本节点在同一声明块内有 .fn-ref
 *   __ptQA.hardcodedTopic()          Gate A 的运行时补充：computed 色值落在主题色但不经 token 的元素（提示用）
 */
(() => {
  const M = () => window.__ptMotion || {};
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const frames = (ms) => new Promise((resolve) => {
    const ts = [];
    const t0 = performance.now();
    const tick = (t) => { ts.push(t); if (t - t0 < ms) requestAnimationFrame(tick); else resolve(ts); };
    requestAnimationFrame(tick);
  });
  const pct = (arr, p) => { if (!arr.length) return 0; const a = [...arr].sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(a.length * p))]; };

  /* ---------- 颜色 ---------- */
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const [r, g, b, a = '1'] = m[1].split(/[ ,/]+/).filter(Boolean); return [+r, +g, +b, +a]; };
  const lum = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const solidBg = (el) => {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c[3] >= 0.99) return { rgb: c, el: n };
      if (c && c[3] > 0.01) return null; // 半透明叠层 → 不是纯色，交给人工截图抽检
      if (getComputedStyle(n).backgroundImage !== 'none') return null;
    }
    return null;
  };

  const QA = {
    async fps() {
      await frames(1000);
      const ts = await frames(1000);
      const n = ts.length;
      return { frames: n, valid: n >= 45, verdict: n >= 45 ? 'OK' : 'SKIP: unreliable renderer' };
    },

    reveal() {
      const out = {};
      document.querySelectorAll('[data-reveal]').forEach((el) => { out[el.dataset.reveal] = (out[el.dataset.reveal] || 0) + 1; });
      return out;
    },

    triggers() {
      const { ScrollTrigger } = M();
      if (!ScrollTrigger) return { count: null, note: 'window.__ptMotion missing' };
      const all = ScrollTrigger.getAll();
      return {
        count: all.length,
        list: all.map((t) => ({
          trigger: t.trigger && (t.trigger.id ? `#${t.trigger.id}` : t.trigger.className?.toString().slice(0, 40)),
          start: Math.round(t.start), end: Math.round(t.end), pin: !!t.pin,
        })),
      };
    },

    async scrollThrough({ step = 0.6, pause = 180 } = {}) {
      const longTasks = [];
      let cls = 0;
      const obs = [];
      try {
        const lt = new PerformanceObserver((l) => l.getEntries().forEach((e) => longTasks.push(Math.round(e.duration))));
        lt.observe({ type: 'longtask', buffered: false }); obs.push(lt);
      } catch { /* unsupported */ }
      try {
        const ls = new PerformanceObserver((l) => l.getEntries().forEach((e) => { if (!e.hadRecentInput) cls += e.value; }));
        ls.observe({ type: 'layout-shift', buffered: false }); obs.push(ls);
      } catch { /* unsupported */ }
      const deltas = [];
      let last = performance.now();
      let running = true;
      const tick = (t) => { deltas.push(t - last); last = t; if (running) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
      const lenis = window.__lenis;
      for (;;) {
        const max = document.documentElement.scrollHeight - innerHeight;
        const y = Math.min(max, window.scrollY + innerHeight * step);
        if (lenis) lenis.scrollTo(y, { immediate: false, duration: 0.3 }); else window.scrollTo(0, y);
        await sleep(pause + 300);
        if (window.scrollY >= max - 2) break;
      }
      await sleep(1600);
      running = false;
      obs.forEach((o) => o.disconnect());
      return {
        longTasks: longTasks.filter((d) => d > 50),
        cls: +cls.toFixed(4),
        frameP95: +pct(deltas.slice(5), 0.95).toFixed(1),
        frameMax: +Math.max(...deltas.slice(5)).toFixed(1),
      };
    },

    visibility() {
      const bad = [];
      const sel = 'h1,h2,h3,p,li,dt,dd,.card,.step,.metric,.spec,.btn,.blink,img,figure,.eyebrow,.faq__q';
      document.querySelectorAll(sel).forEach((el) => {
        if (el.closest('dialog:not([open]), details:not([open]) .faq__body, [aria-hidden="true"], .progress, .lang-hint')) return;
        const cs = getComputedStyle(el);
        const target = el.closest('.card--soon') ? 0.6 : el.classList.contains('subscribe__note') ? 0.75 : 1;
        let op = 1;
        for (let n = el; n && n.nodeType === 1; n = n.parentElement) op *= +getComputedStyle(n).opacity;
        if (cs.visibility === 'hidden' || op < target - 0.02) bad.push({ el: `${el.tagName}.${el.className}`.slice(0, 60), opacity: +op.toFixed(2) });
      });
      return { count: bad.length, bad: bad.slice(0, 20) };
    },

    hoverComposition() {
      // hover 规则里写了 transform 的目标：静止时不得残留 GSAP inline transform（否则 hover 被覆盖）
      const sels = ['.spec > *', '.hl > *', '.footer__col a', '.card', '.step', '.metric', '.btn', '.blink svg'];
      const bad = [];
      sels.forEach((s) => document.querySelectorAll(s).forEach((el) => {
        const st = el.getAttribute('style') || '';
        // 只算「非恒等」残留：opacity:1 / translate(0,0) 不挡 hover
        const tr = el.style.transform, op = el.style.opacity;
        const nonIdentity = (tr && !/^(none|translate\(0(px)?, 0(px)?\)|translate3d\(0px, 0px, 0px\)|matrix\(1, 0, 0, 1, 0, 0\))$/.test(tr)) || (op && +op < 1);
        if (nonIdentity) bad.push({ sel: s, style: st.slice(0, 80) });
      }));
      return { count: bad.length, bad: bad.slice(0, 20) };
    },

    contrast() {
      const sel = '.blink, .step__data, .card__foot, .card__num, .card__metric, .fn-ref a, .nav__asn, .metric__label, .faq__title, .eyebrow, .eyebrow--plain, .hero__eyebrow, .notes__mark, .notes a, .beat__readout, .cmp__hl, .spec__k, .spec__sub, .card__desc, .faq__num';
      const rows = [];
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.getClientRects().length) return;
        const fg = parse(getComputedStyle(el).color);
        const bg = solidBg(el);
        if (!fg || !bg) return;
        const r = ratio(fg, bg.rgb);
        rows.push({ el: `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`.slice(0, 50), ratio: +r.toFixed(2), fg: getComputedStyle(el).color, bg: getComputedStyle(bg.el).backgroundColor });
      });
      const fails = rows.filter((r) => r.ratio < 4.5);
      const uniq = [...new Map(fails.map((f) => [`${f.el}|${f.fg}|${f.bg}`, f])).values()];
      return { checked: rows.length, failCount: fails.length, fails: uniq.slice(0, 30) };
    },

    focusRing(el) {
      el.focus();
      const cs = getComputedStyle(el);
      const out = { outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, boxShadow: cs.boxShadow };
      el.blur();
      return out;
    },

    async flash(url, { ms = 2500 } = {}) {
      const f = document.createElement('iframe');
      f.style.cssText = `position:fixed;left:0;top:0;width:${innerWidth}px;height:${innerHeight}px;opacity:0.001;pointer-events:none;z-index:-1;border:0`;
      document.body.appendChild(f);
      const samples = new Map(); // el index -> sequence of visible flags
      let els = null;
      const t0 = performance.now();
      f.src = url;
      await new Promise((resolve) => {
        const tick = () => {
          const d = f.contentDocument;
          if (d && d.body && d.readyState !== 'loading') {
            if (!els) {
              const vh = f.clientHeight;
              els = [...d.querySelectorAll('main h1, main h2, main p, main .hero__actions, main .hero__eyebrow, main .card, main .step')]
                .filter((e) => { const r = e.getBoundingClientRect(); return r.top < vh && r.bottom > 0 && r.height > 0; });
            }
            els.forEach((e, i) => {
              let op = 1;
              for (let n = e; n && n.nodeType === 1; n = n.parentElement) op *= +f.contentWindow.getComputedStyle(n).opacity;
              const seq = samples.get(i) || []; seq.push(op > 0.5 ? 1 : 0); samples.set(i, seq);
            });
          }
          if (performance.now() - t0 < ms) requestAnimationFrame(tick); else resolve();
        };
        requestAnimationFrame(tick);
      });
      const flashes = [];
      (els || []).forEach((e, i) => {
        const s = (samples.get(i) || []).join('').replace(/(.)\1+/g, '$1');
        if (/101/.test(s)) flashes.push({ el: `${e.tagName}.${e.className}`.slice(0, 60), seq: s });
      });
      f.remove();
      return { firstScreen: els ? els.length : 0, flashCount: flashes.length, flashes };
    },

    async triggerTest(sel = '[data-reveal="pending"]') {
      const el = [...document.querySelectorAll(sel)].find((e) => e.dataset.reveal === 'pending' && e.getBoundingClientRect().top > innerHeight);
      if (!el) return { note: 'no pending element below the fold' };
      const lenis = window.__lenis;
      const to = (y) => { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); else window.scrollTo(0, y); };
      const docY = el.getBoundingClientRect().top + window.scrollY;
      to(docY - innerHeight * 0.92); await sleep(400);
      const at92 = { state: el.dataset.reveal, opacity: +getComputedStyle(el).opacity };
      to(docY - innerHeight * 0.87);
      const t0 = performance.now();
      let tStart = null, tVisible = null;
      await new Promise((resolve) => {
        const tick = () => {
          const now = performance.now();
          if (tStart === null && +getComputedStyle(el).opacity > 0.01) tStart = now - t0;
          if (tVisible === null && el.dataset.reveal !== 'pending') tVisible = now - t0;
          if ((tStart !== null && tVisible !== null) || now - t0 > 3000) resolve(); else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      return { el: `${el.tagName}.${el.className}`.slice(0, 50), at92, startMs: tStart && Math.round(tStart), visibleMs: tVisible && Math.round(tVisible) };
    },

    gateF() {
      const bad = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (!/±\s?2/.test(n.nodeValue)) continue;
        const host = n.parentElement;
        if (host.closest('#precision-note, script, style, [aria-hidden="true"]')) continue;
        const block = host.closest('p, dd, td, li, h1, h2, h3, .spec, .card__desc, .step') || host;
        if (!block.querySelector('.fn-ref a[href="#precision-note"]')) bad.push(block.textContent.trim().slice(0, 60));
      }
      return { count: bad.length, bad };
    },

    hardcodedTopic() {
      // 运行时只能给提示：列出 computed color/background 等于主题色、但元素没有落在 topic 作用域里的
      const topicHex = ['rgb(45, 212, 191)', 'rgb(217, 178, 111)', 'rgb(11, 110, 99)', 'rgb(125, 90, 20)'];
      const hits = [];
      document.querySelectorAll('main *').forEach((el) => {
        const cs = getComputedStyle(el);
        if ([cs.color, cs.backgroundColor].some((c) => topicHex.includes(c)) && !el.closest('[class*="topic-"]')) hits.push(`${el.tagName}.${el.className}`.slice(0, 50));
      });
      return { count: hits.length, sample: [...new Set(hits)].slice(0, 20) };
    },
  };
  window.__ptQA = QA;
  return 'ptQA ready';
})();
