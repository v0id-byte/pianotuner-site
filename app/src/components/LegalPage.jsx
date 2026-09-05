import { useRef } from 'react';
import { useT } from '../i18n';
import Shell from './Shell';
import PageHero from './PageHero';
import { useTextReveal, useReveal } from '../lib/motion/hooks';
import { EMAIL_SUPPORT, LEGAL_ZH, LEGAL_EN } from '../data/site';

/** 法律页版式：编号段落 + 虚线行。sections: [{ title, body: [<p>|<ul>…] }] */
export default function LegalPage({ page, kicker, title, updated, intro, sections }) {
  const { t, lang } = useT();
  const root = useRef(null);
  useTextReveal(root);
  useReveal(root);
  return (
    <Shell page={page} navTheme="dark">
      <PageHero eyebrow={kicker} l1={title} sub={updated} />
      <section className="island-light p-custom py-section" data-nav-theme="light" ref={root}>
        <p className="t-body" style={{ maxWidth: '78ch', color: 'var(--color-charcoal)' }}>{intro}</p>
        <div className="legal">
          {sections.map((s, i) => (
            <section className="legal__sec" key={i} id={`s${i + 1}`}>
              <span className="t-ui" style={{ color: 'var(--color-ash)' }}>{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h2 className="t-h3">{s.title}</h2>
                {s.body}
              </div>
            </section>
          ))}
        </div>
        <p className="t-body-sm" style={{ marginTop: 'var(--gap-y-md)', color: 'var(--color-charcoal)' }}>
          {t('如有疑问请联系：', 'Questions: ')}<a className="literal" href={`mailto:${EMAIL_SUPPORT}`}>{EMAIL_SUPPORT}</a>
          <br />{lang === 'en' ? `${LEGAL_EN} (Piano Tuner)` : `${LEGAL_ZH}（品牌 MelSpectrum / Piano Tuner）`}
        </p>
      </section>
    </Shell>
  );
}
