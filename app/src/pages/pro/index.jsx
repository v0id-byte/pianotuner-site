import { useRef } from 'react';
import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import Shell from '../../components/Shell';
import Scramble from '../../components/Scramble';
import PageHero from '../../components/PageHero';
import RailsbackFigure from '../../components/RailsbackFigure';
import PrecisionNote from '../../components/PrecisionNote';
import { BracketLink, Button, Eyebrow, Fn, SectionHead } from '../../components/ui';
import { useTextReveal, useReveal, useStackDeck } from '../../lib/motion/hooks';
import { EMAIL_REPORT, LEGAL_ZH } from '../../data/site';

export const meta = {
  navTheme: 'dark',
  ogType: 'product',
  zh: { title: 'Piano Tuner 专业版 | 旗舰级数字化调律解决方案', desc: 'Piano Tuner 专业版：端侧拉伸优化、专业频率分析、多琴档案与 PDF 钢琴健康报告，为职业调律师与音乐机构打造。Pro 年度订阅。' },
  en: { title: 'Piano Tuner Pro | Flagship Digital Tuning Solution', desc: 'Piano Tuner Pro: on-device stretch optimization, pro frequency analysis, multi-piano archives and PDF health reports. Annual subscription for pro tuners.' },
  jsonLd: (lang, { self }) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Piano Tuner Pro',
    url: self,
    image: 'https://www.pianotuner.top/og-cover.jpg',
    description: lang === 'en' ? 'Professional tier of the Piano Tuner app and hardware: Turbo mode, PDF health reports, cloud archive, historical temperaments.' : 'Piano Tuner 专业版：Turbo 模式、PDF 健康报告、云端档案、历史律制。',
    brand: { '@type': 'Brand', name: 'MelSpectrum' },
    manufacturer: { '@type': 'Organization', name: LEGAL_ZH, url: 'https://melspectrum.com' },
  }),
};

function Section({ id, island, children, className = '' }) {
  const root = useRef(null);
  useTextReveal(root);
  useReveal(root);
  return (
    <section id={id} className={`island-${island} p-custom py-section ${className}`.trim()} data-nav-theme={island === 'dark' ? 'dark' : 'light'} ref={root}>
      {children}
    </section>
  );
}

