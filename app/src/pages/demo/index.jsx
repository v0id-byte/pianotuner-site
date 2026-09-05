import { useRef } from 'react';
import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import Shell from '../../components/Shell';
import PageHero from '../../components/PageHero';
import PrecisionNote from '../../components/PrecisionNote';
import { BracketLink, Eyebrow, Fn, SectionHead } from '../../components/ui';
import { useTextReveal, useReveal } from '../../lib/motion/hooks';

export const meta = {
  navTheme: 'dark',
  zh: { title: '演示视频 — Piano Tuner', desc: 'Piano Tuner V1.0 调音器原型实测演示：蓝牙连接、采集音频、生成专属调音曲线，再驱动机械执行端拧弦——全程自动。' },
  en: { title: 'Live Demo — Piano Tuner', desc: 'Piano Tuner V1.0 prototype demo: connects over Bluetooth, captures the audio, builds a custom tuning curve, then drives the actuator to turn the pins — all automatic.' },
  jsonLd: (lang, { self }) => ({
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: lang === 'en' ? 'Piano Tuner V1.0 prototype live demo' : 'Piano Tuner V1.0 原型实测演示',
    description: lang === 'en' ? 'From listening to turning, in one take.' : '从听音到拧弦，一镜到底。',
    thumbnailUrl: 'https://www.pianotuner.top/og-cover.jpg',
    contentUrl: 'https://www.pianotuner.top/demo1.mp4',
    uploadDate: '2026-03-29',
    url: self,
  }),
};

export default function Demo() {
  const { t, lang } = useT();
  const root = useRef(null);
  useTextReveal(root);
  useReveal(root);
  const chips = [
    { k: t('调音精度', 'PRECISION'), v: <>±2 {t('音分', '¢')}<Fn /></> },
    { k: t('音域', 'RANGE'), v: 'A0 – C8' },
    { k: t('琴键', 'KEYS'), v: '88' },
    { k: t('版本', 'VERSION'), v: t('V1.0 原型演示', 'V1.0 prototype') },
  ];
  const upgrades = [
    { num: '01 · ALGORITHMS', title: t('Pro 专业算法', 'Pro algorithms'), desc: <>{t('调音精度 ±2 音分', 'Tuning accuracy ±2 cents')}<Fn />{t('。', '.')}</> },
    { num: '02 · OVERTWIST', title: t('回扳保护', 'Overtwist protection'), desc: t('智能感知弦轴摩擦力，自动防止过度拧紧。', 'Intelligently detects string friction to prevent over-tightening.') },
    { num: '03 · STRINGGUARD', title: t('StringGuard 张力保护系统', 'StringGuard tension protection'), desc: t('实时弦张监测，多重保护，降低断弦风险。', 'Real-time tension monitoring with multiple safeguards against string breaks.') },
    { num: '04 · OTA', title: t('无线升级', 'Wireless updates'), desc: t('固件蓝牙更新，像手机一样不断进化。', 'Firmware updates over Bluetooth — it evolves like a phone.') },
  ];
  return (
    <Shell page="demo" navTheme="dark">
      <PageHero
        eyebrow={t('LIVE DEMO · 现场演示', 'LIVE DEMO')}
        l1={t('Piano Tuner', 'Piano Tuner')}
        l2={t('实测演示', 'live demo')}
        display
        sub={t('V1.0 调音器原型，从听音到拧弦，一镜到底。', 'The V1.0 tuner prototype — from listening to turning, in one take.')}
      />
      <section className="island-dark p-custom py-section" data-nav-theme="dark" ref={root} style={{ paddingTop: 0 }}>
        <div className="video-frame">
          {/* demo1.mp4 只存在于 origin（ORIGIN_ONLY），本地预览时 404 属预期 */}
          <video controls preload="metadata" playsInline poster="/og-cover.jpg">
            <source src="/demo1.mp4" type="video/mp4" />
            {t('您的浏览器不支持视频播放，请使用 Chrome 或 Safari。', 'Your browser does not support video playback. Please use Chrome or Safari.')}
          </video>
        </div>
        <dl className="specs" style={{ marginTop: 'var(--gap-y-md)' }}>
          <div className="spec"><dt className="spec__k t-ui">{t('关于本演示', 'ABOUT THIS DEMO')}</dt><dd className="spec__v"><span className="spec__sub t-body-sm">{t('蓝牙连接、采集音频、生成专属调音曲线，再驱动机械执行端拧弦——全程自动。', 'It connects over Bluetooth, captures the audio, builds a custom tuning curve, then drives the actuator to turn the pins — all automatic.')}</span></dd></div>
          {chips.map((c) => <div className="spec" key={c.k}><dt className="spec__k t-ui">{c.k}</dt><dd className="spec__v">{c.v}</dd></div>)}
        </dl>
      </section>
      <section className="island-light p-custom py-section" data-nav-theme="light">
        <SectionHead eyebrow={t('V2.0 · 核心升级', 'V2.0 · KEY UPGRADES')} title={t('V2.0 核心升级亮点', 'V2.0 key upgrades')} />
        <div className="steps" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
          {upgrades.map((u) => (
            <article className="step" key={u.num}>
              <span className="card__num t-ui">{u.num}</span>
              <h3 className="t-h3">{u.title}</h3>
              <p className="card__desc t-body-sm">{u.desc}</p>
            </article>
          ))}
        </div>
        <div className="product__actions" style={{ marginTop: 'var(--gap-y-md)' }}>
          <BracketLink href={href(lang, 'index')}>{t('了解产品', 'Explore the product')}</BracketLink>
          <BracketLink href={href(lang, 'buy')}>{t('预售与候补名单', 'Pre-order & waitlist')}</BracketLink>
        </div>
      </section>
      <div className="gasket" aria-hidden="true" />
      <PrecisionNote />
    </Shell>
  );
}
