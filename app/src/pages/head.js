// <head> 的唯一渲染器：title / description / canonical / hreflang / og / twitter /
// JSON-LD / 字体 preload / 语言偏好脚本。预渲染与 dev 中间件都只走这里。
import { PAGES_BY_ID } from './registry.js';
import { canonical, href, htmlLang, counterpart } from '../i18n/urls.js';
import { SITE } from '../../../scripts/paths.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

// 语言偏好：只认显式存储过的选择，navigator.language 永不跳转（会打断分享链接）。
// 无存储且 UA 非中文 → 只写 data-lang-hint，React 在 effect 里渲染可关闭的提示条。
const LANG_SCRIPT = `(function(){try{
var d=document.documentElement,cur=d.dataset.lang,alt=d.dataset.altUrl;
var q=location.search;if(!alt||/[?&]nolang\\b/.test(q))return;
var s=null;try{s=localStorage.getItem('pt_lang')}catch(e){}
if((s==='en'||s==='zh')&&s!==cur){location.replace(alt+q+location.hash);return;}
if(!s&&cur==='zh'&&!/^zh/i.test(navigator.language||''))d.dataset.langHint='en';
}catch(e){}})();`;

export function htmlAttrs(pageId, lang, ssr) {
  return [
    `lang="${htmlLang(lang)}"`,
    `data-lang="${lang}"`,
    `data-page="${pageId}"`,
    `data-alt-url="${counterpart(lang, pageId)}"`,
    `data-ssr="${ssr ? '1' : '0'}"`,
  ].join(' ');
}

export function renderHead(pageId, lang) {
  const { meta } = PAGES_BY_ID[pageId];
  const m = meta[lang];
  const self = canonical(lang, pageId);
  const zhUrl = canonical('zh', pageId);
  const enUrl = canonical('en', pageId);
  const og = SITE.origin + (meta.ogImage || '/og-cover.jpg');
  const robots = meta.robots || 'index, follow, max-image-preview:large';
  const ld = meta.jsonLd ? meta.jsonLd(lang, { self, origin: SITE.origin }) : null;
  const lines = [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.desc)}" />`,
    m.keywords ? `<meta name="keywords" content="${esc(m.keywords)}" />` : '',
    `<meta name="robots" content="${robots}" />`,
    `<meta name="theme-color" content="#141414" />`,
    `<link rel="canonical" href="${self}" />`,
    `<link rel="alternate" hreflang="zh-CN" href="${zhUrl}" />`,
    `<link rel="alternate" hreflang="en" href="${enUrl}" />`,
    `<link rel="alternate" hreflang="x-default" href="${zhUrl}" />`,
    `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`,
    `<link rel="apple-touch-icon" href="/favicon.svg" />`,
    `<link rel="preload" href="/fonts/Inter-var.woff2" as="font" type="font/woff2" crossorigin />`,
    meta.cjkFont === false ? '' : `<link rel="preload" href="/fonts/NotoSansSC-subset.woff2" as="font" type="font/woff2" crossorigin />`,
    `<meta property="og:type" content="${meta.ogType || 'website'}" />`,
    `<meta property="og:site_name" content="Piano Tuner · MelSpectrum" />`,
    `<meta property="og:title" content="${esc(m.title)}" />`,
    `<meta property="og:description" content="${esc(m.ogDesc || m.desc)}" />`,
    `<meta property="og:url" content="${self}" />`,
    `<meta property="og:image" content="${og}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:locale" content="${lang === 'en' ? 'en_US' : 'zh_CN'}" />`,
    `<meta property="og:locale:alternate" content="${lang === 'en' ? 'zh_CN' : 'en_US'}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(m.title)}" />`,
    `<meta name="twitter:description" content="${esc(m.ogDesc || m.desc)}" />`,
    `<meta name="twitter:image" content="${og}" />`,
    ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : '',
    `<script>${LANG_SCRIPT}</script>`,
  ];
  return lines.filter(Boolean).join('\n');
}

/** 跳转存根（同语言）：meta refresh + canonical → 目标页 + noindex,follow。 */
export function renderRedirectStub(fromId, toId, lang) {
  const to = href(lang, toId);
  const abs = canonical(lang, toId);
  const zh = lang !== 'en';
  return `<!doctype html>
<html lang="${htmlLang(lang)}" data-lang="${lang}" data-page="${fromId}" data-redirect="${to}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="refresh" content="0;url=${to}" />
<meta name="robots" content="noindex, follow" />
<link rel="canonical" href="${abs}" />
<title>${zh ? '页面已合并 → 预售与候补名单' : 'Page merged → Pre-order & waitlist'}</title>
<style>body{margin:0;background:#141414;color:#fafafa;font:16px/1.5 Inter,-apple-system,'PingFang SC','Microsoft YaHei',system-ui,sans-serif;display:grid;place-items:center;min-height:100vh}a{color:#2DD4BF}</style>
</head>
<body>
<p>${zh ? '此页面已并入' : 'This page has moved to'} <a href="${to}">${abs}</a></p>
</body>
</html>
`;
}
