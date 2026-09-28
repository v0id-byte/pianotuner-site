import { useEffect } from 'react';
import { gsap, ScrollTrigger, prefersReduced, refreshSoon } from './index';

/**
 * 滚动插值的唯一所有者。平滑全部交给 Lenis；ScrollTrigger 不再叠加数值 scrub。
 * reduced-motion 下完全不启动 Lenis（它本质是对原生滚动响应的重映射）。
 * Lenis 动态 import：reduced-motion 用户不下载，也不进 SSR 图。
 */
/**
 * 带 hash 的新导航（/#faq）落点修正：浏览器在加载时已跳到 #faq，但首屏视频的 pin 在 loadedmetadata 之后
 * 才「晚建」，pin spacer 把目标整体推下一个锁定距离（实测差 2100px）。这里在 pin 建好后的第一次 refresh
 * 重新对准一次，然后撤掉监听。只在「新导航 + 用户还没动过」时做：刷新 / 前进后退由浏览器恢复滚动位置，
 * 用户一旦滚动、触摸、按键就放弃，绝不跟用户抢。不碰 useHeroVideoLock.js。
 */
function fixHashLanding() {
  const nav = performance.getEntriesByType?.('navigation')?.[0];
  if (!location.hash || (nav && nav.type !== 'navigate')) return () => {};
  let target = null;
  try { target = document.querySelector(decodeURIComponent(location.hash)); } catch { return () => {}; }
  if (!target) return () => {};
  let touched = false;
  const onUser = () => { touched = true; };
  const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  evs.forEach((ev) => window.addEventListener(ev, onUser, { passive: true, once: true }));
  const onRefresh = () => {
    if (touched) return done();
    if (!document.querySelector('.pin-spacer')) return undefined;
    const offset = (document.querySelector('.nav')?.offsetHeight || 64) + 16;
    const y = target.getBoundingClientRect().top + window.scrollY - offset;
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
    return done();
  };
  function done() {
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    evs.forEach((ev) => window.removeEventListener(ev, onUser));
  }
  ScrollTrigger.addEventListener('refresh', onRefresh);
  return done;
}

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
      // stopInertiaOnNavigate：点链接离开时先停住惯性，跨页过渡截到的是静止的旧页
      lenis = new Lenis({ lerp: 0.12, anchors: { offset }, stopInertiaOnNavigate: true });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      raf = (t) => lenis.raf(t * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      document.documentElement.dataset.motion = 'smooth';
      refreshSoon();
    });
    // BFCache 恢复：页面原样回来，但视口/字体可能变过——重新量一次（不改滚动位置）
    const onShow = (e) => { if (e.persisted) refreshSoon(); };
    window.addEventListener('pageshow', onShow);
    const undoHash = fixHashLanding();
    return () => {
      window.removeEventListener('pageshow', onShow);
      undoHash();
      cancelled = true;
      if (raf) gsap.ticker.remove(raf);
      lenis?.destroy();
      delete window.__lenis;
      delete document.documentElement.dataset.motion;
    };
  }, []);
  return children;
}
