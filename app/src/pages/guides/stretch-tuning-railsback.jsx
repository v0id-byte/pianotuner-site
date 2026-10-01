import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import GuidePage from '../../components/GuidePage';
import { article } from '../schema';

export const meta = {
  navTheme: 'dark',
  published: '2026-09-27',
  updated: '2026-09-27',
  zh: {
    title: '拉伸调律与 Railsback 曲线：钢琴为什么不按纯十二平均律调 | Piano Tuner',
    desc: '什么是 Railsback 曲线与拉伸调律？琴弦非谐性让泛音高于整数倍，调好的钢琴高音偏高、低音偏低。附 Railsback（1938）、Fletcher（1964）、Giordano（2015）等文献出处。',
  },
  en: {
    title: 'Stretch Tuning and the Railsback Curve Explained | Piano Tuner',
    desc: 'What is the Railsback curve? String inharmonicity pushes partials sharp, so well-tuned pianos run sharp in the treble and flat in the bass. With sources: Railsback (1938), Fletcher (1964), Giordano (2015).',
  },
  jsonLd: (lang, { dates }) => article(lang, 'stretch-tuning-railsback', {
    headline: lang === 'en' ? 'Stretch tuning and the Railsback curve' : '拉伸调律与 Railsback 曲线',
    description: lang === 'en'
      ? 'Why well-tuned pianos deviate from pure equal temperament: string inharmonicity, the Railsback curve, and what the research says.'
      : '为什么调好的钢琴会偏离纯十二平均律：琴弦非谐性、Railsback 曲线，以及相关研究。',
    dates,
  }),
};

