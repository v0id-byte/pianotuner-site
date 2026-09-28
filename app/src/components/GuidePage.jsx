import { useRef } from 'react';
import { useT } from '../i18n';
import { href } from '../i18n/urls';
import Shell from './Shell';
import PageHero from './PageHero';
import Section from './Section';
import SubscribeForm from './SubscribeForm';
import { BracketLink, Eyebrow } from './ui';
import { useTextReveal, useReveal } from '../lib/motion/hooks';
import { GUIDES } from '../data/guides';

/** 调律指南版式：复用法律页的编号段落 + 参考文献 + 候补名单 + 相关指南。 */
export default function GuidePage({ page, title, sub, intro, sections, refs }) {
  const { t, lang } = useT();
  const root = useRef(null);
  useTextReveal(root);
  useReveal(root);
  const related = GUIDES.filter((g) => g.id !== page);
  return (
    <Shell page={page} navTheme="dark">
      <PageHero eyebrow={t('GUIDE · 调律指南', 'TUNING GUIDE')} l1={title} sub={sub} topic="brass" />
      <section className="island-light topic-brass p-custom py-section" data-nav-theme="light" ref={root}>
        <p className="t-body-sm" style={{ color: 'var(--color-ash)', margin: 0 }}>
          {t('MelSpectrum · Piano Tuner 团队 · 2026 年 9 月', 'MelSpectrum · Piano Tuner team · September 2026')}
        </p>
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
        <div className="guide__refs">
          <h2 className="t-ui" style={{ color: 'var(--color-ash)' }}>{t('参考文献', 'REFERENCES')}</h2>
          <ol className="t-body-sm">
            {refs.map((r, i) => (
              <li key={i} id={`ref${i + 1}`}>{r.text} <a className="literal" href={r.url} target="_blank" rel="noopener noreferrer">{r.url.replace(/^https?:\/\//, '')}</a></li>
            ))}
          </ol>
        </div>
      </section>
      <Section island="accent" topic="brass" pad="py-section-sm">
        <div className="cta__grid">
          <div>
            <Eyebrow inverse>{t('PIANO TUNER · 为调律师打造', 'PIANO TUNER · BUILT FOR TUNERS')}</Eyebrow>
            <h2 className="t-h3" style={{ marginTop: 12 }}>{t('拧弦交给电机，音色由你把关。', 'Let the motor turn the pins. You keep the ear.')}</h2>
            <p className="t-body-sm" style={{ maxWidth: '48ch' }}>
              {t('Piano Tuner 是套在弦轴上的精密执行器 + iPhone App。新一轮早鸟预售计划于 2026 年第四季度开启，加入候补名单第一时间获知。', 'Piano Tuner is a precision actuator on the tuning pin plus an iPhone app. The next early-bird round is planned for Q4 2026 — join the waitlist to hear first.')}
            </p>
            <BracketLink href={href(lang, 'index')} className="blink--onaccent">{t('了解产品', 'Explore the product')}</BracketLink>
          </div>
          <SubscribeForm source={`guide-${page}`} />
        </div>
      </Section>
      <Section island="light" topic="brass" pad="py-section-sm">
        <Eyebrow>{t('MORE GUIDES · 更多指南', 'MORE GUIDES')}</Eyebrow>
        <div className="cta__links" style={{ marginTop: 16 }}>
          {related.map((g) => <BracketLink key={g.id} href={href(lang, g.id)}>{t(g.zh, g.en)}</BracketLink>)}
        </div>
      </Section>
    </Shell>
  );
}
