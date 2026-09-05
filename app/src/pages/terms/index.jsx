import { useT } from '../../i18n';
import LegalPage from '../../components/LegalPage';
import { EMAIL_SUPPORT } from '../../data/site';

export const meta = {
  navTheme: 'dark',
  zh: { title: '服务条款 | Piano Tuner', desc: 'Piano Tuner 服务条款 — 应用使用许可、硬件使用与安全须知、一年质保、软件「按现状」提供、知识产权、责任限制及适用法律。' },
  en: { title: 'Terms of Service | Piano Tuner', desc: 'Piano Tuner terms of service: app license, hardware use and safety, one-year warranty, software "as is", intellectual property, liability, governing law.' },
  jsonLd: (lang, { self }) => ({ '@context': 'https://schema.org', '@type': 'WebPage', url: self, name: lang === 'en' ? 'Terms of Service' : '服务条款' }),
};

export default function Terms() {
  const { t } = useT();
  const P = ({ children }) => <p className="t-body">{children}</p>;
  const sections = [
    { title: t('接受条款', 'Acceptance of terms'), body: <P>{t('当您下载、安装或使用本产品时，即表示您已阅读、理解并同意接受本条款。如果您不同意本条款的任何内容，请勿使用本产品。', 'By downloading, installing, or using the Product, you confirm that you have read, understood, and agree to be bound by these Terms. If you do not agree to any part of them, please do not use the Product.')}</P> },
    { title: t('应用使用许可', 'License to use the app'), body: <P>{t('在您遵守本条款的前提下，我们授予您一项有限的、非独占、不可转让、可撤销的许可，仅供您为个人或内部业务目的，配合本产品硬件使用配套应用。您不得对应用进行出租、转售、反向工程、反编译或试图提取其源代码，除非相关法律明确允许。', 'Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the companion app together with the Product hardware, for your personal or internal business purposes only. You may not rent, resell, reverse-engineer, decompile, or attempt to extract the source code of the app, except where such restriction is prohibited by applicable law.')}</P> },
    { title: t('硬件使用与安全须知', 'Hardware use & safety'), body: <>
      <P>{t('重要：本设备会对钢琴弦轴施加高扭矩。使用前请务必完整阅读并严格遵守随附的安全说明与应用内指引。', 'Important: this device applies high torque to tuning pins. Always read and strictly follow the safety instructions provided with the device and the in-app guidance before use.')}</P>
      <ul className="t-body">
        <li>{t('请仅将本设备用于其设计用途——即调节标准钢琴弦轴；不得用于任何其他用途。', 'Use the device only for its intended purpose — adjusting standard piano tuning pins — and for nothing else.')}</li>
        <li>{t('使用过程中请保持对设备的关注与控制，避免在无人看管的情况下运行。', 'Stay attentive and in control during use; do not leave the device running unattended.')}</li>
        <li>{t('请将设备放置在儿童及未受过相关使用培训人员无法触及之处。', 'Keep the device out of reach of children and anyone untrained in its use.')}</li>
        <li>{t('如发现弦轴异常、生锈、松动或琴弦存在损伤迹象，请停止使用并咨询专业人士。', 'Stop and consult a professional if you notice abnormal, rusted, or loose pins, or any sign of string damage.')}</li>
        <li>{t('误用、违反安全说明的使用，或在无人看管情况下的使用，所产生的风险与后果由您自行承担。', 'Misuse, use contrary to the safety instructions, or unsupervised use is at your own risk.')}</li>
      </ul>
    </> },
    { title: t('硬件质保', 'Hardware warranty'), body: <P>{t('我们为本产品硬件提供自购买之日起一年的有限质保，保证其在正常使用下无材料及工艺缺陷。质保不涵盖因误用、意外、未经授权的拆解或改装、违反安全说明的操作，或正常磨损所导致的损坏。质保期内的有效索赔，我们将自行选择对产品进行维修或更换。', 'We provide a limited one-year warranty for the Product hardware from the date of purchase, against defects in materials and workmanship under normal use. The warranty does not cover damage caused by misuse, accident, unauthorized disassembly or modification, operation contrary to the safety instructions, or normal wear and tear. For a valid claim within the warranty period, we will, at our option, repair or replace the Product.')}</P> },
    { title: t('软件「按现状」提供与 OTA 更新', 'Software "as is" & OTA updates'), body: <P>{t('本产品的软件与固件按「现状」及「现有」提供，不附带任何明示或暗示的担保。我们可能不时通过 BLE OTA 等方式推送固件与应用更新，以修复问题、提升性能或增加功能。部分更新可能是正常使用本产品所必需的；继续使用即表示您同意接收此类更新。', 'The Product\'s software and firmware are provided "as is" and "as available", without warranties of any kind, whether express or implied. We may from time to time push firmware and app updates (including via BLE OTA) to fix issues, improve performance, or add features. Some updates may be necessary for normal operation; by continuing to use the Product, you agree to receive such updates.')}</P> },
    { title: t('知识产权', 'Intellectual property'), body: <P>{t('本产品及其所有组成部分——包括但不限于核心算法、硬件结构、控制逻辑、软件、界面、商标与标识——的全部知识产权均归我们所有，并受相关法律保护；其中部分技术已进入发明专利申请程序。本条款未明确授予您的权利，我们均予以保留。未经授权，严禁任何形式的商业拆解、逆向工程或仿造。', 'All intellectual property in the Product and its components — including but not limited to the core algorithms, hardware architecture, control logic, software, interface, trademarks, and logos — belongs to us and is protected by applicable law; invention patent applications covering certain of these technologies have been filed. We reserve all rights not expressly granted to you in these Terms. Unauthorized commercial disassembly, reverse engineering, or imitation is strictly prohibited.')}</P> },
    { title: t('免责声明与责任限制', 'Disclaimers & limitation of liability'), body: <>
      <P>{t('本产品是一种机械设备。在适用法律允许的最大范围内，我们不对适销性、特定用途适用性或不侵权作出任何暗示担保。您理解并接受，对钢琴进行调音存在固有的机械风险（例如琴弦或弦轴在张力下的固有特性）。', 'The Product is a mechanical device. To the maximum extent permitted by applicable law, we disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement. You understand and accept that tuning a piano carries inherent mechanical risks (such as the behavior of strings and pins under tension).')}</P>
      <P>{t('在适用法律允许的最大范围内，对于因使用或无法使用本产品而产生的任何间接、附带、特殊或后果性损失，我们概不负责；我们就本产品向您承担的累计责任总额，不超过您为该产品实际支付的金额。部分司法辖区不允许排除某些担保或限制某些责任，在这些地区，上述限制将在法律允许的范围内适用。本条款不影响您依法享有的不可放弃的法定权利。', 'To the maximum extent permitted by applicable law, we are not liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the Product; and our total aggregate liability to you for the Product will not exceed the amount you actually paid for it. Some jurisdictions do not allow the exclusion of certain warranties or limitation of certain liabilities; in those regions the above limits apply to the extent permitted by law. These Terms do not affect your non-waivable statutory rights.')}</P>
    </> },
    { title: t('账户与激活码（CDK）', 'Accounts & CDK'), body: <>
      <P>{t('部分功能或服务可能需要账户或激活码（CDK）。您应对账户与激活码的保管负责，并对在其下发生的活动承担责任。激活码不得转售或用于未经授权的用途。', 'Some features or services may require an account or an activation code (CDK). You are responsible for safeguarding your account and activation codes, and for activity that occurs under them. Activation codes may not be resold or used for unauthorized purposes.')}</P>
      <P>{t('请注意：当前销售已暂停。相关账户、激活码及购买条款将在销售恢复时进一步明确。', 'Please note: sales are currently paused. Account, activation-code, and purchase terms will be further specified when sales resume.')}</P>
    </> },
    { title: t('条款变更', 'Changes to these terms'), body: <P>{t('我们可能会不时更新本条款。重大变更将通过应用内或本页面公示，并更新顶部的「最后更新」日期。变更生效后继续使用本产品，即表示您接受更新后的条款。', 'We may update these Terms from time to time. Material changes will be posted in the app or on this page, with the "Last updated" date above revised accordingly. Continued use of the Product after changes take effect means you accept the updated Terms.')}</P> },
    { title: t('适用法律与争议解决', 'Governing law & disputes'), body: <P>{t('本条款受中华人民共和国法律管辖并依其解释。因本条款或本产品引起的任何争议，应提交至深圳市有管辖权的人民法院解决。', "These Terms are governed by and construed in accordance with the laws of the People's Republic of China. Any dispute arising out of these Terms or the Product shall be submitted to the competent People's Court in Shenzhen.")}</P> },
    { title: t('联系我们', 'Contact us'), body: <P>{t('如对本服务条款有任何疑问，请联系：', 'For any questions about these Terms, contact us at: ')}<a className="literal" href={`mailto:${EMAIL_SUPPORT}`}>{EMAIL_SUPPORT}</a></P> },
  ];
  return (
    <LegalPage
      page="terms"
      kicker={t('LEGAL · 法律条款', 'LEGAL')}
      title={t('服务条款', 'Terms of service')}
      updated={t('最后更新：2026 年 8 月 29 日', 'Last updated: August 29, 2026')}
      intro={t('欢迎使用 Piano Tuner。本服务条款（以下简称「本条款」）是您与融谱智能科技（深圳）有限公司（品牌 MelSpectrum / Piano Tuner，以下简称「我们」）之间就 Piano Tuner 调音机器人硬件及配套 iOS 应用（以下统称「本产品」）使用所达成的协议。请在使用前仔细阅读，尤其是关于安全使用与责任限制的条款。', 'Welcome to Piano Tuner. These Terms of Service ("Terms") form an agreement between you and 融谱智能科技（深圳）有限公司, operating under the MelSpectrum brand (Piano Tuner; "we", "us") regarding your use of the Piano Tuner tuning robot hardware and its companion iOS app (together, the "Product"). Please read them carefully before use, especially the safety and limitation-of-liability sections.')}
      sections={sections}
    />
  );
}
