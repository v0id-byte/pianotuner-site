// 唯一知道 /en/ 前缀的地方。站内链接一律绝对，且一律经这里生成。
import { SITE } from '../../../scripts/paths.mjs';

const base = (lang) => (lang === 'en' ? '/en/' : '/');

/** 页面 id -> 绝对路径。首页的 canonical 是目录本身（/ 与 /en/），不是 index.html。 */
export const href = (lang, page, hash = '') =>
  base(lang) + (page === 'index' ? '' : `${page}.html`) + (hash ? `#${hash}` : '');

export const counterpart = (lang, page) => href(lang === 'en' ? 'zh' : 'en', page);

export const canonical = (lang, page) => SITE.origin + href(lang, page);

export const htmlLang = (lang) => (lang === 'en' ? 'en' : 'zh-CN');
