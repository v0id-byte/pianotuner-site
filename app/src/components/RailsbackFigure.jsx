import { useRef } from 'react';
import { useT } from '../i18n';
import { useDrawPath } from '../lib/motion/hooks';
import { RB_CURVE, RB_AREA, RB_X, RB_Y } from '../data/railsback';

/** Railsback 拉伸曲线（示意），随滚动描绘。零圆角、单色、虚线网格。 */
export default function RailsbackFigure() {
  const { t } = useT();
  const fig = useRef(null);
  useDrawPath(fig);
  return (
    <figure className="rb" ref={fig}>
      <svg className="rb__svg" viewBox="0 0 1000 420" preserveAspectRatio="xMidYMid meet" role="img"
           aria-label={t('示意图：Railsback 拉伸曲线，低音区偏低、高音区偏高，A4 为基准', 'Illustration: Railsback stretch curve, flat in the bass, sharp in the treble, A4 as reference')}>
        {RB_Y.map(([y, l]) => (
          <g key={l}>
            <line x1="58" y1={y} x2="974" y2={y} className="rb__grid" />
            <text x="48" y={y + 4} className="rb__ylab">{l}</text>
          </g>
        ))}
        <path d="M58.0 215.2 L974.0 215.2" className="rb__zero" />
        <text x="974" y="206.2" className="rb__zlab" textAnchor="end">12-TET</text>
        <path d={RB_AREA} className="rb__area" data-draw-fill />
        <path d={RB_CURVE} className="rb__curve" pathLength="1" data-draw />
        {RB_X.map(([x, l]) => <text key={l} x={x} y="398" className="rb__xlab">{l}</text>)}
      </svg>
      <figcaption className="specs__note">
        {t('示意图 · 按标准非谐性模型生成（非实测数据）。每台琴的实际曲线由 App 在你的 iPhone 上现场拟合。',
           "Illustrative · generated from the standard inharmonicity model, not measured data. Your piano's actual curve is fitted on your iPhone, on the spot.")}
      </figcaption>
    </figure>
  );
}
