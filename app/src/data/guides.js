// 调律指南清单：Hub、Footer、相关指南、registry 共用。id 即页面 id（扁平 URL /<id>.html）。
// category 决定在指南 Hub 里归哪一组；新文章挂到已有分组，确实放不下再加组。
export const GUIDE_CATEGORIES = [
  { id: 'fundamentals', zh: '基础', en: 'Fundamentals' },
  { id: 'theory', zh: '调律原理', en: 'Tuning theory' },
  { id: 'methods', zh: '调律方法', en: 'Methods' },
];

export const GUIDES = [
  {
    id: 'piano-tuning-frequency', category: 'fundamentals',
    zh: '钢琴多久调一次？', en: 'How often should a piano be tuned?',
    descZh: '厂商与钢琴技师协会（PTG）的保养建议、钢琴为什么会跑音，以及怎样安排调音。',
    descEn: 'What manufacturers and the PTG recommend, why pianos drift, and how to plan tunings.',
  },
  {
    id: 'stretch-tuning-railsback', category: 'theory',
    zh: '拉伸调律与 Railsback 曲线', en: 'Stretch tuning and the Railsback curve',
    descZh: '琴弦非谐性让泛音偏高，调好的钢琴高音偏高、低音偏低——这条曲线从哪里来。',
    descEn: 'Inharmonicity pushes partials sharp, so a well-tuned piano runs sharp in the treble and flat in the bass.',
  },
  {
    id: 'etd-vs-aural-tuning', category: 'methods',
    zh: '电子调音与耳调', en: 'Electronic tuning devices vs. aural tuning',
    descZh: '电子调音设备能做什么、PTG 考试对耳调的要求，以及调音机器人在其中的位置。',
    descEn: 'What ETDs do, what the PTG exam requires of aural skill, and where a tuning robot fits.',
  },
];
