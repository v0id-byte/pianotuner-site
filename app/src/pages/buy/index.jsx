import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import Shell from '../../components/Shell';
import Section from '../../components/Section';
import PageHero from '../../components/PageHero';
import SubscribeForm from '../../components/SubscribeForm';
import { BracketLink, Button } from '../../components/ui';
import { TESTFLIGHT } from '../../data/site';
import { graph, breadcrumb, ORG_ID } from '../schema';

export const meta = {
  published: '2026-09-05',
  updated: '2026-09-27',
  navTheme: 'dark',
  zh: { title: 'Piano Tuner | 暂停销售 · 候补名单', desc: 'Piano Tuner 极早鸟预售已结束，V2.1 研发中，新一轮早鸟预售计划 2026 年第四季度开启，首批发货预计 2027 年第一至第二季度。留下邮箱，开售第一时间通知你。' },
  en: { title: 'Piano Tuner | Sales Paused · Waitlist', desc: 'The ultra-early-bird pre-sale has ended. The next early-bird round is planned for Q4 2026, first shipments Q1–Q2 2027. Leave your email to be notified first.' },
  jsonLd: (lang, { self }) => graph(
    { '@type': 'WebPage', url: self, name: lang === 'en' ? 'Piano Tuner waitlist' : 'Piano Tuner 候补名单', inLanguage: lang === 'en' ? 'en' : 'zh-CN', publisher: { '@id': ORG_ID } },
    breadcrumb(lang, 'buy', lang === 'en' ? 'Waitlist' : '候补名单'),
  ),
};

export default function Buy() {
  const { t, lang } = useT();
  return (
    <Shell page="buy" navTheme="dark">
      <PageHero
        eyebrow={t('SALES PAUSED · 暂停销售', 'SALES PAUSED')}
        l1={t('加入候补名单', 'Join the waitlist')}
        l2={t('开售第一时间通知你', 'Hear first when sales open')}
        sub={t('Piano Tuner V2.1 正在研发中。新一轮早鸟预售计划于 2026 年第四季度开启，首批发货预计 2027 年第一至第二季度。价格将随预售开启一同公布，候补名单用户会第一时间收到通知。', 'Piano Tuner V2.1 is in development. The next early-bird round is planned for Q4 2026, with first shipments expected Q1–Q2 2027. Pricing will be announced when the pre-sale opens — waitlist members are notified first.')}
        actions={<div id="waitlist" style={{ width: '100%', maxWidth: 520 }}><SubscribeForm source="buy-page" dark /></div>}
      />
      <Section island="accent">
        <div className="cta__grid">
          <div className="notice">
            <span className="t-ui" style={{ background: 'var(--color-black)', color: 'var(--color-white)', padding: '4px 6px', width: 'max-content' }}>{t('NOTIFY ME · 开售通知', 'NOTIFY ME')}</span>
            <p className="t-body">
              {t('感谢你的关注与支持。极早鸟预售名额已结束，我们正在打磨 V2.1 的硬件与算法。想在第一时间收到开售通知，在上方留下邮箱即可；也欢迎现在就下载 App 抢先体验。', "Thank you for your interest and support. The ultra-early-bird pre-sale has ended, and we're refining the V2.1 hardware and algorithms. To be notified first, leave your email above — or try the app for early access now.")}
            </p>
          </div>
          <div className="cta__links">
            <Button href={TESTFLIGHT} external variant="dark" data-umami-event="cta-testflight" data-umami-event-at="buy">{t('下载 App 抢先体验', 'Download the app')}</Button>
            <BracketLink href={href(lang, 'index')} className="blink--onaccent">{t('了解产品', 'Explore the product')}</BracketLink>
            <BracketLink href={href(lang, 'pro')} className="blink--onaccent" data-umami-event="cta-pro" data-umami-event-at="buy">{t('了解专业版', 'Explore Pro')}</BracketLink>
            <BracketLink href={href(lang, 'contact')} className="blink--onaccent">{t('联系我们', 'Contact us')}</BracketLink>
          </div>
        </div>
      </Section>
      <Section island="light" pad="py-section-sm">
        <dl className="specs" style={{ maxWidth: '64ch' }}>
          <div className="spec"><dt className="spec__k t-ui">{t('当前状态', 'STATUS')}</dt><dd className="spec__v">{t('候补名单（销售暂停）', 'Waitlist (sales paused)')}</dd></div>
          <div className="spec"><dt className="spec__k t-ui">{t('下一轮预售', 'NEXT ROUND')}</dt><dd className="spec__v">{t('2026 年第四季度', 'Q4 2026')}</dd></div>
          <div className="spec"><dt className="spec__k t-ui">{t('首批发货', 'FIRST SHIPMENTS')}</dt><dd className="spec__v">{t('2027 年第一至第二季度', 'Q1–Q2 2027')}</dd></div>
          <div className="spec"><dt className="spec__k t-ui">{t('App', 'APP')}</dt><dd className="spec__v">{t('iOS · TestFlight 已开放', 'iOS · open on TestFlight')}</dd></div>
        </dl>
      </Section>
    </Shell>
  );
}
