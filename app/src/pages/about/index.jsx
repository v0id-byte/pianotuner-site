import { useRef } from 'react';
import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import Shell from '../../components/Shell';
import PageHero from '../../components/PageHero';
import { BracketLink, Button, Eyebrow, SectionHead } from '../../components/ui';
import { useTextReveal, useReveal, useStackDeck } from '../../lib/motion/hooks';
import { useCountUp } from '../../lib/motion/useCountUp';
import { EMAIL_REPORT, MELSPECTRUM, LEGAL_ZH } from '../../data/site';

export const meta = {
  navTheme: 'dark',
  zh: { title: '关于我们 | Piano Tuner', desc: '融谱智能科技（深圳）有限公司，品牌 MelSpectrum。为专业调音师打造的自动调音器：硬件 · 软件 · 端侧 AI，三位一体。' },
  en: { title: 'About Us | Piano Tuner', desc: '融谱智能科技（深圳）有限公司, operating under the MelSpectrum brand. An automatic piano tuner built for pros: hardware, software and on-device AI in one.' },
  jsonLd: (lang, { self }) => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: LEGAL_ZH,
    alternateName: 'MelSpectrum',
    url: MELSPECTRUM,
    sameAs: [self],
    brand: { '@type': 'Brand', name: 'Piano Tuner' },
    email: EMAIL_REPORT,
    foundingDate: '2026',
  }),
};

function Section({ id, island, children }) {
  const root = useRef(null);
  useTextReveal(root);
  useReveal(root);
  useCountUp(root);
  return (
    <section id={id} className={`island-${island} p-custom py-section`} data-nav-theme={island === 'dark' ? 'dark' : 'light'} ref={root}>
      {children}
    </section>
  );
}

