import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';
import { Observer } from 'gsap/Observer';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, Observer);

/** 站点的运动签名：violently symmetric ease-in-out，静→急→缓。 */
export const WIPE_EASE = CustomEase.create('ptWipe', '1, 0, 0, 1');

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * 让出一帧再测量。document.fonts.ready 只表示字体加载已 settled，并不保证此刻
 * layout 已稳定。
 *
 * ⚠️ 与 melspectrum 不同：这里必须 sort() 再 refresh()。本站 hero 的 pin 在视频报出
 * duration 之后才异步创建，refresh() 单独调用会沿用陈旧的创建顺序，把它后面所有
 * trigger 都算短一个锁定距离（CLAUDE.md 2026-08-30 线上事故）。
 */
export function refreshNow() {
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}
/** rAF 与 setTimeout 竞速：后台标签页 / 隐藏面板会暂停 rAF，谁先到谁算数。 */
function afterPaint(cb, ms = 150) {
  let done = false;
  const go = () => { if (done) return; done = true; cb(); };
  requestAnimationFrame(() => requestAnimationFrame(go));
  setTimeout(go, ms);
}
export function refreshSoon() {
  afterPaint(refreshNow);
}

/** 字体就绪后再拆行——行盒会随字体落定而改变。 */
export function whenFontsReady(cb) {
  if (typeof document === 'undefined') return;
  const run = () => afterPaint(cb, 60);
  if (document.fonts?.ready) document.fonts.ready.then(run).catch(run);
  else run();
}

export { gsap, ScrollTrigger, SplitText, Observer };
