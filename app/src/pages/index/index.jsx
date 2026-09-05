import { useRef } from 'react';
import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import Shell from '../../components/Shell';
import Hero from '../../components/Hero';
import Marquee from '../../components/Marquee';
import BeatFigure from '../../components/BeatFigure';
import RailsbackFigure from '../../components/RailsbackFigure';
import SubscribeForm from '../../components/SubscribeForm';
import PrecisionNote from '../../components/PrecisionNote';
import Scramble from '../../components/Scramble';
import { BracketLink, Button, Eyebrow, Fn, SectionHead } from '../../components/ui';
import { useTextReveal, useReveal, useStackDeck, useStepsPath } from '../../lib/motion/hooks';
import { TESTFLIGHT, LEGAL_ZH } from '../../data/site';

export const meta = {
  navTheme: 'dark',
  ogType: 'product',
  zh: {
    title: '钢琴调音机器人 | 实验室测试精度 ±2 音分 - Piano Tuner',
    desc: '钢琴调音机器人 / 自动调音器：套在弦轴上的精密执行器 + iPhone App，自动调准 88 键，实验室测试精度 ±2 音分。为专业调音师打造，省手腕、提效率，端侧生成专属 Railsback 曲线。',
    ogDesc: '为调音师打造的自动调音器：电机替你逐弦拧到位，省手腕、多接琴、可交给助手。实验室测试精度 ±2 音分，立式/三角钢琴均适用。',
    keywords: '钢琴调音,钢琴调音器,自动钢琴调音,智能调音机器人,钢琴调音机器人,钢琴调音费用,钢琴调音价格,钢琴多久调一次,钢琴跑调,立式钢琴调音,三角钢琴调音,钢琴调音APP,钢琴调音上门,Railsback曲线,钢琴音准,piano tuner,automatic piano tuner,piano tuning robot,auto piano tuning,robotic piano tuner,piano tuning machine,自动钢琴调音器',
  },
  en: {
    title: 'Piano Tuner — Automatic Piano-Tuning Robot',
    desc: 'Automatic piano tuner and tuning robot: a precision actuator on the tuning pin plus an iPhone app that tunes all 88 keys to a lab-tested ±2 cents. Built for pro tuners — spare your wrists, tune faster, fit a Railsback curve on-device.',
    ogDesc: 'An automatic tuner built for tuners: the motor turns every pin to pitch — spare your wrists, take on more pianos, hand the work off. Lab-tested ±2 cents; uprights and grands.',
    keywords: 'piano tuner,automatic piano tuner,piano tuning robot,auto piano tuning,robotic piano tuner,piano tuning machine,Railsback curve,piano tuning app',
  },
  jsonLd: (lang, { self }) => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Piano Tuner',
    url: self,
    image: 'https://www.pianotuner.top/og-cover.jpg',
    description: lang === 'en'
      ? 'Automatic piano-tuning robot: lab-tested ±2-cent accuracy, all 88 keys, uprights and grands.'
      : '自动钢琴调音机器人，实验室测试精度 ±2 音分，支持 88 键全音域，适合立式和三角钢琴',
    brand: { '@type': 'Brand', name: 'MelSpectrum' },
    manufacturer: { '@type': 'Organization', name: LEGAL_ZH, url: 'https://melspectrum.com' },
    // 无真实可下单的预售 → 不声明 offers / availability
  }),
};

function Section({ id, island, children, className = '', navTheme }) {
  const root = useRef(null);
  useTextReveal(root);
  useReveal(root);
  return (
    <section id={id} className={`island-${island} p-custom py-section ${className}`.trim()} data-nav-theme={navTheme || (island === 'dark' ? 'dark' : 'light')} ref={root}>
      {children}
    </section>
  );
}

function Gasket() { return <div className="gasket" aria-hidden="true" />; }

/* ------------------------------------------------------------------ */

