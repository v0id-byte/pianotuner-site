import { useEffect } from 'react';
import { gsap, ScrollTrigger, SplitText, Observer, WIPE_EASE, prefersReduced, refreshSoon, whenFontsReady } from './index';

/** 标记该 section 的动效已成功接管（QA 与 CSS 用；不承担隐藏内容的职责）。 */
const markReady = (el) => { if (el) el.dataset.motionReady = 'true'; };
const clearReady = (el) => { if (el) delete el.dataset.motionReady; };

/**
 * 逐行擦除条（站点签名动效）。一块实色方块从左滑入盖住整行，继续滑出右侧，文字在它离开时淡起。
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
          try {
            SplitText.create(el, {
              type: 'lines',
              linesClass: 'split-line',
              autoSplit: true,
              onSplit(self) {
                const tl = gsap.timeline({
                  scrollTrigger: { trigger: el, start: 'top bottom', toggleActions: 'play none none none' },
                });
                self.lines.forEach((line, i) => {
                  const wrapper = document.createElement('div');
                  wrapper.className = 'line-wrapper';
                  const box = document.createElement('div');
                  box.className = 'line-box';
                  line.parentNode.insertBefore(wrapper, line);
                  wrapper.appendChild(line);
                  wrapper.appendChild(box);
                  const d = i * 0.08;
                  gsap.set(box, { xPercent: -102, opacity: 1 });
                  gsap.set(line, { opacity: 0 });
                  tl.to(box, { xPercent: 0, duration: 0.9, ease: WIPE_EASE }, d);
                  tl.to(box, { xPercent: 102, duration: 0.9, ease: WIPE_EASE }, d + 0.9);
                  tl.to(line, { opacity: 1, duration: 0.9, ease: 'power2.inOut' }, d + 0.9);
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
    return () => { cancelled = true; ctx?.revert(); };
  }, [scopeRef]);
}

/**
 * 滚动显现，分三档（全站只用一档会让每一屏读起来都一样）：
 *   .anim-up--lead    主标题、领句：56px / 1.0s，稍晚入场
 *   .anim-up--metric  大数字：带 scale 0.94→1，像仪表归位
 *   .anim-up          正文、次要项：10px / 0.75s
 * 静止态即可见态：隐藏只由这里的 gsap.set 写 inline style。
 */
const REVEAL_TIERS = [
  { sel: '.anim-up--lead', from: { opacity: 0, y: 56 }, to: { duration: 1.0, ease: 'power2.out', delay: 0.12 } },
  { sel: '.anim-up--metric', from: { opacity: 0, y: 18, scale: 0.94 }, to: { duration: 0.9, ease: 'power2.out', scale: 1 } },
  { sel: '.anim-up', from: { opacity: 0, y: 10 }, to: { duration: 0.75, ease: 'power2.inOut' } },
];

export function useReveal(scopeRef) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope || prefersReduced()) return undefined;
    const ctx = gsap.context(() => {
      for (const tier of REVEAL_TIERS) {
        // gsap.utils.toArray 不受 gsap.context 约束，必须显式传 scope
        gsap.utils.toArray(tier.sel, scope).forEach((el) => {
          if (el.dataset.revealBound) return;
          el.dataset.revealBound = '1';
          gsap.set(el, tier.from);
          gsap.to(el, {
            opacity: 1, y: 0, ...tier.to,
            scrollTrigger: { trigger: el, start: 'top bottom', toggleActions: 'play none none none' },
          });
        });
      }
    }, scope);
    return () => {
      ctx.revert();
      scope.querySelectorAll('[data-reveal-bound]').forEach((el) => { delete el.dataset.revealBound; });
    };
  }, [scopeRef]);
}

/** 横排卡片的错峰淡入（刻意不用 pin 堆叠：横排三栏各自 pin 会撕裂）。 */
export function useStackDeck(containerRef) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReduced()) return undefined;
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('[data-stack-card]', container);
      if (!cards.length) return;
      gsap.set(cards, { opacity: 0, y: 14 });
      gsap.to(cards, {
        opacity: 1, y: 0, duration: 0.75, ease: 'power2.inOut', stagger: 0.09,
        scrollTrigger: { trigger: container, start: 'top bottom', toggleActions: 'play none none none' },
      });
      markReady(container);
    }, container);
    return () => { clearReady(container); ctx.revert(); };
  }, [containerRef]);
}

/**
 * 三步区：不 pin（CLAUDE.md 2026-09-01：pin 住会紧挨着 hero pin 再「卡」一次）。
 * 连线与三步随区块自己的行程 scrub：顶边从视口底部进场开始画，顶边贴到导航时画完。
 * 手机不建：垂直堆叠时直接可读。
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
      const tl = gsap.timeline({
        scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top+=64', scrub: 0.5, invalidateOnRefresh: true },
      });
      if (line) tl.to(line, { scaleX: 1, ease: 'none', duration: 3 }, 0);
      steps.forEach((s, i) => tl.to(s, { opacity: 1, duration: 0.8, ease: 'power2.out' }, i * 0.85));
      markReady(sec);
      return () => { clearReady(sec); tl.scrollTrigger?.kill(); tl.kill(); };
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
      const tl = gsap.timeline({ scrollTrigger: { trigger: fig, start: 'top 84%', end: 'bottom 55%', scrub: 0.5 } });
      tl.to(curve, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0);
      if (area) tl.to(area, { opacity: 1, ease: 'none', duration: 1 }, 0.15);
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

/** Hero 蓝图网格：随滚动缓慢上移并极缓呼吸——像待机中的仪器。 */
export function useGridParallax(gridRef) {
  useEffect(() => {
    const el = gridRef.current;
    if (!el || prefersReduced()) return undefined;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      gsap.to(el, { y: -70, ease: 'power2.in', scrollTrigger: { trigger: el.parentElement, start: 'top top', end: 'bottom top', scrub: 0 } });
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
