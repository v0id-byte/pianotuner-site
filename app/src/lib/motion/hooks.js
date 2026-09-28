import { useEffect } from 'react';
import { gsap, ScrollTrigger, SplitText, Observer, prefersReduced, refreshSoon, whenFontsReady } from './index';
import { EASE, DUR, START, CASCADE, markPending, markVisible, markDone } from './tokens';

/** 标记该 section 的动效已成功接管（QA 与 CSS 用；不承担隐藏内容的职责）。 */
const markReady = (el) => { if (el) el.dataset.motionReady = 'true'; };
const clearReady = (el) => { if (el) delete el.dataset.motionReady; };

/** 绑定时已在首屏（顶边高于触发线）？这类元素绝不先藏再显（E0 + 首帧无闪烁）。 */
const inFirstView = (el) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight * 0.88;
};
/** 经 View Transition 抵达：首屏内容已随过渡淡入，不再重播入场（渐进增强，缺省即正常流程）。 */
const arrivedViaVT = () => typeof document !== 'undefined' && !!document.documentElement.dataset.vt;

/**
 * 逐行擦除条（站点签名动效）。一块实色方块从左滑入盖住整行，继续滑出右侧，文字在它离开时淡起。
 * 首屏标题：色条与「藏字」在同一帧落位（xPercent 0 直接盖住），没有空白帧，然后色条滑出——
 * 静止文字 → 色条 → 文字，从不出现「字没了、条还没来」。经 View Transition 抵达的首屏标题不播。
 * 生命周期单一 owner：字体/视口 reflow 交给 SplitText 的 autoSplit；卸载由 ctx.revert() 收尾。
 * ⚠️ .reveal-text 所在子树 React 绝不能重渲染（SplitText 改了 DOM）。语言是构建期常量，所以成立。
 * ⚠️ 含 <sup><a href="#precision-note"> 的文字不要加 .reveal-text（角标放在 reveal 元素外）。
 */
export function useTextReveal(scopeRef) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReduced()) return undefined;
    let ctx;
    let cancelled = false;
    whenFontsReady(() => {
      if (cancelled) return;
      ctx = gsap.context(() => {
        scope.querySelectorAll('.reveal-text').forEach((el) => {
          // 首次拆分时定档，autoSplit 重拆沿用同一档
          if (!el.dataset.revealIntro) {
            el.dataset.revealIntro = !inFirstView(el) ? 'scroll' : arrivedViaVT() ? 'none' : 'cover';
          }
          if (el.dataset.revealIntro === 'none') return;
          const cover = el.dataset.revealIntro === 'cover';
          try {
            SplitText.create(el, {
              type: 'lines',
              linesClass: 'split-line',
              autoSplit: true,
              onSplit(self) {
                const tl = cover
                  ? gsap.timeline({ delay: 0.05 })
                  : gsap.timeline({ scrollTrigger: { trigger: el, start: START, toggleActions: 'play none none none' } });
                self.lines.forEach((line, i) => {
                  const wrapper = document.createElement('div');
                  wrapper.className = 'line-wrapper';
                  const box = document.createElement('div');
                  box.className = 'line-box';
                  line.parentNode.insertBefore(wrapper, line);
                  wrapper.appendChild(line);
                  wrapper.appendChild(box);
                  const d = i * 0.08;
                  gsap.set(line, { opacity: 0 });
                  if (cover) {
                    gsap.set(box, { xPercent: 0, opacity: 1 });
                    tl.to(box, { xPercent: 102, duration: DUR.wipe, ease: EASE.wipe }, d);
                    tl.to(line, { opacity: 1, duration: DUR.m, ease: EASE.out }, d);
                  } else {
                    gsap.set(box, { xPercent: -102, opacity: 1 });
                    tl.to(box, { xPercent: 0, duration: DUR.wipe, ease: EASE.wipe }, d);
                    tl.to(box, { xPercent: 102, duration: DUR.wipe, ease: EASE.wipe }, d + DUR.wipe);
                    // 文字在色条离开的前半程就读得清：淡入比色条短，且用入场缓动
                    tl.to(line, { opacity: 1, duration: DUR.m, ease: EASE.out }, d + DUR.wipe);
                  }
                });
                return tl;
              },
            });
          } catch {
            /* 拆分失败：保持这行原样可读 */
          }
        });
        markReady(scope);
      }, scope);
      refreshSoon();
    });
    return () => {
      cancelled = true;
      ctx?.revert();
      scope.querySelectorAll('[data-reveal-intro]').forEach((el) => { delete el.dataset.revealIntro; });
    };
  }, [scopeRef]);
}