function Trinity() {
  const { t } = useT();
  const deck = useRef(null);
  useStackDeck(deck);
  const cards = [
    { num: '01 · HARDWARE', title: t('智能硬件核心', 'Smart hardware core'), desc: t('精密 FOC 电机，精准扭矩控制，蓝牙直连。', 'A precision FOC motor with accurate torque control and direct Bluetooth.') },
    { num: '02 · APP', title: t('iOS 智能操控', 'iOS smart control'), desc: t('SwiftUI 原生开发，借 iOS 原生硬件加速做硬件级音频分析，实时波形显示。', 'SwiftUI native, hardware-grade audio analysis on iOS hardware acceleration, with real-time waveforms.') },
    { num: '03 · CLOUD', title: t('档案、报告与固件', 'Profiles, reports & firmware'), desc: t('拉伸曲线在 iPhone 端侧生成；云端只存档案、报告、按钢琴缓存的 B 值与固件。', 'The stretch curve is computed on-device; the cloud only keeps profiles, reports, per-piano B-values, and firmware.') },
  ];
  return (
    <Section island="light" id="product">
      <SectionHead eyebrow={t('ARCHITECTURE · 产品架构', 'ARCHITECTURE')} title={t('硬件 + 软件 + 云端', 'Hardware + software + cloud')} sub={t('三位一体构建专业级自动调律系统。', 'A professional-grade auto-tuning system in one.')} />
      <div className="stack-deck" ref={deck}>
        {cards.map((c) => (
          <article className="card" key={c.num} data-stack-card>
            <span className="card__num t-ui">{c.num}</span>
            <h3 className="t-h3">{c.title}</h3>
            <p className="card__desc t-body-sm">{c.desc}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Numbers() {
  const { t } = useT();
  const items = [
    { v: '1', suffix: '', label: t('台 · 走遍全场', 'DEVICE · COVERS THEM ALL'), obs: t('按琴建档，多台钢琴共用一台设备', 'Per-piano profiles, one shared device') },
    { v: '88', suffix: '', label: t('键 · 全键覆盖', 'KEYS · FULL COVERAGE'), obs: t('88 键标准钢琴', '88-key standard piano') },
    { v: '3', suffix: '', label: t('项 · 三位一体', 'PILLARS · ONE SYSTEM'), obs: t('硬件 · 软件 · 端侧 AI', 'Hardware · Software · On-device AI') },
    { v: '2026', suffix: '', label: t('创立年份', 'FOUNDED'), obs: t('融谱智能科技（深圳）有限公司', 'MelSpectrum') },
  ];
  return (
    <Section island="dark" id="numbers">
      <SectionHead eyebrow={t('SPECIFICATIONS · 核心参数', 'SPECIFICATIONS')} title={t('数字说明一切', 'Numbers tell the story')} />
      <div className="net__metrics">
        {items.map((it) => (
          <article className="metric" key={it.label}>
            <span className="metric__label t-ui">{it.label}</span>
            <span className="t-metric metric__value anim-up--metric" data-countup={it.v} data-countup-suffix={it.suffix}>{it.v}{it.suffix}</span>
            <span className="metric__obs t-ui">{it.obs}</span>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Team() {
  const { t } = useT();
  // 只列真实自然人（website-public-claims §5）。CTO 姓名按现网保持，不做批量替换（HOLD）。
  const people = [
    { mono: '覃', role: t('FOUNDER · 技术负责人', 'FOUNDER · HEAD OF ENGINEERING'), name: t('覃刘浩然 · Soren Qin', 'Soren Qin'), bio: t('端侧算法、固件与整机架构。', 'On-device algorithms, firmware & system architecture.') },
    { mono: '张', role: t('CO-FOUNDER · CTO', 'CO-FOUNDER · CTO'), name: t('张奚瑞 · Zhang Xirui', 'Zhang Xirui'), bio: t('调律算法与控制策略。', 'Tuning algorithms & control strategy.') },
  ];
  return (
    <Section island="light" id="team">
      <SectionHead eyebrow={t('THE PEOPLE · 核心团队', 'THE PEOPLE')} title={t('创始团队', 'Founding team')} />
      <div className="team-grid">
        {people.map((p) => (
          <article className="person" key={p.mono}>
            <div className="person__top">
              <span className="person__mono" aria-hidden="true">{p.mono}</span>
              <div>
                <span className="t-ui" style={{ color: 'var(--color-ash)' }}>{p.role}</span>
                <h3 className="t-h3">{p.name}</h3>
              </div>
            </div>
            <p className="person__bio t-body-sm">{p.bio}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

export default function About() {
  const { t, lang } = useT();
  return (
    <Shell page="about" navTheme="dark">
      <PageHero
        variant="static"
        display
        eyebrow={t('MELSPECTRUM · 融谱智能科技（深圳）有限公司', '融谱智能科技（深圳）有限公司 · MELSPECTRUM')}
        l1={t('让每台钢琴', 'Every piano,')}
        l2={t('听见完美', 'perfectly tuned')}
        sub={t('为专业调音师打造的自动调音器。硬件 · 软件 · 端侧 AI，三位一体。', 'An automatic tuner, built for pros. Hardware · Software · On-device AI — in one.')}
        actions={<>
          <BracketLink href={href(lang, 'buy')} highlight>{t('预售与候补名单', 'Pre-order & waitlist')}</BracketLink>
          <BracketLink href="#product">{t('了解更多', 'Learn more')}</BracketLink>
        </>}
      />
      <div className="gasket" aria-hidden="true" />
      <Trinity />
      <div className="gasket" aria-hidden="true" />
      <Numbers />
      <section className="island-accent p-custom py-section" data-nav-theme="light">
        <div className="sec-head grid-custom">
          <div className="sec-head__eyebrow"><Eyebrow inverse>{t('VISION · 愿景', 'VISION')}</Eyebrow></div>
          <h2 className="t-h2" style={{ gridColumn: '1 / -1' }}>{t('「让每一台钢琴都能获得专业级的调律维护」', '"Every piano deserves professional-grade tuning"')}</h2>
          <p className="t-body" style={{ gridColumn: '1 / -1', maxWidth: '56ch' }}>{t('把专业级调律带进每一台钢琴，每位拥有者都值得一件音准的乐器。', 'Professional-grade tuning for every piano — every owner deserves an instrument in tune.')}</p>
        </div>
      </section>
      <Team />
      <div className="gasket" aria-hidden="true" />
      <section className="island-dark p-custom py-section" data-nav-theme="dark">
        <div className="sec-head grid-custom">
          <div className="sec-head__eyebrow"><Eyebrow>{t('CONTACT · 联系我们', 'CONTACT')}</Eyebrow></div>
          <h2 className="t-h2" style={{ gridColumn: '1 / -1' }}>{t('开启您的智能调律之旅', 'Start your smart-tuning journey')}</h2>
        </div>
        <div style={{ marginTop: 'var(--gap-y-md)' }}>
          <span className="t-ui" style={{ color: 'var(--color-ash)' }}>MAIL</span>
          <div style={{ marginTop: 12 }}>
            <a className="cta__mail anim-up--lead literal" href={`mailto:${EMAIL_REPORT}`}>{EMAIL_REPORT}</a>
          </div>
          <div className="cta__links" style={{ marginTop: 32 }}>
            <Button href={href(lang, 'buy')}>{t('预售与候补名单', 'Pre-order & waitlist')}</Button>
            <BracketLink href={MELSPECTRUM} external>{t('公司官网 melspectrum.com', 'Company site melspectrum.com')}</BracketLink>
          </div>
        </div>
      </section>
    </Shell>
  );
}
