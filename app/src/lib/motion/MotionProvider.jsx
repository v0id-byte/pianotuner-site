import { useEffect } from 'react';
import { gsap, ScrollTrigger, prefersReduced, refreshSoon } from './index';

/**
 * 滚动插值的唯一所有者。平滑全部交给 Lenis；ScrollTrigger 不再叠加数值 scrub。
 * reduced-motion 下完全不启动 Lenis（它本质是对原生滚动响应的重映射）。
 * Lenis 动态 import：reduced-motion 用户不下载，也不进 SSR 图。
 */
export default function MotionProvider({ children }) {
  useEffect(() => {
    if (prefersReduced()) {
      document.documentElement.dataset.motion = 'static';
      return () => { delete document.documentElement.dataset.motion; };
    }
    let lenis;
    let raf;
    let cancelled = false;
    import('lenis').then(({ default: Lenis }) => {
      if (cancelled) return;
      // 锚点偏移从导航实际高度读，而不是再写一个 -72 常量
      const nav = document.querySelector('.nav');
      const offset = -((nav?.offsetHeight || 64) + 16);
      lenis = new Lenis({ lerp: 0.12, anchors: { offset } });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      raf = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      document.documentElement.dataset.motion = 'smooth';
      refreshSoon();
    });
    return () => {
      cancelled = true;
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      delete window.__lenis;
      delete document.documentElement.dataset.motion;
    };
  }, []);
  return children;
}
