import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import GuidePage from '../../components/GuidePage';
import { article } from '../schema';

const PTG_CARE = 'https://www.ptg.org/ptgmain/piano/care/servicing';

export const meta = {
  navTheme: 'dark',
  published: '2026-09-27',
  updated: '2026-09-27',
  zh: {
    title: '钢琴多久调一次？厂商建议、跑音原因与保养安排 | Piano Tuner',
    desc: '钢琴多久调一次？汇总钢琴技师协会（PTG）收录的厂商保养建议：多数建议每年至少调两次，新琴第一年更频繁。附温湿度影响与调音安排建议。',
  },
  en: {
    title: 'How Often Should a Piano Be Tuned? | Piano Tuner',
    desc: 'How often to tune a piano: manufacturer recommendations collected by the Piano Technicians Guild (PTG), why pianos drift out of tune, and how to schedule tunings.',
  },
  jsonLd: (lang, { dates }) => article(lang, 'piano-tuning-frequency', {
    headline: lang === 'en' ? 'How often should a piano be tuned?' : '钢琴多久调一次？',
    description: lang === 'en'
      ? 'Manufacturer tuning recommendations collected by the Piano Technicians Guild, why pianos drift, and how to schedule tunings.'
      : '钢琴技师协会（PTG）收录的厂商调音建议、钢琴跑音的原因，以及如何安排调音。',
    dates,
  }),
};

export default function PianoTuningFrequency() {
  const { t, lang } = useT();
  const P = ({ children }) => <p className="t-body">{children}</p>;
  const R = ({ n }) => <sup><a href={`#ref${n}`}>[{n}]</a></sup>;
  const sections = [
    { title: t('简短回答：每年至少两次', 'Short answer: at least twice a year'), body: <>
      <P>{t('钢琴技师协会（Piano Technicians Guild，PTG）汇总了多家钢琴厂商的保养建议：Baldwin、Kawai、Pearl River 与 Yamaha 都建议新琴第一年调四次，之后每年至少两次；Steinway 则建议每年请技师三到四次。', 'The Piano Technicians Guild (PTG) collects care recommendations from piano makers: Baldwin, Kawai, Pearl River and Yamaha all recommend four tunings in a new piano\'s first year and at least two a year after that; Steinway recommends calling a technician three or four times a year.')}<R n={1} /></P>
      <P>{t('也就是说，「一年一次」低于多数厂商建议的最低次数。Baldwin 还特别说明，具体频率取决于使用频率和环境条件。', 'In other words, once a year is below what most manufacturers set as the minimum. Baldwin adds that the right frequency depends on how often the piano is played and on atmospheric conditions.')}<R n={1} /></P>
    </> },
    { title: t('为什么钢琴会跑音', 'Why pianos drift out of tune'), body: <>
      <P>{t('钢琴主要由木材、毛毡和金属构成。PTG 指出，冷热、干湿的剧烈变化会让这些材料膨胀和收缩，从而影响音色、音高和触键手感。', 'A piano is built largely from wood, felt and metal. PTG notes that extreme swings from hot to cold or dry to wet make these materials swell and contract, affecting tone, pitch and touch.')}<R n={1} /></P>
      <P>{t('PTG 给出的理想环境约为 20°C（68°F）、相对湿度 42%，并建议钢琴远离暖气和空调出风口、壁炉、阳光直射处，靠墙摆放、远离经常开关的门窗。', 'PTG describes optimal conditions as about 68°F (20°C) and 42% relative humidity, and advises keeping the piano away from heating and air-conditioning vents, fireplaces and direct sunlight — near a wall, away from windows or doors that are opened frequently.')}<R n={1} /></P>
    </> },
    { title: t('标准音高：A440', 'Standard pitch: A440'), body: <>
      <P>{t('PTG 收录的 Steinway 建议是：钢琴出厂时按 A440 调音，也应当一直保持在 A440——这是国际通行的标准音高。', 'Steinway\'s guidance, as collected by PTG, is that a piano is tuned to and should be maintained at A440, the internationally accepted standard.')}<R n={1} /></P>
    </> },
    { title: t('怎么安排调音', 'How to schedule tunings'), body: <ul className="t-body">
      <li>{t('家用琴：每年至少两次（见上文厂商建议），弹得多、环境变化大的琴可以更频繁。', 'Home pianos: at least twice a year (see the manufacturer advice above), more often if the piano is played a lot or its environment changes.')}</li>
      <li>{t('新琴：按厂商建议，第一年调四次。', 'New pianos: follow the maker\'s advice — four tunings in the first year.')}</li>
      <li>{t('摆放：按 PTG 的建议避开出风口、阳光直射和常开的门窗，能让音准保持得更久。', 'Placement: following PTG\'s advice on vents, sunlight and doors helps a tuning hold.')}</li>
      <li>{t('演出、录音、考试前：单独安排一次调音。', 'Before a performance, recording or exam: book a dedicated tuning.')}</li>
      <li>{t('找有资质的调律师：PTG 的注册钢琴技师（RPT）须通过书面、调音和技术考试。', 'Use a qualified technician: PTG Registered Piano Technicians (RPTs) must pass written, tuning and technical exams.')}<R n={2} /></li>
    </ul> },
    { title: t('调律师在做什么', 'What the tuner is actually doing'), body: <>
      <P>{t('一次完整调律要把 200 多根琴弦逐一调到位，并不是简单地让每个音「对上表」——现代钢琴的调律会有意偏离纯粹的十二平均律，这就是「拉伸调律」。', 'A full tuning brings more than 200 strings to pitch one by one, and it is not just matching a meter: modern piano tuning deliberately departs from pure equal temperament — a practice called stretch tuning.')} <a href={href(lang, 'stretch-tuning-railsback')}>{t('了解拉伸调律与 Railsback 曲线 →', 'Read about stretch tuning and the Railsback curve →')}</a></P>
      <P>{t('Piano Tuner 为调律师而设计：电机替你逐弦拧到位，你专注于听和判断——让一年多次的保养少一些体力消耗。', 'Piano Tuner is built for tuners: the motor turns each pin to pitch while you listen and decide — making regular service less physically demanding.')}</P>
    </> },
  ];
  const refs = [
    { text: t('Piano Technicians Guild. Piano Care — Servicing（厂商保养建议汇编）.', 'Piano Technicians Guild. Piano Care — Servicing (manufacturer recommendations).'), url: PTG_CARE },
    { text: t('Piano Technicians Guild. RPT Exams — General Information.', 'Piano Technicians Guild. RPT Exams — General Information.'), url: 'https://www.ptgconvention.com/exams-general-info' },
  ];
  return (
    <GuidePage
      page="piano-tuning-frequency"
      title={t('钢琴多久调一次？', 'How often should a piano be tuned?')}
      sub={t('厂商建议、跑音原因与保养安排。', 'Manufacturer advice, why pianos drift, and how to plan tunings.')}
      intro={t('这是调律师经常被问到的问题。下面的答案来自钢琴技师协会（PTG）汇总的厂商建议，每条都附出处。', 'It is one of the questions tuners hear most often. The answers below come from manufacturer recommendations collected by the Piano Technicians Guild, each with its source.')}
      sections={sections}
      refs={refs}
    />
  );
}
