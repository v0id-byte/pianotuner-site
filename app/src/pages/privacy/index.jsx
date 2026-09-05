import { useT } from '../../i18n';
import LegalPage from '../../components/LegalPage';
import { EMAIL_SUPPORT } from '../../data/site';

export const meta = {
  navTheme: 'dark',
  zh: { title: '隐私政策 | Piano Tuner', desc: 'Piano Tuner 隐私政策 — 麦克风仅用于本地音高检测，蓝牙仅用于连接调音硬件，遥测与算法改进数据均为可选授权。' },
  en: { title: 'Privacy Policy | Piano Tuner', desc: 'Privacy Policy for the Piano Tuner app and tuning robot — microphone used only for on-device pitch detection, Bluetooth only to connect the hardware, telemetry and algorithm-improvement data strictly opt-in.' },
  jsonLd: (lang, { self }) => ({ '@context': 'https://schema.org', '@type': 'WebPage', url: self, name: lang === 'en' ? 'Privacy Policy' : '隐私政策' }),
};

export default function Privacy() {
  const { t } = useT();
  const P = ({ children }) => <p className="t-body">{children}</p>;
  const H = ({ children }) => <h3 className="t-ui" style={{ margin: '14px 0 6px', color: 'var(--color-ash)' }}>{children}</h3>;
  const sections = [
    { title: t('我们收集哪些信息', 'What we collect'), body: <>
      <H>{t('麦克风（音频）', 'MICROPHONE (AUDIO)')}</H>
      <P>{t('本产品需要访问麦克风，仅用于在您的设备上实时检测琴弦音高。音频流被实时分析后即丢弃，不会被录制、保存或上传。我们只处理从音频中提取的频率信息，不会留存任何录音。', 'The Product requests microphone access solely to detect string pitch in real time, on your device. The audio stream is analyzed live and then discarded — it is never recorded, stored, or uploaded. We only work with the frequency information derived from the sound; no recordings are kept.')}</P>
      <H>{t('蓝牙（BLE）', 'BLUETOOTH (BLE)')}</H>
      <P>{t('我们使用低功耗蓝牙仅为连接调音硬件设备。连接过程中涉及的设备标识符仅用于建立和维持与硬件的连接，不用于追踪您或在不同应用间识别您。', 'We use Bluetooth Low Energy only to connect to the tuning hardware. Any device identifiers involved are used purely to establish and maintain the connection to the hardware, and are not used to track you or identify you across apps.')}</P>
      <H>{t('钢琴档案', 'PIANO PROFILES')}</H>
      <P>{t('您可以为每台钢琴创建档案（品牌、型号、昵称等）。这些信息由您手动输入并保存，用于区分和复用不同钢琴的调音设置。', 'You may create a profile for each piano (brand, model, nickname, etc.). This information is entered by you and stored to help distinguish pianos and reuse their tuning settings.')}</P>
      <H>{t('钢琴测量数据', 'PIANO MEASUREMENT DATA')}</H>
      <P>{t('为生成专属调律曲线，本产品会采集您钢琴的声学测量数据（如各音的不谐和度、泛音结构等）。这类数据关联到对应的钢琴档案 / 设备 ID，不与您的个人身份相关联。', 'To generate a personalized tuning curve, the Product collects acoustic measurements of your piano (such as inharmonicity and harmonic structure per note). This data is associated with the relevant piano profile / device ID and is not linked to your personal identity.')}</P>
      <H>{t('可选：匿名遥测', 'OPTIONAL: ANONYMOUS TELEMETRY')}</H>
      <P>{t('如果您在应用内主动选择开启（默认关闭），我们会收集匿名的诊断与使用事件，帮助我们发现问题、改进产品。您可以随时在设置中关闭它。', 'If you opt in within the app (off by default), we collect anonymous diagnostic and usage events to help us find problems and improve the Product. You can turn this off at any time in settings.')}</P>
      <H>{t('可选：协助改进调音算法', 'OPTIONAL: HELP IMPROVE THE TUNING ALGORITHM')}</H>
      <P>{t('如果您主动同意（需单独授权，默认关闭），您可以贡献匿名化的声学测量数据（如不谐和度 / 泛音）与调音结果，用于改进我们的调律算法。此类数据不包含任何个人身份信息。', 'If you choose to contribute (a separate opt-in, off by default), you may share anonymized acoustic measurements (such as inharmonicity / harmonics) and tuning results to help improve our tuning algorithm. This data contains no personal identity information.')}</P>
    </> },
    { title: t('我们如何使用信息', 'How we use information'), body: <ul className="t-body">
      <li>{t('实时检测音高并驱动调音硬件完成调律。', 'Detect pitch in real time and drive the tuning hardware.')}</li>
      <li>{t('基于您钢琴的测量数据，计算专属的个性化调律曲线，并记录一次调音会话的进度。', "Compute a personalized tuning curve from your piano's measurements and track the progress of a tuning session.")}</li>
      <li>{t('保存并复用钢琴档案，让下一次调音更省事。', 'Save and reuse piano profiles to make the next tuning faster.')}</li>
      <li>{t('（仅在您授权时）通过匿名遥测排查问题、改进体验。', '(Only if you opt in) Diagnose issues and improve the experience via anonymous telemetry.')}</li>
      <li>{t('（仅在您授权时）用匿名声学数据改进调律算法。', '(Only if you opt in) Improve our tuning algorithm using anonymized acoustic data.')}</li>
    </ul> },
    { title: t('云端服务', 'Cloud service'), body: <P>{t('个性化调律曲线在您的设备本机计算，基础调音全程不依赖网络。云端服务（api.pianotuner.top）只用于这些可选功能：多台钢琴的档案同步、健康报告生成，以及固件更新。为此上传的测量数据关联到钢琴档案 / ID，而非您的个人身份。除此处所述用途外，我们不会将其用于其他目的。', 'Your personalized tuning curve is computed on your device, and basic tuning works with no network connection at all. Our cloud service (api.pianotuner.top) is used only for optional features: syncing profiles across multiple pianos, generating health reports, and firmware updates. Measurement data uploaded for those purposes is associated with a piano profile / ID, not your personal identity. We do not use it for purposes other than those described here.')}</P> },
    { title: t('信息共享', 'Sharing'), body: <>
      <P>{t('我们不出售您的个人数据，也不进行第三方广告追踪。', 'We do not sell your personal data, and we do not use third-party advertising trackers.')}</P>
      <P>{t('我们仅在以下情形共享信息：为运行上述云端服务所必需的技术服务商（在我们的指示下处理数据）；或法律法规要求时。除此之外，我们不会向任何第三方披露您的数据。', 'We share information only where necessary: with technical service providers required to operate the cloud service described above (processing data under our instructions), or when required by law. We do not otherwise disclose your data to any third party.')}</P>
    </> },
    { title: t('存储与安全', 'Storage & security'), body: <P>{t('调律曲线的计算与钢琴档案、本地设置都保存在您的设备上。为上述可选功能发送至云端的数据通过加密传输，并仅在为您提供调律功能所需的范围内保留。我们采取合理的技术与组织措施保护数据，但请注意，任何通过互联网传输或存储的方式都无法做到绝对安全。', 'Curve computation, piano profiles and local settings all stay on your device. Data sent to the cloud for the optional features above is transmitted over encrypted connections and retained only to the extent needed to provide the tuning features. We apply reasonable technical and organizational safeguards, but please note that no method of transmission or storage over the internet is perfectly secure.')}</P> },
    { title: t('您的选择与权利', 'Your choices & rights'), body: <>
      <P>{t('授权控制：麦克风与蓝牙权限可在系统设置中随时撤销；匿名遥测与算法改进数据均为可选，可在应用内随时关闭。', 'Permission control: Microphone and Bluetooth access can be revoked anytime in system settings; anonymous telemetry and algorithm-improvement contributions are optional and can be switched off in the app at any time.')}</P>
      <P>{t('访问、更正与删除：您可以查看或修改您输入的钢琴档案。如需访问、更正或删除与您相关的数据，请通过下方邮箱联系我们。', 'Access, correction & deletion: You can view or edit the piano profiles you entered. To access, correct, or delete data relating to you, contact us at the email below.')}</P>
    </> },
    { title: t('儿童', 'Children'), body: <P>{t('本产品不面向儿童设计，也不会有意收集儿童的个人信息。', 'The Product is not directed at children, and we do not knowingly collect personal information from children.')}</P> },
    { title: t('政策变更', 'Changes to this policy'), body: <P>{t('我们可能会不时更新本隐私政策。重大变更将通过应用内或本页面公示，并更新顶部的「最后更新」日期。继续使用本产品即表示您接受更新后的政策。', 'We may update this Privacy Policy from time to time. Material changes will be posted in the app or on this page, with the "Last updated" date above revised accordingly. Continued use of the Product means you accept the updated policy.')}</P> },
    { title: t('联系我们', 'Contact us'), body: <P>{t('如对本隐私政策有任何疑问，或希望行使您的权利，请联系：', 'For any questions about this Privacy Policy, or to exercise your rights, contact us at: ')}<a className="literal" href={`mailto:${EMAIL_SUPPORT}`}>{EMAIL_SUPPORT}</a></P> },
  ];
  return (
    <LegalPage
      page="privacy"
      kicker={t('LEGAL · 法律条款', 'LEGAL')}
      title={t('隐私政策', 'Privacy policy')}
      updated={t('最后更新：2026 年 8 月 29 日', 'Last updated: August 29, 2026')}
      intro={t('本隐私政策说明融谱智能科技（深圳）有限公司（品牌 MelSpectrum / Piano Tuner，以下简称「我们」）在您使用 Piano Tuner 调音机器人及配套 iOS 应用（以下统称「本产品」）时，如何收集、使用和保护信息。我们坚持数据最小化原则：绝大多数处理都在您的设备本地完成，仅在为您提供功能所必需时才将数据上传至云端。', 'This Privacy Policy explains how 融谱智能科技（深圳）有限公司, operating under the MelSpectrum brand (Piano Tuner; "we", "us") collects, uses, and protects information when you use the Piano Tuner tuning robot and its companion iOS app (together, the "Product"). We follow a data-minimization principle: most processing happens locally on your device, and we upload data to the cloud only when it is necessary to deliver a feature you use.')}
      sections={sections}
    />
  );
}
