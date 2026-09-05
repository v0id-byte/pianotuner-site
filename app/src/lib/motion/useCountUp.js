import { useEffect } from 'react';
import { gsap, prefersReduced } from './index';

/** 数字滚到最终值，只在首次进入视口跑一次。目标值是静态事实，绝不做每秒自增的假计数器。 */
export function useCountUp(scopeRef) {
  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return undefined;
    const targets = gsap.utils.toArray('[data-countup]', scope);
    if (!targets.length) return undefined;
    const final = (el) => `${el.dataset.countup}${el.dataset.countupSuffix || ''}`;
    if (prefersReduced()) { targets.forEach((el) => { el.textContent = final(el); }); return undefined; }
    const ctx = gsap.context(() => {
      targets.forEach((el) => {
        const end = parseFloat(el.dataset.countup);
        const suffix = el.dataset.countupSuffix || '';
        if (!Number.isFinite(end)) return;
        const state = { v: 0 };
        el.textContent = `0${suffix}`;
        gsap.to(state, {
          v: end, duration: 1.1, ease: 'power2.out', snap: { v: 1 },
          onUpdate: () => { el.textContent = `${Math.round(state.v)}${suffix}`; },
          scrollTrigger: { trigger: el, start: 'top bottom', toggleActions: 'play none none none' },
        });
      });
    }, scope);
    return () => { ctx.revert(); targets.forEach((el) => { el.textContent = final(el); }); };
  }, [scopeRef]);
}
