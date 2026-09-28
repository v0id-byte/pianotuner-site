import { useRef } from 'react';
import { useTextReveal, useReveal, useGridParallax } from '../lib/motion/hooks';
import BlueprintGrid from './BlueprintGrid';

/**
 * 非视频页的首屏：暗岛 + 蓝图网格 + t-display 两行阶梯 + 擦除条。
 * variant 'static' 带木纹底图（压暗 scrim），'plain' 纯黑不带图、高度更矮。
 */
export default function PageHero({ eyebrow, l1, l2, sub, actions, variant = 'plain', display = false }) {
  const root = useRef(null);
  const grid = useRef(null);
  useTextReveal(root);
  useReveal(root);
  useGridParallax(grid);
  return (
    <section id="top" className={`hero hero--${variant} island-dark p-custom`} data-nav-theme="dark" ref={root}>
      <div className="hero__media" aria-hidden="true" />
      <BlueprintGrid innerRef={grid} />
      <div className="hero__inner">
        {eyebrow ? <span className="t-ui hero__eyebrow anim-up">{eyebrow}</span> : null}
        <h1 className={`${display ? 't-display' : 't-h2 t-h2--hero'} hero__title reveal-text`}>
          <span className="l1">{l1}</span>
          {l2 ? <span className="l2">{l2}</span> : null}
        </h1>
        {(sub || actions) ? (
          <div className="hero__foot">
            {sub ? <p className="hero__sub t-body anim-up--lead">{sub}</p> : null}
            {actions ? <div className="hero__actions anim-up">{actions}</div> : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