export default function StretchTuningRailsback() {
  const { t, lang } = useT();
  const P = ({ children }) => <p className="t-body">{children}</p>;
  const R = ({ n }) => <sup><a href={`#ref${n}`}>[{n}]</a></sup>;
  const sections = [
    { title: t('理论上的十二平均律', 'Equal temperament on paper'), body: <>
      <P>{t('十二平均律把一个八度等分成 12 个半音，相邻半音的频率比都是 2 的 12 次方根，八度正好是频率的 2 倍。如果钢琴的琴弦是理想琴弦，按这个比例调就够了。', 'Equal temperament divides the octave into 12 equal semitones: each step is a frequency ratio of the twelfth root of 2, and an octave is exactly 2:1. If piano strings were ideal strings, tuning to those ratios would be enough.')}</P>
    </> },
    { title: t('Railsback 的测量', 'What Railsback measured'), body: <>
      <P>{t('1938 年，O. L. Railsback 在美国声学学会的会议上报告（摘要刊于 JASA）：他用频闪调音器测量多位调律师调好的钢琴，检验实际调律是否遵循十二平均律。结果显示八度被系统性地「拉宽」，越靠近键盘两端越明显——相对十二平均律，高音偏高、低音偏低。把这种偏离画成曲线，就是今天所说的「Railsback 曲线」。', 'In 1938, O. L. Railsback reported to the Acoustical Society of America (abstract in JASA) on pianos measured with a chromatic stroboscope after tuning by several tuners, testing whether real tunings follow equal temperament. Octaves were systematically stretched, most markedly toward both ends of the keyboard — sharp of equal temperament in the treble, flat in the bass. Plotted as a curve, that deviation is what we now call the Railsback curve.')}<R n={1} /></P>
    </> },
    { title: t('原因：琴弦的非谐性', 'The cause: string inharmonicity'), body: <>
      <P>{t('真实的钢琴弦是有刚度的钢丝，它的泛音并不正好落在基频的整数倍上，而是略微偏高。Harvey Fletcher 在 1964 年推导出刚性琴弦第 n 阶泛音的频率为 fₙ = n·f₁·√[(1 + B·n²)/(1 + B)]（f₁ 为基频），其中 B 称为非谐系数，取决于琴弦的直径、振动长度、张力和材料刚度。', 'A real piano string is stiff steel wire, so its partials are not exact multiples of the fundamental — they run slightly sharp. In 1964 Harvey Fletcher derived that the n-th partial of a stiff string is fₙ = n·f₁·√[(1 + B·n²)/(1 + B)] (f₁ being the fundamental), where B, the inharmonicity coefficient, depends on the wire\'s diameter, speaking length, tension and material stiffness.')}<R n={2} /></P>
      <P>{t('调律师判断八度、五度是否「干净」，听的是两根弦泛音之间的拍音。既然泛音本身偏高，要让拍音消失，八度就必须比 2:1 稍宽——这就是「拉伸」的来源。', 'Tuners judge octaves and fifths by listening to beats between the partials of two strings. Because those partials are already sharp, an octave has to be made slightly wider than 2:1 for the beats to disappear — that is where the stretch comes from.')}</P>
    </> },
    { title: t('研究如何解释这个拉伸量', 'How research explains the amount of stretch'), body: <>
      <P>{t('2015 年，N. Giordano 在 JASA 发表论文，用 Plomp 与 Levelt 关于感官不协和的心理声学结果，结合实测钢琴音的频谱（包含非谐性）来估算音对的不协和程度，并预测怎样偏离十二平均律能让不协和最小。预测结果与熟练调律师调出的 Railsback 拉伸一致。', 'In 2015, N. Giordano published in JASA a calculation that used Plomp and Levelt\'s perceptual results on sensory dissonance, together with spectra measured from a real piano (inharmonicity included), to estimate the dissonance of tone pairs and predict how tuning should depart from equal temperament to minimize it. The predictions agree with the Railsback stretch produced by skilled technicians.')}<R n={3} /><R n={4} /></P>
      <P>{t('另一条思路来自 Haye Hinrichsen（2012）：把调律看成让整台琴频谱的熵最小的优化问题，并在计算机上用一台耳调立式琴的录音验证，得到的曲线与调律师耳调的结果高度吻合。', 'Another approach comes from Haye Hinrichsen (2012), who framed tuning as minimizing the entropy of the whole instrument\'s spectrum and, tuning virtually on recordings of an aurally tuned upright, closely reproduced the tuner\'s curve.')}<R n={5} /></P>
    </> },
    { title: t('每台琴的曲线都不一样', 'Every piano has its own curve'), body: <>
      <P>{t('因为非谐系数取决于琴弦本身的参数，不同尺寸、不同型号的钢琴，拉伸曲线并不完全相同。', 'Because inharmonicity depends on the strings themselves, pianos of different sizes and models have somewhat different stretch curves.')}</P>
      <P>{t('Piano Tuner 专业版会测量你这台琴，在 iPhone 本机拟合它专属的拉伸曲线，再驱动执行器逐弦调到位。', 'Piano Tuner Pro measures your piano and fits its own stretch curve on the iPhone, then drives the actuator to bring each string to pitch.')} <a href={href(lang, 'pro')}>{t('了解专业版 →', 'Explore Pro →')}</a> <a href={href(lang, 'etd-vs-aural-tuning')}>{t('电子调音与耳调是什么关系？→', 'How do electronic devices relate to tuning by ear? →')}</a></P>
    </> },
  ];
  const refs = [
    { text: 'O. L. Railsback. Scale Temperament as Applied to Piano Tuning (meeting abstract). J. Acoust. Soc. Am. 9, 274 (1938).', url: 'https://doi.org/10.1121/1.1902056' },
    { text: 'H. Fletcher. Normal Vibration Frequencies of a Stiff Piano String. J. Acoust. Soc. Am. 36, 203–209 (1964).', url: 'https://doi.org/10.1121/1.1918933' },
    { text: 'N. Giordano. Explaining the Railsback stretch in terms of the inharmonicity of piano tones and sensory dissonance. J. Acoust. Soc. Am. 138(4), 2359–2366 (2015).', url: 'https://doi.org/10.1121/1.4931439' },
    { text: 'R. Plomp, W. J. M. Levelt. Tonal Consonance and Critical Bandwidth. J. Acoust. Soc. Am. 38, 548–560 (1965).', url: 'https://doi.org/10.1121/1.1909741' },
    { text: 'H. Hinrichsen. Entropy-based Tuning of Musical Instruments. Rev. Bras. Ensino Fís. 34(2), 2301 (2012); arXiv:1203.5101.', url: 'https://arxiv.org/abs/1203.5101' },
  ];
  return (
    <GuidePage
      page="stretch-tuning-railsback"
      title={t('拉伸调律与 Railsback 曲线', 'Stretch tuning and the Railsback curve')}
      sub={t('为什么调好的钢琴，并不按纯十二平均律。', 'Why a well-tuned piano does not follow pure equal temperament.')}
      intro={t('调好的钢琴，高音会比十二平均律略高，低音略低。这不是误差，而是琴弦物理和人耳听感共同决定的结果。下面按文献出处讲清楚。', 'On a well-tuned piano the treble sits slightly sharp of equal temperament and the bass slightly flat. That is not an error — it follows from string physics and how we hear. Here is the explanation, with sources.')}
      sections={sections}
      refs={refs}
    />
  );
}
