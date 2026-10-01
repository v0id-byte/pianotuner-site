#!/usr/bin/env node
// 构建期预渲染：PAGES × 2 语言 -> build-stage/x.html 与 build-stage/en/x.html，
// 外加 REDIRECTS 跳转存根 × 2、ERROR_PAGES（nginx error_page body）× 2 与 sitemap.xml。
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { PAGES, REDIRECTS, ERROR_PAGES, LANGS, SITE, STAGE_DIR, SSR_DIR, assertNode24 } from './paths.mjs';

assertNode24();
const tplPath = join(STAGE_DIR, 'index.html');
if (!existsSync(tplPath)) { console.error('prerender: 没有 build-stage/index.html —— 先跑 vite build'); process.exit(1); }
// 模板先读进内存：它既是模板又是输出之一
const template = readFileSync(tplPath, 'utf8');
if (!template.includes('<!--app-head-->') || !template.includes('<!--app-html-->')) {
  console.error('prerender: 模板缺少占位注释'); process.exit(1);
}
const ssrEntry = join(SSR_DIR, 'entry-server.js');
if (!existsSync(ssrEntry)) { console.error('prerender: 没有 .ssr-stage/entry-server.js —— 先跑 vite build --ssr'); process.exit(1); }
const { render, renderRedirectStub, PAGES_BY_ID, pageDates } = await import(pathToFileURL(ssrEntry).href);

const pathFor = (lang, page) => (lang === 'en' ? '/en/' : '/') + (page === 'index' ? '' : `${page}.html`);
const urls = [];
let n = 0;
for (const lang of LANGS) {
  const dir = lang === 'en' ? join(STAGE_DIR, 'en') : STAGE_DIR;
  mkdirSync(dir, { recursive: true });
  for (const id of [...PAGES, ...ERROR_PAGES]) {
    const a = render(id, lang);
    const b = render(id, lang);
    if (a.html !== b.html || a.head !== b.head) {
      console.error(`prerender: ${id}/${lang} 两次渲染结果不同（非确定性：Date.now / Math.random / 模块态？）`);
      process.exit(1);
    }
    if (!a.html.trim()) { console.error(`prerender: ${id}/${lang} 渲染为空`); process.exit(1); }
    const out = template
      .replace(/<html[^>]*>/, `<html ${a.htmlAttrs}>`)
      .replace('<!--app-head-->', a.head)
      .replace('<!--app-html-->', a.html);
    writeFileSync(join(dir, `${id}.html`), out);
    if (PAGES.includes(id)) urls.push({ lang, id, head: a.head });
    n++;
  }
  for (const [from, to] of Object.entries(REDIRECTS)) {
    writeFileSync(join(dir, `${from}.html`), renderRedirectStub(from, to, lang));
    n++;
  }
}

// 日期：只来自页面 meta（dates.js 的语义），绝不用构建日期。这里拦不合法的组合与「未来日期」，
// 并核对 Article 的 datePublished / dateModified 与 meta 一致。
const today = new Date().toLocaleDateString('sv-SE'); // 本地日期 YYYY-MM-DD（UTC 在东八区早上会落到前一天）
const dates = {};
for (const id of PAGES) {
  try { dates[id] = pageDates(id, PAGES_BY_ID[id].meta); } catch (e) { console.error(`prerender: ${e.message}`); process.exit(1); }
  if (dates[id].lastmod > today) { console.error(`prerender: ${id} lastmod ${dates[id].lastmod} 晚于今天 ${today}`); process.exit(1); }
}
for (const { lang, id, head } of urls) {
  for (const m of head.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const ld = JSON.parse(m[1]);
    for (const node of ld['@graph'] || [ld]) {
      if (node['@type'] !== 'Article') continue;
      if (node.datePublished !== dates[id].published || node.dateModified !== dates[id].updated) {
        console.error(`prerender: ${id}/${lang} Article 日期 ${node.datePublished}/${node.dateModified} ≠ meta ${dates[id].published}/${dates[id].updated}`);
        process.exit(1);
      }
    }
  }
}

// sitemap：全部真实页 × 2 语言，互相 alternate。不输出 priority / changefreq（Google 忽略）。
const entries = urls.map(({ lang, id }) => {
  const loc = SITE.origin + pathFor(lang, id);
  const alt = LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l === 'en' ? 'en' : 'zh-CN'}" href="${SITE.origin + pathFor(l, id)}" />`).join('\n');
  return `  <url>\n    <loc>${loc}</loc>\n${alt}\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE.origin + pathFor('zh', id)}" />\n    <lastmod>${dates[id].lastmod}</lastmod>\n  </url>`;
});
writeFileSync(join(STAGE_DIR, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${entries.join('\n')}\n</urlset>\n`);

rmSync(SSR_DIR, { recursive: true, force: true });
console.log(`prerender: 写出 ${n} 个 HTML（${PAGES.length}×${LANGS.length} 页 + ${Object.keys(REDIRECTS).length}×${LANGS.length} 存根 + ${ERROR_PAGES.length}×${LANGS.length} 错误页）+ sitemap.xml`);
