import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import Shell from '../../components/Shell';
import PageHero from '../../components/PageHero';
import SubscribeForm from '../../components/SubscribeForm';
import { BracketLink, Button } from '../../components/ui';
import { TESTFLIGHT } from '../../data/site';

export const meta = {
  navTheme: 'dark',
  zh: { title: 'Piano Tuner | 暂停销售 · 候补名单', desc: 'Piano Tuner 极早鸟预售已结束，V2.1 研发中，新一轮早鸟预售计划 2026 年第四季度开启，首批发货预计 2027 年第一至第二季度。留下邮箱，开售第一时间通知你。' },
  en: { title: 'Piano Tuner | Sales Paused · Waitlist', desc: 'The ultra-early-bird pre-sale has ended. Piano Tuner V2.1 is in development; the next early-bird round is planned for Q4 2026, with first shipments expected Q1–Q2 2027. Leave your email to be notified first.' },
};

export default function Buy() {
  const { t, lang } = useT();
  return (
    <Shell page="buy" navTheme="dark">
      <PageHero
        eyebrow={t('SALES PAUSED · 暂停销售', 'SALES PAUSED')}
        l1={t('极早鸟预售', 'The ultra-early-bird')}
        l2={t('已结束', 'pre-sale has ended')}
        display
        sub={t('Piano Tuner V2.1 正在研发中。新一轮早鸟预售计划于 2026 年第四季度开启，首批发货预计 2027 年第一至第二季度。留下邮箱，开售第一时间通知你。', 'Piano Tuner V2.1 is in development. The next early-bird round is planned for Q4 2026, with first shipments expected Q1–Q2 2027. Leave your email and we will tell you the moment it opens.')}
      />
      <section className="island-accent p-custom py-section" data-nav-theme="light">
        <div className="cta__grid">
          <div className="notice">
            <span className="t-ui" style={{ background: 'var(--color-black)', color: 'var(--color-white)', padding: '4px 6px', width: 'max-content' }}>{t('NOTIFY ME · 开售通知', 'NOTIFY ME')}</span>
            <p className="t-body">
              {t('感谢你的关注与支持。极早鸟预售名额已结束，我们正在打磨 V2.1 的硬件与算法。想在第一时间收到开售通知，留下邮箱即可，也欢迎下载 App 抢先体验。', "Thank you for your interest and support. The ultra-early-bird pre-sale has ended, and we're refining the V2.1 hardware and algorithms. To be notified first, leave your email below, or try the app for early access.")}
            </p>
            <SubscribeForm source="buy-page" />
          </div>
          <div className="cta__links">
            <Button href={TESTFLIGHT} external variant="dark">{t('下载 App 抢先体验', 'Try the app (TestFlight)')}</Button>
            <BracketLink href={href(lang, 'index')} className="blink--onaccent">{t('了解产品', 'Explore the product')}</BracketLink>
            <BracketLink href={href(lang, 'pro')} className="blink--onaccent">{t('了解专业版', 'Explore Pro')}</BracketLink>
            <BracketLink href={href(lang, 'contact')} className="blink--onaccent">{t('联系我们', 'Contact us')}</BracketLink>
          </div>
        </div>
      </section>
      <section className="island-light p-custom py-section-sm" data-nav-theme="light">
        <dl className="specs" style={{ maxWidth: '64ch' }}>
          <div className="spec"><dt className="spec__k t-ui">{t('当前状态', 'STATUS')}</dt><dd className="spec__v">{t('候补名单（销售暂停）', 'Waitlist (sales paused)')}</dd></div>
          <div className="spec"><dt className="spec__k t-ui">{t('下一轮预售', 'NEXT ROUND')}</dt><dd className="spec__v">{t('2026 年第四季度', 'Q4 2026')}</dd></div>
          <div className="spec"><dt className="spec__k t-ui">{t('首批发货', 'FIRST SHIPMENTS')}</dt><dd className="spec__v">{t('2027 年第一至第二季度', 'Q1–Q2 2027')}</dd></div>
          <div className="spec"><dt className="spec__k t-ui">{t('App', 'APP')}</dt><dd className="spec__v">{t('iOS · TestFlight 已开放', 'iOS · open on TestFlight')}</dd></div>
        </dl>
      </section>
    </Shell>
  );
}
