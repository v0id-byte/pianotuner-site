import { useRef } from 'react';
import { useTextReveal, useReveal } from '../lib/motion/hooks';
import { useCountUp } from '../lib/motion/useCountUp';

/**
 * 通用区块：岛配色 + 显现 hooks。区块本身是显现的兜底分组（组内级联、换组休止，见 hooks.js bindCascade）。
 * island: 'dark' | 'light' | 'accent'；navTheme 缺省随岛（accent 岛上导航用浅色）。
 * topic: 'brass' | 'teal'（主题色作用域，见 tokens.css）；countUp: 区块内有 [data-countup] 时开。
 */
export default function Section({
  id, island = 'light', topic, className = '', navTheme, pad = 'py-section', style, countUp = false, children,
}) {
  const root = useRef(null);
  useTextReveal(root);
  useReveal(root);
  useCountUp(countUp ? root : NONE);
  const cls = [`island-${island}`, topic ? `topic-${topic}` : '', 'p-custom', pad, className].filter(Boolean).join(' ');
  return (
    <section id={id} className={cls} style={style} data-nav-theme={navTheme || (island === 'dark' ? 'dark' : 'light')} ref={root}>
      {children}
    </section>
  );
}

const NONE = { current: null };