function Features() {
  const { t } = useT();
  const deck = useRef(null);
  useStackDeck(deck);
  const cards = [
    { num: '01 · OPTIMIZER', title: t('端侧拉伸优化引擎', 'On-device stretch optimizer'), desc: t('从实测不谐性（B 值）本机拟合专属拉伸曲线，确定、可复现。', 'Fits a bespoke stretch curve on-device from measured inharmonicity (B) — deterministic, reproducible.') },
    { num: '02 · ANALYSIS', title: t('专业级频率分析', 'Professional frequency analysis'), desc: t('基于声学原理的频率分析技术，在高频区同样稳定收敛到目标精度。', 'Acoustic-based frequency analysis that holds the target across the top octaves, and across the full range.') },
    { num: '03 · TURBO', title: t('Turbo 涡轮性能模式', 'Turbo performance mode'), desc: t('解除电机转速限制，大幅提升调音响应速度，显著缩短 88 键全流程调音总耗时。', 'Unlocks motor speed limits for faster response, drastically reducing total 88-key tuning time.') },
    { num: '04 · ARCHIVE', title: t('云端 CRM 数字化档案', 'Cloud CRM & archive'), desc: t('自动同步调音数据，为客户建立数字化档案，永久记录每台钢琴的历史状态与参数。', 'Auto-syncs tuning data to create digital customer archives, recording historical piano states.') },
    { num: '05 · REPORTS', title: t('PDF 钢琴健康报告', 'PDF health reports'), desc: t('低、中、高音区分别评分，逐键定位问题并附建议，本机生成、可打印。', 'Separate scores for bass, mid and treble, per-key problem spots and advice — generated on-device, print-ready.') },
    { num: '06 · TEMPERAMENTS', title: t('历史律制支持', 'Historical temperaments'), desc: t('内置 5 种历史律制（平均律、Werckmeister III、Kirnberger III、Young II、Valotti），适配各种古典演奏风格。', '5 historical temperaments built in (Equal, Werckmeister III, Kirnberger III, Young II, Valotti) to match classical performance styles.') },
  ];
  return (
    <Section island="light" id="features">
      <SectionHead eyebrow={t('PRO FEATURES · 六大独占特性', 'PRO FEATURES')} title={t('专业版 6 大独占特性', 'Six exclusive Pro features')} sub={t('为职业调律师与追求极致音准的钢琴玩家量身定制。', 'Tailored for professional tuners and audiophile piano owners.')} />
      <div className="stack-deck" ref={deck}>
        {cards.map((c) => (
          <article className="card" key={c.num} data-stack-card>
            <Scramble className="card__num t-ui">{c.num}</Scramble>
            <h3 className="t-h3">{c.title}</h3>
            <p className="card__desc t-body-sm">{c.desc}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Compare() {
  const { t } = useT();
  const rows = [
    [t('适用场景', 'Best for'), t('家庭练习 / 日常维护', 'Home practice / everyday upkeep'), t('职业调律师 / 音乐机构', 'Pro tuners / institutions')],
    [t('采样精度', 'Precision'), <>±2 {t('音分', '¢')}<Fn /></>, <>±2 {t('音分', '¢')}<Fn /></>],
    [t('调音曲线优化器', 'Curve optimizer'), t('通用曲线（可单独订阅）', 'Universal (add-on)'), t('端侧拉伸优化', 'On-device stretch')],
    [t('电机性能', 'Motor performance'), t('静音稳定模式', 'Silent / stable'), t('Turbo 涡轮性能加速', 'Turbo performance')],
    [t('云端 CRM', 'Cloud CRM'), '—', t('数字化客户档案库', 'Digital customer archive')],
    [t('健康报告', 'Health reports'), '—', t('PDF 深度分析报告', 'PDF deep analysis')],
    [t('律制支持', 'Temperaments'), t('平均律', 'Equal temperament'), t('5 种历史律制', '5 historical temperaments')],
    [t('授权方式', 'Licensing'), t('硬件内置', 'Included with hardware'), t('Pro 年度订阅（¥499/年）', 'Pro annual subscription (¥499/yr)')],
  ];
  return (
    <Section island="dark" id="comparison">
      <SectionHead eyebrow={t('EDITIONS · 选择版本', 'EDITIONS')} title={t('选择适合您的版本', 'Choose your edition')} />
      <div className="tablewrap">
        <table className="cmp">
          <thead>
            <tr>
              <th scope="col" className="t-ui">{t('核心维度', 'DIMENSION')}</th>
              <th scope="col" className="t-ui">{t('标准版', 'STANDARD')}</th>
              <th scope="col" className="t-ui cmp__hl">{t('专业版', 'PROFESSIONAL')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <th scope="row" className="t-ui">{r[0]}</th>
                <td className="t-body-sm">{r[1]}</td>
                <td className="cmp__hl">{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tablewrap__hint t-ui" aria-hidden="true">{t('← 左右滑动查看完整对比 →', '← SWIPE TO SEE THE FULL COMPARISON →')}</p>
    </Section>
  );
}

export default function Pro() {
  const { t, lang } = useT();
  return (
    <Shell page="pro" navTheme="dark">
      <PageHero
        variant="static"
        display
        eyebrow={t('PROFESSIONAL · 专业版', 'PROFESSIONAL')}
        l1={t('为专业调律师', 'A digital soul')}
        l2={t('赋予数字灵魂', 'for professional tuners')}
        sub={t('高精度声学、Turbo 电机、云端业务管理，一台调音器全包。', 'High-res acoustics, Turbo motor, cloud management — one tuner.')}
        actions={<>
          <BracketLink href={href(lang, 'buy')} highlight>{t('预售与候补名单', 'Pre-order & waitlist')}</BracketLink>
          <BracketLink href="#features">{t('六大独占特性', 'Six Pro features')}</BracketLink>
        </>}
      />
      <div className="gasket" aria-hidden="true" />
      <Section island="light" id="railsback">
        <article className="product">
          <div className="product__head">
            <Eyebrow>{t('CORE TECH · 核心技术', 'CORE TECH')}</Eyebrow>
          </div>
          <div className="product__body">
            <h2 className="t-h2 reveal-text">{t('调音曲线动态拟合引擎', 'Dynamic tuning-curve fitting engine')}</h2>
            <p className="product__lead t-body anim-up--lead">
              {t('从钢琴实测不谐性（B 值），端侧拉伸优化引擎毫秒级拟合专属全音域曲线——确定、可复现、无需联网。', "From your piano's measured inharmonicity (B), the on-device stretch optimizer fits a bespoke full-range curve in milliseconds — deterministic, reproducible, offline.")}
            </p>
            <dl className="specs">
              <div className="spec"><dt className="spec__k t-ui">{t('全音域物理模型补偿', 'GLOBAL MODEL COMPENSATION')}</dt><dd className="spec__v"><span className="spec__sub t-body-sm">{t('从实测不谐性本机生成专属全音域曲线，力学平衡逼近机械上限。', 'A bespoke full-range curve from measured inharmonicity, bringing mechanical balance near the limit.')}</span></dd></div>
              <div className="spec"><dt className="spec__k t-ui">{t('智能声学极窄拉伸', 'PSYCHOACOUSTIC MICRO-STRETCH')}</dt><dd className="spec__v"><span className="spec__sub t-body-sm">{t('以 ±2 音分', 'Works to ±2 cents')}<Fn />{t('的精度做极精微调，确保从 A0 到 C8 的全音域和谐过渡。', ' target precision, ensuring a harmonic transition from A0 to C8.')}</span></dd></div>
            </dl>
          </div>
          <div className="product__side">
            <RailsbackFigure />
          </div>
        </article>
      </Section>
      <Features />
      <div className="gasket" aria-hidden="true" />
      <Compare />
      <section id="cta" className="island-accent p-custom py-section" data-nav-theme="light">
        <div className="sec-head grid-custom">
          <div className="sec-head__eyebrow"><Eyebrow inverse>{t('GET STARTED · 开启专业调律', 'GET STARTED')}</Eyebrow></div>
          <h2 className="t-h2" style={{ gridColumn: '1 / -1' }}>{t('开启您的专业数字化调律', 'Start your professional tuning')}</h2>
          <p className="t-body" style={{ gridColumn: '1 / -1', maxWidth: '56ch' }}>
            {t('专业版以年度订阅方式授权（¥499/年）；基础调音无需任何订阅即可使用。当前销售暂停，加入候补名单，开售第一时间通知你。', 'Pro is licensed as an annual subscription (¥499/yr); basic tuning needs no subscription at all. Sales are currently paused — join the waitlist and we will notify you the moment they reopen.')}
          </p>
          <p className="t-body-sm" style={{ gridColumn: '1 / -1', maxWidth: '56ch' }}>
            {t('购买前请知悉：本产品为 Beta 测试版，仅支持换货，不支持退货退款。有任何意见或问题，请发送至 ', 'Before purchasing: this product is Beta — exchange only, no refund. Feedback: ')}
            <a className="literal" href={`mailto:${EMAIL_REPORT}`}>{EMAIL_REPORT}</a>
          </p>
        </div>
        <div className="cta__links" style={{ marginTop: 'var(--gap-y-md)' }}>
          <Button href={href(lang, 'buy')} variant="dark">{t('加入候补名单', 'Join the waitlist')}</Button>
          <BracketLink href={href(lang, 'index')} className="blink--onaccent">{t('返回产品首页', 'Back to the product')}</BracketLink>
        </div>
      </section>
      <div className="gasket" aria-hidden="true" />
      <PrecisionNote />
    </Shell>
  );
}
