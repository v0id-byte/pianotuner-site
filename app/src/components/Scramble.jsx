import { useEffect, useRef } from 'react';
import { gsap, prefersReduced } from '../lib/motion';
import ScrambleTextPlugin from 'gsap/ScrambleTextPlugin';

gsap.registerPlugin(ScrambleTextPlugin);

/**
 * 字符乱跳再还原。参数取自 spur 的 hover 变体：1.75s / revealDelay 0.15 / speed 1.25 / power4.inOut。
 * 两个触发：进场自动一次（IO 0.6）+ ≥1024px 且真有 hover 时悬停重复。
 * ⚠️ 只用于拉丁/数字，绝不用于中文（子集字体没有随机汉字）；
 * ⚠️ 任何受 Gate F 管理的数字/版本号不进这个组件（claims 文本在 DOM/视觉/读屏里只能是批准过的表述）。
 * ⚠️ 只 kill 自己持有的那一条补间，绝不 gsap.killTweensOf(el)（会杀掉别的 owner 的淡入）。
 */
export default function Scramble({ children, tag: Tag = 'span', className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return undefined;
    // 子集字体没有随机汉字，且 Gate F 文本不进乱码：含任何非 ASCII 字符就保持静态。
    if (/[^\x20-\x7E]/.test(el.textContent || '')) return undefined;
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
    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (!e.isIntersecting) return; io.unobserve(e.target); run(); });
      }, { threshold: 0.6 });
      io.observe(el);
    }
    const hoverable = window.matchMedia('(hover: hover) and (min-width: 1024px)').matches;
    if (hoverable) el.addEventListener('mouseenter', run);
    return () => {
      if (io) io.disconnect();
      if (hoverable) el.removeEventListener('mouseenter', run);
      if (tween) tween.kill();
    };
  }, [children]);
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
