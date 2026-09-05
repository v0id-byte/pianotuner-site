import { useRef } from 'react';
import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import Shell from '../../components/Shell';
import PageHero from '../../components/PageHero';
import PrecisionNote from '../../components/PrecisionNote';
import { BracketLink, Fn, SectionHead } from '../../components/ui';
import { useTextReveal, useReveal } from '../../lib/motion/hooks';
import { EMAIL_REPORT } from '../../data/site';

export const meta = {
  navTheme: 'dark',
  zh: { title: 'Piano Tuner | 帮助与支持中心', desc: 'Piano Tuner 帮助与支持：快速上手指南、常见问题、固件更新、供电、适配机型与技术支持。' },
  en: { title: 'Piano Tuner | Support Center', desc: 'Piano Tuner support: quick-start guide, FAQs, firmware updates, power, compatibility and technical support.' },
  jsonLd: (lang, { self }) => ({ '@context': 'https://schema.org', '@type': 'WebPage', url: self, name: lang === 'en' ? 'Piano Tuner Support Center' : 'Piano Tuner 帮助与支持中心' }),
};

export default function Support() {
  const { t, lang } = useT();
  const root = useRef(null);
  useTextReveal(root);
  useReveal(root);
  const steps = [
    { num: '01 · ASSEMBLY', title: t('硬件组装', 'Assembly'), desc: t('将调音套筒安装至设备前端输出轴，并将人体工程学侧手柄旋入机身中部的安装接口。', 'Attach the tuning socket and screw in the ergonomic side handle.') },
    { num: '02 · CONNECT', title: t('下载并连接 App', 'Connect the app'), desc: t('扫描产品包装内的二维码下载官方 App。开启手机蓝牙，并在 App 内选择您的设备进行配对。', 'Scan the QR code to download the app. Enable Bluetooth and pair your device.') },
    { num: '03 · TUNE', title: t('开始首次调音', 'Start tuning'), desc: t('将设备套在钢琴的调音钉上，确保卡合稳固。根据 App 提示开始自动调律。注意：请务必双手握持，以对抗强大的反向扭矩。', 'Place the device on a tuning pin. Follow the app instructions. WARNING: always use both hands to counteract the high torque.') },
  ];
  const faq = [
    [t('高扭矩输出安全吗？我该如何正确握持？', 'Is the high torque output safe? How should I hold it?'), t('本设备具备工业级高扭矩输出。为了您的安全和调音精度，务必使用包装内附带的人体工程学侧手柄。请用主手握住带有防滑蒙皮的机身，另一只手紧握侧手柄，以双手形成的合力稳定对抗反向扭矩。', 'The device delivers industrial-grade torque. For your safety and tuning accuracy, always use the included ergonomic side handle. Hold the grip-coated body with your main hand and the side handle with the other, using both hands together to steadily counteract the reaction force.')],
    [t('固件如何更新？', 'How do I update the firmware?'), t('我们通过蓝牙（BLE）提供 OTA 固件升级。当有新固件发布时，您将在 App 内收到推送，根据提示即可一键完成升级，让您的设备不断进化。', "We provide OTA firmware updates via Bluetooth (BLE). When a new firmware is released, you'll be notified in the app and can update with one tap.")],
    [t('安全性：它会把我的琴弦弄断吗？', 'Safety: will it break my strings?'), t('Piano Tuner 内置 StringGuard 张力保护系统，弦张力异常时自动触发熔断保护，多重张力保护，最大限度降低断弦风险。', 'Piano Tuner includes the StringGuard tension protection system, which automatically triggers a cut-off when string tension is abnormal — multiple tension safeguards to minimize string-break risk.')],
    [t('调音一次需要多长时间？', 'How long does one tuning take?'), t('首次完整调音约需 30–45 分钟（88 键全部覆盖）。后续微调模式下仅需 10–15 分钟。系统会智能跳过已达标的键位，只对偏差超标区域执行微调。', 'A first full tuning takes about 30–45 minutes (all 88 keys). Subsequent touch-up mode takes only 10–15 minutes. The system intelligently skips keys already in spec and fine-tunes only the out-of-tolerance ranges.')],
    [t('支持哪些钢琴型号？', 'Which pianos are supported?'), t('支持绝大多数标准 88 键立式钢琴和三角钢琴。系统在你的 iPhone 上端侧完成采样与适配，无需联网。', 'Compatible with most standard 88-key upright and grand pianos. Sampling and adaptation run on-device on your iPhone — no internet required.')],
    [t('支持 Android 手机吗？', 'Does it support Android phones?'), t('目前 App 仅支持 iPhone（iOS）。Android 版本在规划中，上线时间待定，确定后会在这里公布。', "The app currently supports iPhone (iOS) only. An Android version is planned; we have not set a launch date yet, and we'll announce it here once we do.")],
    [t('供电方式是什么？', 'How is it powered?'), t('整机不内置锂电池，使用可更换的工业电池包（兼容大艺 / 牧田平台）供电。这一设计确保了长时间调音过程中的稳定功率输出，电机驱动全程不掉速，适合专业调律师和连续使用场景。', 'There is no built-in lithium battery; the tool runs on swappable industrial battery packs (compatible with the DaYi / Makita platforms). This keeps power output stable through long tuning sessions with no motor slowdown — ideal for professional tuners and continuous use.')],
    [t('Pro 版和标准版有什么区别？', "What's the difference between Pro and Standard?"), <>{t('两者的调音精度一致（±2 音分', 'Both work to the same ±2-cent')}<Fn />{t('）。Pro 版解锁的是 Turbo 高速模式、高阶 FFT 泛音分析、多琴历史记录追踪，以及钢琴健康报告生成功能。', ' tuning accuracy. What Pro adds is Turbo high-speed mode, advanced FFT overtone analysis, multi-piano history tracking, and piano health reports.')}</>],
    [t('什么是无线升级（OTA）？', 'What are wireless (OTA) updates?'), t('无线升级是 Piano Tuner 的无线固件升级功能。通过低功耗蓝牙（BLE），用户可以在 iOS App 内一键接收最新的电机驱动参数、声学采样算法和云端优化模型，无需返厂，硬件持续进化。', "Wireless updates are Piano Tuner's over-the-air firmware upgrades. Via Bluetooth Low Energy (BLE), you can receive the latest motor-drive parameters, acoustic sampling algorithms, and cloud optimization models with one tap in the iOS app — no return to factory, and the hardware keeps evolving.")],
    [t('如何保证在嘈杂环境下也能准确拾音？', 'How does it pick up sound accurately in noisy environments?'), t('系统采用智能环境降噪双重处理。Pro 版本额外支持 iOS 端实时音频处理，可有效过滤环境噪声，嘈杂环境下依然保持高精度。', 'The system uses dual-stage smart noise reduction. Pro additionally supports real-time audio processing on iOS to filter out ambient noise, maintaining high accuracy even in noisy environments.')],
    [t('对钢琴年份有限制吗？', "Are there limits on the piano's age?"), t('建议钢琴出厂 5 年以上。对于新琴（< 1 年），弦轴张力尚在稳定期，调律师通常建议等待张力稳定后再进行精细调音。Piano Tuner 的微调策略也会自动适配新琴特性。', "We recommend pianos at least 5 years old. For new pianos (< 1 year), pin tension is still settling, and tuners usually suggest waiting before fine tuning. Piano Tuner's touch-up strategy also auto-adapts to new-piano characteristics.")],
    [t('在信号差的地方能正常使用吗？', 'Can I use it where signal is poor?'), t('调音核心完全在本地（iOS 端）运行，不依赖网络——包括个性化拉伸曲线的拟合。云端只用于多琴档案同步、健康报告与固件更新，信号恢复后自动同步，且都是可选的。', 'The tuning core runs entirely on-device on iOS, with no network dependency — including fitting your personalized stretch curve. The cloud is used only for multi-piano archive sync, health reports, and firmware updates; it syncs when signal returns, and all of it is optional.')],
  ];
  const videos = [t('开箱与首次组装', 'Unboxing & assembly'), t('App 全功能详解', 'Full app walkthrough'), t('人体工程学手柄的正确用法', 'Using the ergonomic handle')];
  return (
    <Shell page="support" navTheme="dark">
      <PageHero
        eyebrow={t('SUPPORT · 帮助与支持', 'SUPPORT')}
        l1={t('帮助与支持中心', 'Support center')}
        sub={t('使用指南、常见问题与技术支持。', 'Guides, FAQs, and technical support.')}
        actions={<BracketLink href={`mailto:${EMAIL_REPORT}`} highlight>{t('写邮件给支持团队', 'Email support')}</BracketLink>}
      />
      <section className="island-light p-custom py-section" data-nav-theme="light" ref={root}>
        <SectionHead eyebrow={t('QUICK START · 快速上手', 'QUICK START')} title={t('快速上手指南', 'Quick-start guide')} />
        <div className="steps">
          {steps.map((s) => (
            <article className="step" key={s.num}>
              <span className="card__num t-ui">{s.num}</span>
              <h3 className="t-h3">{s.title}</h3>
              <p className="card__desc t-body-sm">{s.desc}</p>
            </article>
          ))}
        </div>
        <div style={{ marginTop: 'var(--gap-y-lg)' }}>
          <SectionHead eyebrow={t('FAQ · 常见问题', 'FAQ')} title={t('常见问题解答', 'Frequently asked questions')} />
          <div className="faq">
            {faq.map(([q, a], i) => (
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
        </div>
      </section>
      <div className="gasket" aria-hidden="true" />
      <section className="island-dark p-custom py-section" data-nav-theme="dark">
        <SectionHead eyebrow={t('VIDEO · 视频教程库', 'VIDEO TUTORIALS')} title={t('视频教程库', 'Video tutorials')} sub={t('制作中，敬请期待。', 'In production — stay tuned.')} />
        <div className="stack-deck">
          {videos.map((v, i) => (
            <article className="card" key={v}>
              <span className="card__num t-ui">{String(i + 1).padStart(2, '0')} · {t('即将上线', 'COMING SOON')}</span>
              <div className="mono-block" aria-hidden="true">{String(i + 1).padStart(2, '0')}</div>
              <h3 className="t-h3">{v}</h3>
            </article>
          ))}
        </div>
        <div className="product__actions" style={{ marginTop: 'var(--gap-y-md)' }}>
          <BracketLink href={href(lang, 'index', 'faq')}>{t('产品页常见问题', 'Product FAQ')}</BracketLink>
          <BracketLink href={href(lang, 'contact')}>{t('联系我们', 'Contact us')}</BracketLink>
        </div>
      </section>
      <PrecisionNote ip={false} />
    </Shell>
  );
}
