// JSON-LD 共用节点。无真实可下单交易 → 不用 Product（Google 产品摘要要求 offers/review/aggregateRating，
// 三者我们都不能如实提供；verify-build 会拦）。开售后再按购买页价格加回 Product + Offer。
import { SITE } from '../../../scripts/paths.mjs';
import { canonical } from '../i18n/urls.js';
import { EMAIL_PRIMARY, MELSPECTRUM, LEGAL_ZH } from '../data/site.js';

export const ORG_ID = `${SITE.origin}/#organization`;

export const organization = () => ({
  '@type': 'Organization',
  '@id': ORG_ID,
  name: LEGAL_ZH,
  alternateName: ['MelSpectrum', 'Piano Tuner'],
  url: SITE.origin + '/',
  logo: SITE.origin + '/apple-touch-icon-202609.png',
  sameAs: [MELSPECTRUM],
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer support', email: EMAIL_PRIMARY, availableLanguage: ['zh-CN', 'en'] },
});

/** 首页 → 当前页 两级面包屑。 */
export const breadcrumb = (lang, pageId, name) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: lang === 'en' ? 'Home' : '首页', item: canonical(lang, 'index') },
    { '@type': 'ListItem', position: 2, name, item: canonical(lang, pageId) },
  ],
});

export const graph = (...nodes) => ({ '@context': 'https://schema.org', '@graph': nodes });

/** 指南页：Article + 面包屑。作者/出版方都是公司（不虚构个人作者）。 */
export const article = (lang, pageId, { headline, description, published, modified }) => graph(
  {
    '@type': 'Article',
    headline,
    description,
    inLanguage: lang === 'en' ? 'en' : 'zh-CN',
    datePublished: published,
    dateModified: modified || published,
    image: SITE.origin + '/og-cover.jpg',
    mainEntityOfPage: canonical(lang, pageId),
    author: { '@type': 'Organization', '@id': ORG_ID, name: LEGAL_ZH, url: SITE.origin + '/' },
    publisher: organization(),
  },
  breadcrumb(lang, pageId, headline),
);
