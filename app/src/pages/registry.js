// id -> { Page, meta }。静态 import，让 SSR bundle 与客户端 bundle 用同一张表。
import Home, { meta as homeMeta } from './index/index.jsx';
import About, { meta as aboutMeta } from './about/index.jsx';
import Pro, { meta as proMeta } from './pro/index.jsx';
import Demo, { meta as demoMeta } from './demo/index.jsx';
import Contact, { meta as contactMeta } from './contact/index.jsx';
import Support, { meta as supportMeta } from './support/index.jsx';
import Buy, { meta as buyMeta } from './buy/index.jsx';
import Privacy, { meta as privacyMeta } from './privacy/index.jsx';
import Terms, { meta as termsMeta } from './terms/index.jsx';

export const PAGES_BY_ID = {
  index: { Page: Home, meta: homeMeta },
  about: { Page: About, meta: aboutMeta },
  pro: { Page: Pro, meta: proMeta },
  demo: { Page: Demo, meta: demoMeta },
  contact: { Page: Contact, meta: contactMeta },
  support: { Page: Support, meta: supportMeta },
  buy: { Page: Buy, meta: buyMeta },
  privacy: { Page: Privacy, meta: privacyMeta },
  terms: { Page: Terms, meta: termsMeta },
};
