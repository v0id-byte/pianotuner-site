import { useRef } from 'react';
import { useT } from '../i18n';
import { useMarquee } from '../lib/motion/hooks';

/** 技术关键词条带。不含任何精度数字（跑马灯承载不了角标与脚注）。 */
export default function Marquee({ items }) {
  const { t } = useT();
  const track = useRef(null);
  useMarquee(track);
  const copies = [0, 1, 2];
  return (
    <section className="island-light marquee" data-nav-theme="light" aria-label={t('技术关键词', 'Technology keywords')}>
      <div className="marquee__track" ref={track}>
        {copies.map((c) => (
          <span key={c} className="marquee__copy" aria-hidden={c === 0 ? undefined : 'true'}>
            {items.map((it, i) => (
              <span className="marquee__item" key={`${c}-${i}`}>
                {it}
                <span className="marquee__sep" aria-hidden="true"> — </span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </section>
  );
}