/**
 * 显现档位。透明度先于位移完成（fade < rise）：元素 300ms 就可读，位移再慢慢落定——比两者同长轻得多。
 *   lead    主标题、领句：大位移、稍晚
 *   metric  大数字：带 scale，像仪表归位
 *   base    正文、次要项、网格卡
 *   stack   横排卡片
 */
const TIERS = {
  lead: { from: { y: 48 }, fade: DUR.m, rise: DUR.xl, delay: 0.12 },
  metric: { from: { y: 18, scale: 0.94 }, fade: DUR.m, rise: DUR.l, delay: 0 },
  base: { from: { y: 12 }, fade: DUR.m, rise: DUR.l, delay: 0 },
  stack: { from: { y: 14 }, fade: DUR.m, rise: DUR.l, delay: 0 },
};
const tierOf = (el) => (
  el.classList.contains('anim-up--lead') ? TIERS.lead
    : el.classList.contains('anim-up--metric') ? TIERS.metric
      : el.hasAttribute('data-stack-card') ? TIERS.stack : TIERS.base);

/** 级联分组由 DOM 决定（与滚动速度无关）：显式 data-reveal-group，或这几类网格容器，否则归 scope。 */
const GROUP_SEL = '[data-reveal-group], .steps, .stack-deck, .specs, .contact-grid, .net__metrics, .team-grid, .hero__inner';

/**
 * 显现引擎：pending → visible → done。
 * - 每个元素自己的触发线（START），不会在视口外演完；
 * - 同组元素共用一条「排队时钟」：同一帧触发的依次错开 each，慢滚逐行触发不额外等待，快速甩屏也保持同样节奏；
 *   排队延迟封顶 CASCADE.max；同一 scope 内换组时插入 groupRest 休止。
 * - 资源显式登记，cleanup 逐个 kill；gsap.context 只是第二道保险（回调里创建的补间经 ctx.add 登记）。
 * - 绝不写 aria-hidden / inert；静止态即可见态，隐藏只由这里的 gsap.set 写 inline。
 */
function bindCascade(scope, els) {
  const triggers = [];
  const anims = [];
  const clocks = new Map(); // group -> nextFree (performance.now ms)
  let lastGroup = null;
  // 先建空 context 再绑定：起点已越过的触发器会在 ScrollTrigger.create 内同步调 onEnter，
  // 此时 play() 里的 ctx 必须已存在（否则抛错 → 元素停在 pending 隐身，违反 E0）
  const ctx = gsap.context(() => {}, scope);
  const play = (el, tier, target) => {
    const group = el.closest(GROUP_SEL) || scope;
    const now = performance.now();
    let queue = Math.max(0, (clocks.get(group) || 0) - now) / 1000;
    if (lastGroup && lastGroup !== group && (clocks.get(lastGroup) || 0) > now) queue += CASCADE.groupRest;
    queue = Math.min(queue, CASCADE.max);
    const extra = parseFloat(el.dataset.revealDelay || '0') || 0;
    const d = tier.delay + extra + queue;
    clocks.set(group, now + (queue + CASCADE.each) * 1000);
    lastGroup = group;
    ctx.add(() => {
      anims.push(gsap.to(el, { opacity: target, duration: tier.fade, ease: EASE.out, delay: d }));
      anims.push(gsap.to(el, {
        y: 0, scale: 1, duration: tier.rise, ease: EASE.out, delay: d,
        onComplete: () => { gsap.set(el, { clearProps: 'opacity,transform' }); markDone(el); },
      }));
      anims.push(gsap.delayedCall(d + tier.fade * 0.6, markVisible, [el]));
    });
  };
  ctx.add(() => {
    els.forEach((el) => {
      if (el.dataset.revealBound) return;
      el.dataset.revealBound = '1';
      // 首屏已可见的不藏（避免首帧闪烁）；经 View Transition 抵达同理
      if (inFirstView(el)) { markDone(el); return; }
      const tier = tierOf(el);
      // 保留 .card--soon 的 0.6 等设计态
      const target = parseFloat(getComputedStyle(el).opacity) || 1;
      markPending(el);
      gsap.set(el, { opacity: 0, ...tier.from });
      triggers.push(ScrollTrigger.create({ trigger: el, start: START, once: true, onEnter: () => play(el, tier, target) }));
    });
  });
  return () => {
    triggers.forEach((t) => t.kill());
    anims.forEach((a) => a.kill());
    ctx.revert();
    els.forEach((el) => { delete el.dataset.revealBound; delete el.dataset.reveal; });
  };
}

