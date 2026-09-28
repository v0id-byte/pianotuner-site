import { useEffect, useRef } from 'react';
import { gsap, prefersReduced, REVEALED, IO_MARGIN } from '../lib/motion';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * 字符乱跳再还原。参数取自 spur 的 hover 变体：1.75s / revealDelay 0.15 / speed 1.25 / power4.inOut。
 * 两个触发：进场一次（等宿主卡片「可读」之后）+ ≥1024px 且真有 hover 时悬停整张卡重复。
 * ⚠️ 只用于拉丁/数字，绝不用于中文（子集字体没有随机汉字）；
 * ⚠️ 任何受 Gate F 管理的数字/版本号不进这个组件（claims 文本在 DOM/视觉/读屏里只能是批准过的表述）。
 * ⚠️ 只 kill 自己持有的那一条补间，绝不 gsap.killTweensOf(el)（会杀掉别的 owner 的淡入）。
 */
export default function Scramble({ children, tag: Tag = 'span', className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return undefined;
    // 子集字体没有随机汉字：含 CJK（含全角标点）就保持静态。`·`、`¢` 这类拉丁补充字符不在此列。
    if (/[\u3000-\u30ff\u3400-\u9fff\uf900-\ufaff\uff00-\uffef]/.test(el.textContent || '')) return undefined;
    let tween = null;
    let running = false;
    const run = () => {
      if (running) return;
      running = true;
      if (tween) tween.kill();
      tween = gsap.to(el, {
        duration: 1.75,
        ease: 'power4.inOut',
        scrambleText: { text: '{original}', chars: 'upperCase', revealDelay: 0.15, speed: 1.25 },
        onComplete: () => { running = false; },
      });
    };
    // 进场只跑一次，谁先到都走这个幂等锁：宿主的 pt:revealed（主）/ IO 兜底 / 无宿主时的短延时
    let entered = false;
    const enter = () => { if (entered) return; entered = true; run(); };
    const host = el.closest('.anim-up, .anim-up--metric, [data-stack-card], [data-step]');
    if (host) host.addEventListener(REVEALED, enter, { once: true });
    let io;
    let timer = 0;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          io.unobserve(e.target);
          const state = host?.dataset.reveal;
          if (!host || !state) timer = window.setTimeout(enter, 120); // 宿主不走显现系统
          else if (state === 'visible' || state === 'done') enter(); // 已可读（含首屏直接 done）
          // pending：等 pt:revealed
        });
      }, { threshold: 0, rootMargin: IO_MARGIN });
      io.observe(el);
    }
    // 悬停在整张卡/指标块上就重触发，不必精确悬停到这行小字。
    const hoverable = window.matchMedia('(hover: hover) and (min-width: 1024px)').matches;
    const hoverTarget = hoverable ? (el.closest('.card, .metric, .step, .spec') || el) : null;
    if (hoverTarget) hoverTarget.addEventListener('mouseenter', run);
    return () => {
      if (io) io.disconnect();
      window.clearTimeout(timer);
      if (host) host.removeEventListener(REVEALED, enter);
      if (hoverTarget) hoverTarget.removeEventListener('mouseenter', run);
      if (tween) tween.kill();
    };
  }, [children]);
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
