import { useRef } from 'react';
import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import Shell from '../../components/Shell';
import PageHero from '../../components/PageHero';
import Scramble from '../../components/Scramble';
import { BracketLink, SectionHead } from '../../components/ui';
import { useTextReveal, useReveal } from '../../lib/motion/hooks';
import { GUIDES, GUIDE_CATEGORIES } from '../../data/guides';
import { breadcrumb, graph } from '../schema';

const NAME = { zh: '钢琴调律指南', en: 'Piano tuning guides' };

export const meta = {
  published: '2026-10-01',
  updated: '2026-10-01',
  navTheme: 'dark',
  zh: {
    title: '钢琴调律指南：调音频率、拉伸调律与电子调音 | Piano Tuner',
    desc: '写给钢琴主人和调律师的调律知识：钢琴多久调一次、拉伸调律与 Railsback 曲线、电子调音与耳调。每篇都附文献出处。',
  },
  en: {
    title: 'Piano Tuning Guides: Frequency, Stretch Tuning and Electronic Tuning | Piano Tuner',
    desc: 'Piano tuning explained for owners and technicians: how often to tune, stretch tuning and the Railsback curve, electronic vs. aural tuning. Every guide cites its sources.',
  },
  // Hub 不是文章：WebPage + 两级面包屑，不套 Article。
  jsonLd: (lang, { self }) => graph(
    { '@type': 'WebPage', url: self, name: NAME[lang], inLanguage: lang === 'en' ? 'en' : 'zh-CN' },
    breadcrumb(lang, 'guides', NAME[lang]),
  ),
};

export default function GuidesHub() {
  const { t, lang } = useT();
  const root = useRef(null);
  useTextReveal(root);
  useReveal(root);
  return (
    <Shell page="guides" navTheme="dark">
      <PageHero
        eyebrow={t('GUIDES · 调律指南', 'TUNING GUIDES')}
        l1={t(NAME.zh, NAME.en)}
        sub={t('调律背后的声学、理论与方法。每篇都附文献出处。', 'The acoustics, theory and methods behind piano tuning. Every guide cites its sources.')}
      />
      <section className="island-light p-custom py-section" data-nav-theme="light" ref={root}>
        {GUIDE_CATEGORIES.map((c, ci) => {
          const items = GUIDES.filter((g) => g.category === c.id);
          if (!items.length) return null;
          return (
            <div key={c.id} style={ci ? { marginTop: 'var(--gap-y-lg)' } : undefined}>
              <SectionHead eyebrow={t(`${c.en.toUpperCase()} · ${c.zh}`, c.en.toUpperCase())} title={t(c.zh, c.en)} />
              <div className="steps" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                {items.map((g, i) => (
                  <article className="step anim-up" key={g.id}>
                    <Scramble className="card__num t-ui">{`${String(i + 1).padStart(2, '0')} · ${c.en.toUpperCase()}`}</Scramble>
                    <h3 className="t-h3"><a href={href(lang, g.id)}>{t(g.zh, g.en)}</a></h3>
                    <p className="card__desc t-body-sm">{t(g.descZh, g.descEn)}</p>
                    <BracketLink href={href(lang, g.id)}>{t('阅读指南', 'Read the guide')}</BracketLink>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </Shell>
  );
}