/** 滚动显现：scope 内的 .anim-up / .anim-up--lead / .anim-up--metric。 */
export function useReveal(scopeRef) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReduced()) return undefined;
    // gsap.utils.toArray 不受 gsap.context 约束，必须显式传 scope；按文档顺序（= 同帧触发的排队顺序）
    const els = gsap.utils.toArray('.anim-up, .anim-up--lead, .anim-up--metric', scope);
    if (!els.length) return undefined;
    const undo = bindCascade(scope, els);
    markReady(scope);
    return () => { clearReady(scope); undo(); };
  }, [scopeRef]);
}

/** 横排卡片的错峰淡入（刻意不用 pin 堆叠：横排三栏各自 pin 会撕裂）。 */
export function useStackDeck(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReduced()) return undefined;
    const cards = gsap.utils.toArray('[data-stack-card]', container);
    if (!cards.length) return undefined;
    const undo = bindCascade(container, cards);
    markReady(container);
    return () => { clearReady(container); undo(); };
  }, [containerRef]);
}

/**
 * 三步区：不 pin（CLAUDE.md 2026-09-01：pin 住会紧挨着 hero pin 再「卡」一次）。
 * 连线与三步随 .steps 自己的行程 scrub：顶边到视口 88% 开始画，到 40% 画完。
 * scrub:true + ease:'none'——输入平滑归 Lenis，这里只做 scroll→进度的线性映射。
 * 手机：没有连线，改走组内级联。
 */
export function useStepsPath(sectionRef) {
  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec || prefersReduced()) return undefined;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const steps = gsap.utils.toArray('[data-step]', sec);
      const line = sec.querySelector('[data-step-line]');
      if (!steps.length) return undefined;
      gsap.set(steps, { opacity: 0.28 });
      if (line) gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });
      const track = sec.querySelector('.steps') || sec;
      steps.forEach(markPending);
      // 生命周期跟随 scrub 进度（onRefresh 也算：中途刷新落在已滚过的位置时直接到位）
      const sync = (self) => steps.forEach((s, i) => {
        const at = (i * 0.85) / 3;
        if (self.progress >= at + 0.5 / 3) markVisible(s);
        if (self.progress >= at + 0.8 / 3) markDone(s);
      });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: track, start: START, end: 'top 40%', scrub: true, invalidateOnRefresh: true, onUpdate: sync, onRefresh: sync },
      });
      if (line) tl.to(line, { scaleX: 1, ease: EASE.scrub, duration: 3 }, 0);
      steps.forEach((s, i) => tl.to(s, { opacity: 1, duration: 0.8, ease: EASE.scrub }, i * 0.85));
      markReady(sec);
      return () => {
        clearReady(sec); tl.scrollTrigger?.kill(); tl.kill();
        steps.forEach((s) => { delete s.dataset.reveal; });
      };
    });
    // 手机：垂直堆叠，没有连线可画——走同一套组内级联（两个断点互斥，owner 仍只有这个 hook）
    mm.add('(max-width: 767px)', () => {
      const steps = gsap.utils.toArray('[data-step]', sec);
      if (!steps.length) return undefined;
      return bindCascade(sec.querySelector('.steps') || sec, steps);
    });
    return () => mm.revert();
  }, [sectionRef]);
}

/** SVG 路径随滚动描绘（pathLength="1" 已在标记里，dash 单位归一化，不用量 getTotalLength）。 */
export function useDrawPath(figRef) {
  useEffect(() => {
    const fig = figRef.current;
    if (!fig || prefersReduced()) return undefined;
    const ctx = gsap.context(() => {
      const curve = fig.querySelector('[data-draw]');
      const area = fig.querySelector('[data-draw-fill]');
      if (!curve) return;
      gsap.set(curve, { strokeDashoffset: 1 });
      if (area) gsap.set(area, { opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: START, end: 'bottom 55%', scrub: true } });
      tl.to(curve, { strokeDashoffset: 0, ease: EASE.scrub, duration: 1 }, 0);
      if (area) tl.to(area, { opacity: 1, ease: EASE.scrub, duration: 1 }, 0.15);
    }, fig);
    return () => ctx.revert();
  }, [figRef]);
}

/**
 * 速度反应式跑马灯。方向恒定、只调速度（负 timeScale 会退到 time=0 边界后卡死）。
 * 悬停几乎停下，让人能读清。
 */
