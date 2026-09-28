import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(CustomEase);

/**
 * 运动 token：全站唯一的缓动 / 时长 / 触发点来源。
 * ⚠️ 与 styles/tokens.css 的 --ease-* / --dur-* 是同一组数，改一处必须同步另一处。
 *
 * 缓动分工（emil-design-eng 与 onetake 的共同结论，只借思路）：
 *   out    入场——起步即动、尾段长减速（静→急→缓的「急」在最前）
 *   inOut  已在屏上的元素跨屏移动
 *   wipe   站点签名擦除条（violently symmetric）
 *   exit   仅用于离场；UI 入场永不用 ease-in
 *   scrub  滚动绑定的一律线性：scroll 已经是进度，再叠缓动等于把映射扭两次
 */
export const EASE = {
  out: CustomEase.create('ptOut', '.22,1,.36,1'),
  inOut: CustomEase.create('ptInOut', '.65,0,.35,1'),
  wipe: CustomEase.create('ptWipe', '1,0,0,1'),
  exit: 'power2.in',
  scrub: 'none',
};

/** 秒。xs/s 用于反馈（<300ms），m/l/xl 用于叙事显现，wipe 是擦除条单程。 */
export const DUR = { xs: 0.15, s: 0.25, m: 0.5, l: 0.8, xl: 1.1, wipe: 0.9 };

/** 显现触发点：元素顶边进入视口 88% 处。'top bottom' 会让动画在视口底边外演完。 */
export const START = 'top 88%';
/** IntersectionObserver 版的同一条线（兜底用）。 */
export const IO_MARGIN = '0px 0px -12% 0px';

/** 组内级联：每项 70ms，整组总展开封顶 420ms；同一 section 内换组时再插一段休止。 */
export const CASCADE = { each: 0.07, max: 0.42, groupRest: 0.12 };
export const cascadeEach = (n) => (n > 1 ? Math.min(CASCADE.each, CASCADE.max / (n - 1)) : 0);

/* ---------- 显现生命周期：pending → visible → done ---------- */
/** 宿主「已可读」时派发（opacity 过阈值），不是「动画结束」。Scramble 等下游只听这个。 */
export const REVEALED = 'pt:revealed';
export const markPending = (el) => { el.dataset.reveal = 'pending'; };
export function markVisible(el) {
  const s = el.dataset.reveal;
  if (s === 'visible' || s === 'done') return;
  el.dataset.reveal = 'visible';
  el.dispatchEvent(new CustomEvent(REVEALED));
}
export function markDone(el) {
  if (el.dataset.reveal !== 'visible') markVisible(el);
  el.dataset.reveal = 'done';
}
