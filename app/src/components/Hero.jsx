import { useRef } from 'react';
import { useT } from '../i18n';
import { useTextReveal, useReveal, useHeroCue, useGridParallax } from '../lib/motion/hooks';
import { useHeroVideoLock } from '../lib/motion/useHeroVideoLock';
import BlueprintGrid from './BlueprintGrid';
import { BracketLink } from './ui';

/**
 * 视频首屏（滚动锁定）：poster 是永远存在的底层，视频不带 src 出厂，只在桌面分支注入。
 * 排版层照 melspectrum：压底、t-display 两行阶梯、擦除条、5/6 分栏、SCROLL 提示、蓝图网格。
 */
export default function Hero({ eyebrow, l1, l2, sub, primary, secondary, poster, mp4, proof }) {
  const { t } = useT();
  const root = useRef(null);
  const video = useRef(null);
  const cue = useRef(null);
  const grid = useRef(null);
  useTextReveal(root);
  useReveal(root);
  useHeroCue(cue);
  useGridParallax(grid);
  useHeroVideoLock(root, video);
  return (
    <section id="top" className="hero hero--video island-dark p-custom" data-nav-theme="dark" ref={root}>
      <div className="hero__media" aria-hidden="true">
        <img className="hero__poster" src={poster} alt="" width="1280" height="720" fetchPriority="high" decoding="async" />
        {mp4 ? <video className="hero__video" ref={video} muted playsInline preload="none" tabIndex={-1} data-src-mp4={mp4} /> : null}
      </div>
      <BlueprintGrid innerRef={grid} />
      <div className="hero__inner">
        <span className="t-ui hero__eyebrow anim-up">{eyebrow}</span>
        <h1 className="t-display hero__title reveal-text">
          <span className="l1">{l1}</span>
          <span className="l2">{l2}</span>
        </h1>
        <div className="hero__foot">
          <p className="hero__sub t-body anim-up--lead">{sub}{proof ? <><br />{proof}</> : null}</p>
          <div className="hero__actions anim-up">
            {primary}
            {secondary}
          </div>
        </div>
        <div className="hero__cue t-ui" ref={cue}>
          <span>SCROLL</span>
          <span className="line" />
        </div>
      </div>
    </section>
  );
}

export { BracketLink };
