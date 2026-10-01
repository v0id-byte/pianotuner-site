import { useT } from '../../i18n';
import { href } from '../../i18n/urls';
import Shell from '../../components/Shell';
import PageHero from '../../components/PageHero';
import { BracketLink } from '../../components/ui';

// nginx error_page 的 body：HTTP 状态仍是 404。head.js 见 errorPage 即 noindex，
// 不出 canonical / hreflang / og:url / JSON-LD；不在 PAGES 里，所以不进 sitemap、没有日期。
export const meta = {
  errorPage: true,
  navTheme: 'dark',
  zh: { title: '页面不存在 | Piano Tuner', desc: '你要找的页面可能已经移动或不存在。' },
  en: { title: 'Page not found | Piano Tuner', desc: 'The page you are looking for may have moved or no longer exists.' },
};

export default function NotFound() {
  const { t, lang } = useT();
  return (
    <Shell page="404" navTheme="dark">
      <PageHero
        eyebrow="404"
        l1={t('页面不存在', 'Page not found')}
        sub={t('这个页面可能已经移动，或者已经不存在了。可以从这里继续：', 'The page may have moved or no longer exists. Try one of these:')}
        actions={<>
          <BracketLink href={href(lang, 'index')} highlight>{t('返回首页', 'Home')}</BracketLink>
          <BracketLink href={href(lang, 'guides')}>{t('调律指南', 'Piano tuning guides')}</BracketLink>
          <BracketLink href={href(lang, 'demo')}>{t('实测演示', 'Watch the demo')}</BracketLink>
          <BracketLink href={href(lang, 'buy')} data-umami-event="cta-waitlist" data-umami-event-at="404">{t('加入候补名单', 'Join the waitlist')}</BracketLink>
        </>}
      />
    </Shell>
  );
}