function Thesis() {
  const { t } = useT();
  const deck = useRef(null);
  useStackDeck(deck);
  const cards = [
    { num: '01 · WRISTS', title: t('省下你的手腕', 'Spare your wrists'), desc: t('一台琴几千次拧弦，不再靠手腕硬扛——电机精准发力，远离腱鞘劳损。', 'Thousands of pin-turns per piano, off your wrists — the motor does the torque, sparing the repetitive strain.') },
    { num: '02 · THROUGHPUT', title: t('调得更快', 'Tune faster'), desc: t('自动闭环逐弦调准、不知疲倦，单台更快，一天能多接几单。', 'Automated closed-loop tuning, tireless and quick — fit more pianos into a day.') },
    { num: '03 · CONSISTENCY', title: t('精度始终如一', 'Precision that holds'), desc: t('机器级一致，不受疲劳与听力状态影响，最难的低音也稳。', 'Machine-consistent — unaffected by fatigue, steady even in the hardest bass.') },
  ];
  return (
    <Section island="light">
      <SectionHead
        eyebrow={t('FOR TUNERS · 为调音师打造', 'FOR TUNERS')}
        title={t('拧弦的体力活，交给电机。', 'Let the motor turn the pins.')}
        sub={t('一个套在弦轴上的精密执行器，配 iPhone App。你把关音色，它替你逐弦精准拧到位——整台 88 键，稳定一致。', 'A precision actuator on the tuning pin, paired with an iPhone app. You guide the result; it turns every pin to pitch — all 88 keys, consistently.')}
      />
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

function Product() {
  const { t, lang } = useT();
  const specs = [
    { k: t('调律精度 / PITCH ACCURACY', 'PITCH ACCURACY'), v: <>±2 {t('音分', '¢')}<Fn /></>, sub: t('自动逐弦，精准稳定', 'Auto, string by string') },
    { k: t('低音分辨率 / BASS', 'BASS RESOLUTION'), v: t('实验室级', 'Lab-grade'), sub: t('最难的低音也稳如教科书', 'Rock-solid even in the deepest bass') },
    { k: t('计算位置 / COMPUTE', 'COMPUTE'), v: t('端侧 · 无需联网', 'On-device · offline'), sub: t('隐私优先，即时响应', 'Privacy-first, instant response') },
    { k: t('健康报告 / REPORT', 'HEALTH REPORT'), v: t('分频段 · 逐键 · 可打印', 'Per-register · per-key · printable') },
    { k: t('麦克风引导 / MIC COACH', 'MIC COACH'), v: t('5 星实时评级', '5-star live meter'), sub: t('零基础也能采到好数据', 'Great data, no experience needed') },
    { k: t('固件升级 / OTA', 'FIRMWARE OTA'), v: t('BLE 无线进化', 'Over BLE'), sub: t('像手机一样不断升级', 'Keeps improving, like your phone') },
    { k: t('状态 / STATUS', 'STATUS'), v: t('硬件研发中 · App 已在 TestFlight', 'Hardware in development · app on TestFlight') },
  ];
  return (
    <Section island="light" id="product">
      <article className="product">
        <div className="product__head">
          <Eyebrow>{t('PRODUCT · 硬件 + APP', 'PRODUCT · HARDWARE + APP')}</Eyebrow>
          <span className="t-ui" style={{ color: 'var(--color-ash)' }}>V2.1 · HARDWARE BRING-UP</span>
        </div>
        <div className="product__body">
          <h2 className="t-h2 reveal-text">{t('一眼看懂', 'The highlights')}</h2>
          <p className="product__lead t-body anim-up--lead">
            {t('把一位调律师的耳朵，装进口袋。实时 Railsback 曲线拟合，让每一根琴弦回到它该在的位置。', "A professional tuner's ear, in your pocket. Real-time Railsback curve fitting brings every string back to where it belongs.")}
          </p>
          <div className="product__actions">
            <BracketLink href={TESTFLIGHT} external>{t('在 TestFlight 体验 App', 'Try the app on TestFlight')}</BracketLink>
            <BracketLink href={href(lang, 'pro')}>{t('了解专业版', 'Explore Pro')}</BracketLink>
          </div>
          <figure className="product__img">
            <img src="/images/product-v20m-still-v1.webp" alt={t('Piano Tuner v20m 执行器渲染图，胡桃木桌面上的拉丝铝机身', 'Piano Tuner v20m actuator render, brushed aluminium body on a walnut surface')} width="1600" height="900" loading="lazy" decoding="async" />
            <figcaption className="t-ui">RENDER · V20M</figcaption>
          </figure>
        </div>
        <div className="product__side">
          <dl className="specs">
            {specs.map((s, i) => (
              <div className="spec" key={i}>
                <dt className="spec__k t-ui">{s.k}</dt>
                <dd className="spec__v anim-up--metric">
                  <span>{s.v}</span>
                  {s.sub ? <span className="spec__sub t-body-sm">{s.sub}</span> : null}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </article>
    </Section>
  );
}

function Steps() {
  const { t } = useT();
  const sec = useRef(null);
  useStepsPath(sec);
  const steps = [
    { num: '01 · INSTALL', title: t('安装与连接', 'Install & connect'), desc: t('套在弦轴上，BLE 稳定连接，OTA 随时更新算法。', 'Attach to the pin, connect over BLE, update algorithms anytime via OTA.'), data: ['BLE', 'OTA'] },
    { num: '02 · CURVE', title: t('本地生成曲线', 'On-device curve'), desc: <>{t('iPhone 本机生成专属 Railsback 曲线，带来 ±2 音分', 'Your iPhone generates a bespoke Railsback curve with a ±2-cent')}<Fn />{t('的心理声学拉伸。', ' psychoacoustic stretch.')}</>, data: ['RAILSBACK', t('端侧 · ON-DEVICE', 'ON-DEVICE')] },
    { num: '03 · CLOSED LOOP', title: t('自动闭环微调', 'Auto closed-loop tuning'), desc: t('空心杯无刷 FOC 电机配行星减速与闭环编码器，运行安静，软启动防扭矩突变。', 'A coreless FOC motor with planetary reduction and a closed-loop encoder — quiet, with soft-start torque protection.'), data: ['FOC', t('软启动 · SOFT-START', 'SOFT-START')] },
  ];
  return (
    <section id="how-it-works" className="island-dark p-custom py-section" data-nav-theme="dark" ref={sec}>
      <SectionHead
        eyebrow={t('HOW IT WORKS · 三步', 'HOW IT WORKS')}
        title={t('将复杂的声学物理，化为极简的 3 步', 'Complex physics. Three simple steps.')}
        sub={t('无需懂乐理。电机出力，数学交给 iPhone。', 'No music theory. The motor lifts; your iPhone does the math.')}
      />
      <div className="steps steps--path">
        <div className="steps__line" data-step-line aria-hidden="true" />
        {steps.map((s) => (
          <article className="step" key={s.num} data-step>
            <span className="card__num t-ui">{s.num}</span>
            <h3 className="t-h3">{s.title}</h3>
            <p className="card__desc t-body-sm">{s.desc}</p>
            <div className="step__data t-ui">{s.data.map((d) => <span key={d}>{d}</span>)}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Engine() {
  const { t } = useT();
  const items = [
    { num: '01', title: t('智能谐波净化', 'Smart harmonic cleansing'), desc: t('智能剔除被锤击声污染的「假泛音」，只信可靠谐波，把玄学低音变成可复现的科学。', 'Rejects hammer-corrupted false partials and trusts only reliable harmonics — turning bass into reproducible science.') },
    { num: '02', title: t('低音超分辨引擎', 'Bass super-resolution'), desc: t('专有超分辨技术实现实验室级低音分辨率，看清每一丝偏差。', 'Proprietary super-resolution delivers lab-grade bass resolution — every fraction of a cent, visible.') },
    { num: '03', title: t('亚音分精修', 'Sub-cent refinement'), desc: t('在不放慢响应速度的前提下，把频率精度再提一个量级——实时与精准，这次都要。', 'Sharpens frequency accuracy by an order of magnitude — without slowing the response. Real-time and precise, at once.') },
    { num: '04', title: t('智能抗噪锁定', 'Smart noise rejection'), desc: t('在嘈杂环境中智能过滤干扰、避开击键瞬间的杂音，只锁定干净信号，吵闹房间里也不乱跳。', "Intelligently filters interference and the hammer's attack noise, locking only on clean signal — no jitter in a noisy room.") },
    { num: '05', title: t('时序一致性引擎', 'Temporal coherence'), desc: t('用历史帧交叉验证每一次读数，过滤单帧跳变，示数稳、不闪烁。', 'Cross-checks each reading against recent frames to filter out single-frame glitches — steady, never flickering.') },
    { num: '06', title: t('谐波锁定门控', 'Harmonic-lock gating'), desc: t('低音区要求多阶谐波同时稳定锁定才推进，从源头杜绝「锁错音」。', 'In the bass, it advances only when multiple harmonics lock together — no false locks.') },
  ];
  return (
    <Section island="dark" id="engine">
      <SectionHead
        eyebrow={t('ACOUSTIC ENGINE · 端侧信号引擎', 'ACOUSTIC ENGINE')}
        title={t('听得比人耳更细，连最难的低音也稳', 'Finer than the human ear — steady even in the hardest bass')}
        sub={t('最难调的低音区，端侧信号引擎替你驯服。', 'The bass is the hardest — an on-device signal engine tames it.')}
      />
      <BeatFigure />
      <div className="steps steps--six">
        {items.map((it) => (
          <article className="step" key={it.num}>
            <span className="card__num t-ui">{it.num}</span>
            <h3 className="t-h3">{it.title}</h3>
            <p className="card__desc t-body-sm">{it.desc}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Software() {
  const { t } = useT();
  return (
    <Section island="light" id="software">
      <article className="product product--media-right">
        <div className="product__head">
          <Eyebrow>{t('SOFTWARE · 软件定义硬件', 'SOFTWARE DEFINED HARDWARE')}</Eyebrow>
          <a className="blink t-ui" href={TESTFLIGHT} target="_blank" rel="noopener noreferrer">TESTFLIGHT ↗</a>
        </div>
        <div className="product__body">
          <h2 className="t-h2 reveal-text">{t('极客级调律终端，掌控每一颗泛音。', 'Geek-level console. Master every partial.')}</h2>
          <p className="product__lead t-body anim-up--lead">
            {t('配套 App 集成实时频谱、动态力矩监测与端侧拉伸引擎，iPad/iPhone 上每个物理细节一目了然。', 'The app brings real-time spectrum, torque monitoring and an on-device stretch engine — every detail visible on iPad or iPhone.')}
          </p>
          <dl className="specs">
            <div className="spec"><dt className="spec__k t-ui">{t('实时声学捕捉 / CAPTURE', 'CAPTURE')}</dt><dd className="spec__v"><span className="spec__sub t-body-sm">{t('iOS 原生硬件加速实现超低延迟频谱分析，嘈杂环境也能稳定锁定音准。', 'iOS-native hardware acceleration delivers ultra-low-latency analysis that locks pitch even in noisy rooms.')}</span></dd></div>
            <div className="spec"><dt className="spec__k t-ui">{t('可视化 Railsback 拟合 / FIT', 'RAILSBACK FIT')}</dt><dd className="spec__v"><span className="spec__sub t-body-sm">{t('端侧优化引擎实时渲染你这台钢琴的专属拉伸曲线，调音告别「玄学」。', "An on-device optimizer renders your piano's own stretch curve in real time — no more guesswork.")}</span></dd></div>
          </dl>
          <div className="product__actions">
            <Button href={TESTFLIGHT} external variant="dark">{t('在 TestFlight 下载 iOS App', 'Get the iOS app on TestFlight')}</Button>
          </div>
        </div>
        <div className="product__side">
          <figure className="product__img product__img--phone">
            <img src="/images/software_preview.webp" alt={t('Piano Tuner iOS App 实时频谱界面', 'Piano Tuner iOS app real-time spectrum view')} width="900" height="1200" loading="lazy" decoding="async" />
            <figcaption className="t-ui">iOS APP · TESTFLIGHT</figcaption>
          </figure>
        </div>
      </article>
    </Section>
  );
}

function Features() {
  const { t } = useT();
  const items = [
    { num: '01 · DRIVE', title: t('工业级动力系统', 'Industrial drive system'), desc: t('空心杯无刷 FOC 电机配行星减速与闭环编码器，运行安静、出力充裕，无惧顽固弦轴。', 'A coreless FOC motor with planetary reduction and a closed-loop encoder — quiet, with torque to spare for the most stubborn pins.') },
    { num: '02 · 88 KEYS', title: t('全音域 88 键剥离', 'Full 88-key isolation'), desc: t('系统支持低音区单弦、中音区双弦、高音区三弦独立剥离引导采样，保证原始声学数据的极端纯净。', 'Guides you to isolate and sample monochord, bichord, and trichord zones independently, ensuring ultimate data purity.') },
    { num: '03 · NODE', title: t('极简执行节点设计', 'Minimalist node design'), desc: t('采用高性价比执行节点，将算力移至手机端侧。极限压缩硬件成本与体积，让专业调音触手可及。', 'Uses a cost-effective execution node, moving computation onto the phone. Drastically reducing hardware cost and size.') },
    { num: '04 · PAIRING', title: t('BLE 安全认证', 'Secure BLE pairing'), desc: t('采用加密配对认证，未经授权的设备无法驱动电机，从源头杜绝误连与恶意操控。', "Encrypted pairing authentication means unauthorized devices can't drive the motor — blocking mis-connections and tampering at the source.") },
    { num: '05 · MEMORY', title: t('钢琴档案记忆「免预采集」', 'Piano memory'), desc: t('系统为每台钢琴记忆其不谐性档案，同一台钢琴二次调音可直接跳过重复的不谐性采集，开机即调。', "Each piano's inharmonicity profile is remembered, so a returning piano skips repeat sampling — start tuning right away.") },
    { num: '06 · OVERTWIST', title: t('过拉自校正', 'Overtwist self-correction'), desc: t('回扳时连续采集 5 次测量取中位数再校正，有效抵消弦轴摩擦带来的回弹误差，锁定目标音高。', 'On overtwist, five measurements are taken and the median drives the correction, canceling the rebound from pin friction to lock onto the target pitch.') },
  ];
  return (
    <Section island="dark" id="features">
      <SectionHead eyebrow={t('FEATURES · 核心优势', 'FEATURES')} title={t('让专业调音更易获得', 'Making pro tuning more accessible')} />
      <div className="steps steps--six">
        {items.map((it) => (
          <article className="step" key={it.num}>
            <span className="card__num t-ui">{it.num}</span>
            <h3 className="t-h3">{it.title}</h3>
            <p className="card__desc t-body-sm">{it.desc}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function BuiltForYou() {
  const { t } = useT();
  const deck = useRef(null);
  useStackDeck(deck);
  const cards = [
    { num: '01 · MIC COACH', title: t('麦克风摆位引导', 'Mic-placement coach'), desc: t('5 星实时评级帮你找到最佳采集位置，零基础也能采到专业级数据。', 'A live 5-star meter guides you to the best spot — pro-grade data, no experience needed.') },
    { num: '02 · HISTORY', title: t('多琴档案 · 历史趋势', 'Multi-piano history'), desc: t('按琴保存档案与误差趋势：琴主看琴变好，调音师多一份随身客户档案。', 'Per-piano profiles and error trends — owners watch it improve, pros get a pocket CRM.') },
    { num: '03 · OPT-IN', title: t('数据飞轮（可选 · 匿名）', 'Data flywheel (opt-in)'), desc: t('授权后匿名贡献数据助算法进化，默认关闭、随时可关。', 'Opt in to share anonymous data and help the algorithm improve — off by default, always optional.') },
  ];
  const privacy = [
    { k: t('端侧本地计算', 'Computed on-device'), v: t('个性化曲线在 iPhone 本机生成，全程无需联网。', 'Your personalized curve is generated on your iPhone — no internet required.') },
    { k: t('匿名 · 默认关闭', 'Anonymous · off by default'), v: t('是否贡献匿名数据完全由你决定，随时可关。', 'Sharing anonymous data is entirely your choice — toggle it off anytime.') },
    { k: t('不卖数据 · 不追踪', 'No selling · no tracking'), v: t('我们从不出售个人数据，也没有第三方广告追踪。', 'We never sell personal data and run no third-party ad tracking.') },
  ];
  return (
    <Section island="light" id="for-you">
      <SectionHead
        eyebrow={t('BUILT FOR YOU · 谁都会用', 'BUILT FOR YOU')}
        title={t('把专业经验，变成谁都会用的体验', "A pro's expertise, made usable by anyone")}
        sub={t('从麦克风怎么放，到每台琴的成长曲线，复杂的事我们替你想好了。', "From where to hold your phone to each piano's progress over time — the hard parts, handled.")}
      />
      <div className="stack-deck" ref={deck}>
        {cards.map((c) => (
          <article className="card" key={c.num} data-stack-card>
            <span className="card__num t-ui">{c.num}</span>
            <h3 className="t-h3">{c.title}</h3>
            <p className="card__desc t-body-sm">{c.desc}</p>
          </article>
        ))}
      </div>
      <div className="privacy">
        <div className="sec-head grid-custom">
          <div className="sec-head__eyebrow"><Eyebrow plain>{t('PRIVACY · 你的数据，留在你手机里', 'PRIVACY')}</Eyebrow></div>
          <h3 className="t-h3 reveal-text">{t('你的数据，留在你手机里', 'Your data stays on your device')}</h3>
          <p className="t-body">{t('调律曲线在本机生成，核心数据无需上云。我们不卖数据、不做广告追踪。', "Your tuning curve is computed on-device — core data never needs the cloud. We don't sell data or run ad tracking.")}</p>
        </div>
        <dl className="specs">
          {privacy.map((p) => (
            <div className="spec" key={p.k}><dt className="spec__k t-ui">{p.k}</dt><dd className="spec__v"><span className="spec__sub t-body-sm">{p.v}</span></dd></div>
          ))}
        </dl>
      </div>
    </Section>
  );
}

function Railsback() {
  const { t, lang } = useT();
  return (
    <Section island="light" id="railsback">
      <article className="product">
        <div className="product__head">
          <Eyebrow>{t('ALGORITHM · 核心算法订阅', 'ALGORITHM SUBSCRIPTION')}</Eyebrow>
          <span className="t-ui" style={{ color: 'var(--color-ash)' }}>{t('即将开放 · COMING SOON', 'COMING SOON')}</span>
        </div>
        <div className="product__body">
          <h2 className="t-h2 reveal-text">{t('个性化 Railsback 优化器', 'Personalized Railsback optimizer')}</h2>
          <p className="product__lead t-body anim-up--lead">
            {t('端侧自研优化引擎根据你琴弦的独特不谐性，拟合出专属的黄金拉伸曲线。', "An on-device optimizer fits a bespoke golden stretch curve to your strings' unique inharmonicity.")}
          </p>
          <p className="t-body-sm" style={{ color: 'var(--color-charcoal)', maxWidth: '48ch' }}>
            {t('基础调音无需任何订阅即可使用。下方个性化曲线服务为可选升级，不影响设备的日常使用。', "Basic tuning works with no subscription. The personalized curve below is an optional upgrade — it doesn't affect everyday use of the device.")}
          </p>
          <dl className="specs">
            <div className="spec"><dt className="spec__k t-ui">{t('年度算法服务包', 'ANNUAL ALGORITHM SERVICE')}</dt><dd className="spec__v">±2 {t('音分', '¢')}<Fn /> {t('采样精度', 'sampling')}</dd></div>
            <div className="spec"><dt className="spec__k t-ui">{t('拟合位置', 'FITTING')}</dt><dd className="spec__v">{t('端侧实时拟合', 'On-device, real time')}</dd></div>
            <div className="spec"><dt className="spec__k t-ui">{t('音域', 'RANGE')}</dt><dd className="spec__v">{t('88 键全音域极致拉伸', 'Full 88-key stretch')}</dd></div>
          </dl>
          <div className="product__actions">
            <BracketLink href={href(lang, 'buy')}>{t('加入候补名单', 'Join the waitlist')}</BracketLink>
            <BracketLink href={href(lang, 'pro')}>{t('了解专业版', 'Explore Pro')}</BracketLink>
          </div>
        </div>
        <div className="product__side">
          <RailsbackFigure />
        </div>
      </article>
    </Section>
  );
}

function Architecture() {
  const { t } = useT();
  const items = [
    { num: '01 · OTA', title: t('OTA 差分更新架构', 'OTA differential update'), desc: t('双分区断电保护，不拆机即可通过蓝牙更新 FOC 驱动逻辑。', 'Dual-bank power-loss-protected OTA updates FOC logic over BLE, no disassembly.'), data: [t('双分区 · DUAL-BANK', 'DUAL-BANK'), t('双向回滚 · ROLLBACK', 'TWO-WAY ROLLBACK')] },
    { num: '02 · STRETCH', title: t('端侧拉伸优化引擎', 'On-device stretch optimizer'), desc: t('自研优化引擎，基于实测不谐性（B 值）在本机毫秒级生成专属拉伸曲线，全程无需联网。', "A proprietary optimizer computes a bespoke stretch curve on-device in milliseconds from each piano's measured inharmonicity (B) — no internet required."), data: ['B-VALUE', t('端侧 · ON-DEVICE', 'ON-DEVICE')] },
    { num: '03 · DRIVE', title: t('FOC 闭环动力单元', 'FOC closed-loop drive'), desc: t('空心杯无刷 FOC 电机配行星减速箱与闭环磁编码器，传动间隙小到听不出来；力矩闭环实时修正，落点稳定、过程安静。', 'A coreless FOC motor with planetary reduction and a closed-loop magnetic encoder — backlash you cannot hear, torque corrected in a closed loop, and a quiet, repeatable landing on pitch.'), data: ['FOC', t('闭环编码器 · ENCODER', 'CLOSED-LOOP ENCODER')] },
  ];
  return (
    <Section island="dark" id="technology">
      <div className="product product--media-left">
        <div className="product__side">
          <figure className="product__img">
            <img src="/images/cutaway.webp" alt={t('Piano Tuner 执行器内部结构剖视渲染', 'Cutaway render of the Piano Tuner actuator')} width="1200" height="900" loading="lazy" decoding="async" />
            <figcaption className="t-ui">RENDER · CUTAWAY</figcaption>
          </figure>
        </div>
        <div className="product__body">
          <SectionHead eyebrow={t('ARCHITECTURE · 底层架构', 'ARCHITECTURE')} title={t('底层架构重塑，让硬件具备灵魂。', 'Rebuilding the core. Hardware with a soul.')} />
          <div className="steps">
            {items.map((s) => (
              <article className="step" key={s.num}>
                <span className="card__num t-ui">{s.num}</span>
                <h3 className="t-h3">{s.title}</h3>
                <p className="card__desc t-body-sm">{s.desc}</p>
                <div className="step__data t-ui">{s.data.map((d) => <span key={d}>{d}</span>)}</div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Comparison() {
  const { t } = useT();
  const rows = [
    [t('进化能力', 'Upgradability'), t('无', 'None'), t('支持 BLE OTA 无线升级', 'BLE OTA updates')],
    [t('调音精度', 'Precision'), t('依赖个人听觉', 'Subjective'), <>±2 {t('音分', '¢')}<Fn /> {t('+ 自然拉伸', '+ natural stretch')}</>],
    [t('扭矩输出', 'Torque'), t('受人力限制', 'Human-limited'), t('工业级闭环动力', 'Industrial closed-loop drive')],
    [t('传动背隙', 'Drive backlash'), t('无此概念', 'N/A'), t('听不出来的传动间隙', 'Backlash you cannot hear')],
    [t('Railsback 曲线', 'Railsback curve'), t('凭经验估算', 'Estimated'), t('端侧实时拟合', 'On-device fitting')],
    [t('专业版扩展 (Pro)', 'Pro tier'), '—', t('专业级低音分析 · PDF 健康报告 · Turbo 加速', 'Pro bass analysis · PDF reports · Turbo speed')],
  ];
  return (
    <Section island="dark" id="compare">
      <SectionHead eyebrow={t('COMPARISON · 为什么选择', 'COMPARISON')} title={t('为什么选择 Piano Tuner？', 'Why Piano Tuner?')} sub={t('比传统调音，更便宜，也更精准。', 'Cheaper than manual tuning — and more precise.')} />
      <div className="tablewrap">
        <table className="cmp">
          <thead>
            <tr>
              <th scope="col" className="t-ui">{t('核心维度', 'DIMENSION')}</th>
              <th scope="col" className="t-ui">{t('传统人工调音', 'MANUAL TUNING')}</th>
              <th scope="col" className="t-ui cmp__hl">PIANO TUNER</th>
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
    </Section>
  );
}

function Roi() {
  const { t } = useT();
  const deck = useRef(null);
  useStackDeck(deck);
  const cards = [
    { num: '01 · PRO TUNER', title: t('我是专业调音师', 'I am a pro tuner'), desc: t('把最耗时、最费腕的粗调交给机器，你专注精修与服务。', 'Let the machine handle the slow, wrist-heavy rough work — you focus on finish and service.'),
      rows: [[t('产能', 'Capacity'), t('一天多接几台琴', 'More pianos per day')], [t('护腕', 'Wrists'), t('告别反复拧楔劳损', 'No repetitive pin-wrenching')], [t('可委派', 'Delegatable'), t('助理 · 学徒也能上手', 'Junior staff can run it')]],
      foot: t('数字化 PDF 报告 → 让你的服务更值钱', 'Digital PDF reports → make your service worth more') },
    { num: '02 · PIANO OWNER', title: t('我是钢琴拥有者', 'I am a piano owner'), desc: t('不必每次都约师傅——需要时自己就能让钢琴回到最佳状态。', 'No need to book a tuner every time — bring your piano back to its best whenever you want.'),
      rows: [[t('自助', 'Self-serve'), t('想调就调，无需预约', 'On demand, no booking')], [t('始终最佳', 'Always in tune'), t('随时维持音准巅峰', 'Peak pitch year-round')], [t('可委派', 'Delegatable'), t('家人也能轻松上手', 'Anyone at home can do it')]],
      foot: t('长期还省去反复上门调音费', 'And it saves repeat call-out fees over time') },
  ];
  return (
    <Section island="light" id="roi">
      <SectionHead eyebrow={t('RETURNS · 三重回报', 'RETURNS')} title={t('一次投入，三重回报：产能 · 护腕 · 可委派', 'One device, three returns: capacity, wrists, delegation')} sub={t('回本靠的不是省调音费——而是你能多接的琴、不再透支的手腕、可以交出去的活。', "The payback isn't saved tuning fees — it's the pianos you can take on, the wrists you stop straining, and the work you can hand off.")} />
      <div className="stack-deck stack-deck--2" ref={deck}>
        {cards.map((c) => (
          <article className="card" key={c.num} data-stack-card>
            <span className="card__num t-ui">{c.num}</span>
            <h3 className="t-h3">{c.title}</h3>
            <p className="card__desc t-body-sm">{c.desc}</p>
            <dl className="specs specs--tight">
              {c.rows.map(([k, v]) => <div className="spec" key={k}><dt className="spec__k t-ui">{k}</dt><dd className="spec__v t-body-sm">{v}</dd></div>)}
            </dl>
            <p className="t-ui card__foot">{c.foot}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Faq() {
  const { t } = useT();
  const items = [
    [t('安全性：它会把我的琴弦弄断吗？', 'Safety: will it break my strings?'), t('断弦防护是我们设计时的第一优先级。StringGuard 张力保护系统持续监测扭矩与音高，一旦张力异常即刻断电、反向卸力；连接中断时电机同样立即停止。多重相互独立的保护机制互为兜底，任何一层失效都不会让电机继续加力。', 'String protection is our first design priority. StringGuard continuously monitors torque and pitch, cutting power and backing the load off the moment tension looks wrong; the motor also stops if the link drops. Several independent safeguards back each other up, so no single failure lets the motor keep pulling.')],
    [t('精度：调出来的音准真的比人工准吗？', 'Precision: is it more accurate than a human?'), <>{t('端侧实时计算（iOS 原生硬件加速）的 Railsback 曲线稳定调准至 ±2 音分', 'An on-device Railsback curve (iOS-native acceleration) tunes to ±2 cents')}<Fn />{t('，并按每台琴的弦张力优化拉伸，达到音乐厅级和谐度。', ' and optimizes stretch per piano for concert-hall harmony.')}</>],
    [t('适配性：我的钢琴可以用吗？', 'Compatibility: will it work on my piano?'), t('Piano Tuner 采用了通用六角接头设计，兼容绝大多数立式与三角钢琴。只要您的钢琴弦轴是标准的，我们的机器就能良好适配。', 'The universal hexagonal head is compatible with most uprights and grands. If your tuning pins are standard, it works.')],
    [t('手机系统：我用 Android 可以吗？', 'Phone OS: does it work on Android?'), t('目前 App 仅支持 iPhone（iOS）。Android 版本在规划中，上线时间待定，确定后会在这里公布。', "The app currently supports iPhone (iOS) only. An Android version is planned; we have not set a launch date yet, and we'll announce it here once we do.")],
    [t('我有好几台钢琴，需要买几台设备？', 'I have several pianos — how many devices do I need?'), t('一台就够。设备是便携的——逐弦移动、调完即可取下带走，不会常驻在琴上。App 会为每台钢琴单独保存档案，无论你有一台还是几十台。', "Just one. The device is portable — you move it pin to pin and take it off when done; it doesn't stay attached. The app keeps a separate profile for each piano, whether you have one or dozens.")],
    [t('硬件还没到，现在下载 App 能做什么？', 'What can the app do before the hardware arrives?'), t('现在下载即可把 iPhone 当作专业调音表与实时频谱分析仪——端侧实时分析音准、生成你这台琴的拉伸曲线。硬件到货后，同一个 App 无缝升级为自动调音。', 'Download it now to use your iPhone as a pro tuning meter and real-time spectrum analyzer — on-device pitch analysis and a stretch curve for your piano. When the hardware arrives, the same app upgrades seamlessly to automatic tuning.')],
    [t('操作难度：我完全不会调律也能上手吗？', 'Ease of use: can I use it without experience?'), t('完全可以。套在弦轴上、拨动琴弦，App 自动识别音高并驱动电机到位，无需任何乐理或调律经验。', 'Absolutely. Just attach the device and pluck the string; the system handles the rest. No music theory required.')],
    [t('调一台钢琴需要多久？', 'How long does it take to tune a piano?'), t('首次完整调音约 30–45 分钟（88 键全覆盖）；之后的微调模式约 10–15 分钟，系统会自动跳过已达标的琴键。全程自动闭环，无需你一直盯着。', "A first full tuning takes about 30–45 minutes (all 88 keys); later touch-ups take about 10–15 minutes, as the system skips keys already in spec. It runs as an automated closed loop — you don't have to watch it the whole time.")],
    [t('售后：如果遇到软件更新或硬件问题怎么办？', 'Support: what about software or hardware issues?'), t('我们提供 OTA 在线固件升级。随着我们算法的不断进化，您的机器会越来越智能。硬件方面，我们提供一年质保和长期的技术支持。', 'We provide OTA updates for continuous software evolution, plus a one-year warranty and long-term hardware support.')],
  ];
  return (
    <Section island="light" id="faq">
      <SectionHead eyebrow={t('FAQ · 常见问题', 'FAQ')} title={t('常见问题解答', 'Frequently asked questions')} sub={t('安全、精度、适配，逐一说清。', 'Safety, precision, compatibility — answered.')} />
      <div className="faq">
        {items.map(([q, a], i) => (
          <details className="faq__item" key={i}>
            <summary className="faq__q">
              <span className="t-ui faq__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="t-h3 faq__title">{q}</span>
              <span className="faq__plus" aria-hidden="true">+</span>
            </summary>
            <p className="faq__a t-body">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Roadmap() {
  const { t } = useT();
  const items = [
    { v: 'V1.0', label: t('THE GENESIS', 'THE GENESIS'), title: t('基础音准检测与原型验证', 'Basic detection & proof of concept'), desc: t('验证「算法 + 电机」替代人工的可行性：基础频域分析、第一代手工 PCB、步进电机闭环测试。', 'Validated "algorithm + motor": basic frequency analysis, first handmade PCB, stepper closed-loop test.'), obs: t('已完成', 'DONE') },
    { v: 'V2.0', label: t('EVOLVED STAGE', 'EVOLVED STAGE'), title: t('OTA 集成与算法平滑化', 'OTA integration & smooth logic'), desc: <>{t('2026 年 3 月引入 BLE OTA，并重构端侧曲线模块，加入 ±2 音分', 'March 2026: added BLE OTA and rebuilt the on-device curve module with a ±2-cent')}<Fn />{t('的心理声学拉伸与相邻音自然过渡。', ' psychoacoustic stretch and smoother note transitions.')}</>, obs: '2026-03' },
    { v: 'V2.1', label: t('HARDWARE BRING-UP · NOW', 'HARDWARE BRING-UP · NOW'), title: t('从样机走向可量产的一版', 'From prototype to a buildable machine'), desc: t('2026 年 7–8 月，V2.1 首板完成动力级带载上电；BLE OTA 完成端到端升级与双向回滚验证；新一代反扭矩握持结构定型；建成硬件在环（HIL）测试台，把「为什么会跑音」测成可复现的数据；弦轴接口完成真实试配验证。', 'July–August 2026: the first V2.1 board came up under load; BLE OTA was verified end-to-end, including rollback in both directions; a new anti-torque grip structure was locked in; a hardware-in-the-loop test bench now turns "why it drifts" into reproducible data; and the tuning-pin interface passed a fit test on a real pin.'), obs: '2026-07 → 08', active: true },
  ];
  return (
    <Section island="dark" id="roadmap">
      <SectionHead eyebrow={t('ROADMAP · 硬核迭代', 'ROADMAP')} title={t('硬核进化的足迹', 'Evolution roadmap')} />
      <div className="net__metrics roadmap">
        {items.map((it) => (
          <article className={`metric${it.active ? ' metric--active' : ''}`} key={it.v}>
            <span className="metric__label t-ui">{it.label}</span>
            <span className="t-metric metric__value anim-up--metric"><Scramble>{it.v}</Scramble></span>
            <h3 className="t-h3">{it.title}</h3>
            <p className="card__desc t-body-sm">{it.desc}</p>
            <span className="metric__obs t-ui">{it.obs}</span>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Cta() {
  const { t, lang } = useT();
  const root = useRef(null);
  useTextReveal(root);
  useReveal(root);
  return (
    <section id="join" className="island-accent p-custom py-section" data-nav-theme="light" ref={root}>
      <div className="sec-head grid-custom">
        <div className="sec-head__eyebrow"><Eyebrow inverse>{t('GET STARTED · 现在就能上手', 'GET STARTED')}</Eyebrow></div>
        <h2 className="t-h2 reveal-text" style={{ gridColumn: '1 / -1' }}>{t('让你的钢琴，回到巅峰状态', 'Bring your piano back to its peak')}</h2>
        <p className="t-body" style={{ gridColumn: '1 / -1', maxWidth: '56ch' }}>
          {t('App 已在 TestFlight 开放——现在就能把 iPhone 当作专业调音表与实时频谱分析仪；硬件预售即将开始。第一时间收到开售通知，或现在就下载 App 试用。', 'The app is live on TestFlight — use your iPhone as a pro tuning meter and real-time spectrum analyzer today; hardware pre-orders open soon. Be first to know when it ships, or try the app now.')}
        </p>
      </div>
      <div className="cta__grid">
        <SubscribeForm source="index-bottom" />
        <div className="cta__links">
          <Button href={TESTFLIGHT} external variant="dark">{t('下载 App 抢先体验', 'Download the app')}</Button>
          <BracketLink href={href(lang, 'buy')} className="blink--onaccent">{t('预售与候补名单', 'Pre-order & waitlist')}</BracketLink>
          <BracketLink href={href(lang, 'pro')} className="blink--onaccent">{t('了解专业版', 'Explore Pro')}</BracketLink>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

export default function Home() {
  const { t, lang } = useT();
  const MARQUEE = ['RAILSBACK CURVE', 'STRINGGUARD', '88 KEYS', 'BLE OTA', 'ON-DEVICE', 'IOS TESTFLIGHT', 'FOC CLOSED-LOOP', 'MELSPECTRUM'];
  return (
    <Shell page="index" navTheme="dark">
      <Hero
        eyebrow={t('AUTOMATIC PIANO TUNER · 为调音师打造', 'AUTOMATIC PIANO TUNER · BUILT FOR TUNERS')}
        l1={t('让每次弹奏', 'Keep every keystroke')}
        l2={t('都精准如初', 'perfectly in tune')}
        sub={t('让整台钢琴，回到出厂般的精准——自动、稳定、可进化。', 'Bring your whole piano back to factory-fresh precision — automatic, steady, ever-evolving.')}
        proof={t('为专业调音师与钢琴爱好者打造。', 'Built for pro tuners and piano lovers.')}
        poster="/assets/video/hero-v20m-poster-v2.webp"
        mp4="/assets/video/hero-v20m-v2.mp4"
        primary={<BracketLink href={TESTFLIGHT} external highlight>{t('下载 App 抢先体验', 'Download the app')}</BracketLink>}
        secondary={<BracketLink href={href(lang, 'buy')}>{t('预售与候补名单', 'Pre-order & waitlist')}</BracketLink>}
      />
      <Gasket />
      <Thesis />
      <Marquee items={MARQUEE} />
      <Product />
      <Gasket />
      <Steps />
      <Engine />
      <Software />
      <Gasket />
      <Features />
      <BuiltForYou />
      <Railsback />
      <Gasket />
      <Architecture />
      <Comparison />
      <Roi />
      <Faq />
      <Gasket />
      <Roadmap />
      <Cta />
      <Gasket />
      <PrecisionNote />
    </Shell>
  );
}
