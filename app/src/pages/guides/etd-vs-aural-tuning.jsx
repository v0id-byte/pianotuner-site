import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import GuidePage from '../../components/GuidePage';
import { article } from '../schema';

export const meta = {
  navTheme: 'dark',
  zh: {
    title: '电子调音（ETD）与耳调：调律师该怎么看 | Piano Tuner',
    desc: '电子调音设备（ETD）和耳调是对立的吗？PTG 注册钢琴技师考试的要求、ETD 能做和不能做的事，以及调音机器人在其中的位置。',
  },
  en: {
    title: 'Electronic Tuning Devices vs. Aural Tuning | Piano Tuner',
    desc: 'Are electronic tuning devices (ETDs) and aural tuning at odds? What the PTG RPT exam requires, what ETDs do and do not do, and where a tuning robot fits.',
  },
  jsonLd: (lang) => article(lang, 'etd-vs-aural-tuning', {
    headline: lang === 'en' ? 'Electronic tuning devices vs. aural tuning' : '电子调音与耳调',
    description: lang === 'en'
      ? 'What electronic tuning devices do, what the PTG RPT exam requires of aural skill, and where a tuning robot fits.'
      : '电子调音设备能做什么、PTG 考试对耳调能力的要求，以及调音机器人在其中的位置。',
    published: '2026-09-27',
  }),
};

export default function EtdVsAural() {
  const { t, lang } = useT();
  const P = ({ children }) => <p className="t-body">{children}</p>;
  const R = ({ n }) => <sup><a href={`#ref${n}`}>[{n}]</a></sup>;
  const sections = [
    { title: t('两种调律方式', 'Two ways to tune'), body: <>
      <P>{t('耳调：调律师听两根弦同时发声时的拍音（beats），通过拍音的快慢判断音程是否合适，先在中音区建立基准音组（分律，temperament），再按八度向高低音区扩展。', 'Aural tuning: the tuner listens to the beats between two strings sounding together, judges intervals by how fast those beats are, sets the temperament in the middle of the keyboard and then works outward.')}</P>
      <P>{t('电子调音设备（Electronic Tuning Device，ETD）：测量琴弦的音高并显示与目标的偏差。专业 ETD 还会测量每台琴的特性，计算出带拉伸的目标曲线，而不是套用纯十二平均律。', 'Electronic tuning devices (ETDs) measure a string\'s pitch and show its deviation from a target. Professional ETDs also measure the particular piano and compute a stretched target curve rather than using pure equal temperament.')} <a href={href(lang, 'stretch-tuning-railsback')}>{t('什么是拉伸？→', 'What is stretch? →')}</a></P>
    </> },
    { title: t('行业怎么看：耳朵仍是基本功', 'How the profession sees it: the ear is still the foundation'), body: <>
      <P>{t('钢琴技师协会（PTG）的注册钢琴技师（RPT）考试明确规定：在工作中使用电子调音设备的考生，仍必须在键盘的基准音组（temperament）区域不借助任何电子设备、凭耳朵完成调律，证明自己的耳调能力。', 'The Piano Technicians Guild\'s Registered Piano Technician (RPT) exam is explicit: candidates who use electronic tuning devices in their work must still demonstrate that they can tune by ear, unaided by electronics, in the temperament area of the keyboard.')}<R n={1} /></P>
      <P>{t('PTG 的这条要求说明：在资格认证上，ETD 被视为辅助工具，耳调仍是必考能力。设备可以提供测量和目标，判断是否「好听」、是否稳定，仍要靠调律师。', 'In certification terms, then, PTG treats the ETD as an aid and aural skill remains mandatory. A device can supply measurements and targets; judging whether the result sounds right and will hold is still the tuner\'s job.')}</P>
    </> },
    { title: t('ETD 解决不了的部分', 'What an ETD does not do'), body: <ul className="t-body">
      <li>{t('拧弦本身：无论用耳朵还是用 ETD，每一根弦仍要靠调律扳手一下一下拧到位。', 'Turning the pins: with ears or with an ETD, every string still has to be brought to pitch with the tuning hammer, turn by turn.')}</li>
      <li>{t('定弦与稳定性：让弦轴和琴弦在调完后保持住，靠的是手上的功夫和经验。', 'Pin setting and stability: making the pin and string hold after tuning comes down to technique and experience.')}</li>
      <li>{t('最终判断：同度、八度听起来是否干净，要由调律师的耳朵把关。', 'The final call: whether unisons and octaves sound clean is for the tuner\'s ear to decide.')}</li>
    </ul> },
    { title: t('调音机器人放在哪里', 'Where a tuning robot fits'), body: <>
      <P>{t('Piano Tuner 的思路是把重复的拧弦体力活交给电机：套在弦轴上的执行器按 App 计算的目标逐弦调到位，调律师负责听、判断和收尾。它不替代调律师的耳朵，而是让耳朵有更多精力用在真正需要判断的地方。', 'Piano Tuner hands the repetitive pin-turning to a motor: an actuator on the tuning pin brings each string to the target the app computes, while the tuner listens, judges and finishes. It does not replace the tuner\'s ear — it frees the ear for the decisions that need it.')}</P>
      <P>{t('相关研究：Hinrichsen（2012）提出以频谱熵最小化作为调律准则，并在计算机上复现了耳调的拉伸曲线。', 'Related research: Hinrichsen (2012) proposed spectral-entropy minimization as a tuning criterion and reproduced an aural tuner\'s stretch curve in simulation.')}<R n={2} /></P>
    </> },
  ];
  const refs = [
    { text: t('Piano Technicians Guild. RPT Exams — General Information.', 'Piano Technicians Guild. RPT Exams — General Information.'), url: 'https://www.ptgconvention.com/exams-general-info' },
    { text: 'H. Hinrichsen. Entropy-based Tuning of Musical Instruments. Rev. Bras. Ensino Fís. 34(2), 2301 (2012); arXiv:1203.5101.', url: 'https://arxiv.org/abs/1203.5101' },
  ];
  return (
    <GuidePage
      page="etd-vs-aural-tuning"
      title={t('电子调音与耳调', 'Electronic tuning vs. tuning by ear')}
      sub={t('工具，还是替代？', 'Tool, or replacement?')}
      intro={t('「用电子调音器算不算真正的调律？」这个争论在调律师圈子里由来已久。下面从行业考试的要求说起，讲清楚两者各自的位置。', 'Whether tuning with an electronic device counts as "real" tuning is a long-running debate among tuners. Here is where each stands, starting from what the profession\'s own exam requires.')}
      sections={sections}
      refs={refs}
    />
  );
}