export function useMarquee(trackRef) {
  useEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReduced()) return undefined;
    const ctx = gsap.context(() => {
      const total = track.scrollWidth / 3;
      if (!total) return;
      const wrap = gsap.utils.wrap(-total, 0);
      const tl = gsap.timeline({ repeat: -1 })
        .to(track, { x: `-=${total}`, duration: 28, ease: 'none', modifiers: { x: (x) => `${wrap(parseFloat(x))}px` } });
      const CRUISE = 0.4;
      tl.timeScale(CRUISE);
      let hovering = false;
      const obs = Observer.create({
        type: 'wheel,touch,scroll',
        onChangeY(self) {
          if (hovering) return;
          const boost = gsap.utils.clamp(CRUISE, 3, Math.abs(self.deltaY) * 0.12 + CRUISE);
          gsap.timeline({ defaults: { ease: 'none' } })
            .to(tl, { timeScale: boost, duration: 0.2, overwrite: true })
            .to(tl, { timeScale: CRUISE, duration: 1 });
        },
      });
      const host = track.parentElement;
      const canHover = window.matchMedia('(hover: hover)').matches;
      const onEnter = () => { hovering = true; gsap.to(tl, { timeScale: 0.04, duration: 0.45, ease: 'power2.out', overwrite: true }); };
      const onLeave = () => { hovering = false; gsap.to(tl, { timeScale: CRUISE, duration: 0.9, ease: 'power2.out', overwrite: true }); };
      if (canHover) { host.addEventListener('mouseenter', onEnter); host.addEventListener('mouseleave', onLeave); }
      markReady(host);
      return () => {
        obs.kill();
        if (canHover) { host.removeEventListener('mouseenter', onEnter); host.removeEventListener('mouseleave', onLeave); }
      };
    }, track);
    return () => ctx.revert();
  }, [trackRef]);
}

/**
 * Hero 蓝图网格：随滚动缓慢上移并极缓呼吸——像待机中的仪器。
 * distance（可选，函数）：视频 hero 被 pin 住时 'bottom top' 会把 -70px 摊到整段锁定距离上（肉眼不可见），
 * 所以由 Hero 传入一屏左右的固定行程，保证各视口的视差速度（Δy/Δscroll）一致。
 */
export function useGridParallax(gridRef, { distance } = {}) {
  useEffect(() => {
    const el = gridRef.current;
    if (!el || prefersReduced()) return undefined;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const end = distance ? () => `+=${distance()}` : 'bottom top';
      gsap.to(el, { y: -70, ease: EASE.scrub, scrollTrigger: { trigger: el.parentElement, start: 'top top', end, scrub: true, invalidateOnRefresh: true } });
      gsap.to(el, { opacity: 0.72, duration: 8, ease: 'sine.inOut', repeat: -1, yoyo: true });
    });
    return () => mm.revert();
  }, [gridRef]);
}

/** Hero 滚动提示：在前 100px 内淡出。 */
export function useHeroCue(cueRef) {
  useEffect(() => {
    const cue = cueRef.current;
    if (!cue || prefersReduced()) return undefined;
    const st = ScrollTrigger.create({
      trigger: document.documentElement, start: 'top top', end: 'top top-=100', scrub: 0,
      onUpdate: (self) => gsap.set(cue, { opacity: 1 - self.progress }),
    });
    return () => st.kill();
  }, [cueRef]);
}

/**
 * FAQ 手风琴：原生 <details> 语义不变（无 JS / reduced-motion 时仍能开合），有动效时接管 summary 点击，
 * 用高度补间展开/收起 .faq__body。owner 只有这一个补间；开合改变文档高度，结束后 refreshSoon()。
 */
export function useFaqAccordion(scopeRef) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReduced()) return undefined;
    const onClick = (e) => {
      const summary = e.target.closest('summary');
      if (!summary || !scope.contains(summary)) return;
      const item = summary.parentElement;
      const body = item.querySelector('.faq__body');
      if (!body) return;
      e.preventDefault();
      if (item.dataset.animating) return;
      item.dataset.animating = '1';
      const done = () => { gsap.set(body, { clearProps: 'height,opacity' }); delete item.dataset.animating; refreshSoon(); };
      if (!item.open) {
        item.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power3.out', onComplete: done });
      } else {
        gsap.to(body, { height: 0, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: () => { item.open = false; done(); } });
      }
    };
    scope.addEventListener('click', onClick);
    return () => scope.removeEventListener('click', onClick);
  }, [scopeRef]);
}
