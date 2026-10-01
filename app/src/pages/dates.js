// 页面日期语义（2026-10-01 定）。三个字段各管一件事，别混用：
//   published  首次发布                                                    → Article datePublished
//   updated    正文 / 实质内容最后一次修改（编辑意义；改事实、改引用也算）      → Article dateModified
//   lastmod    对搜索引擎有意义的最后一次页面变化（正文、结构化数据、重要链接）  → sitemap <lastmod>
// 改颜色、动效、间距、纯部署：三个都不动。只改 schema 或新增重要内链：只动 lastmod。
// 缺省：lastmod ← updated ← published。prerender 与 verify-build 都会拦不合法的组合。

/** Nav / Footer 等全站共用链接最后一次变化的日期：所有页面 lastmod 的下限。改全站链接时改这里。 */
export const SITE_LINKS_CHANGED = '2026-10-01';

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function pageDates(id, meta) {
  const published = meta.published;
  const updated = meta.updated || published;
  const own = meta.lastmod || updated;
  const lastmod = own > SITE_LINKS_CHANGED ? own : SITE_LINKS_CHANGED;
  for (const [k, v] of Object.entries({ published, updated, lastmod })) {
    if (!ISO.test(v || '')) throw new Error(`${id}: ${k} 必须是 YYYY-MM-DD（实际 ${v}）`);
  }
  if (!(published <= updated && updated <= lastmod)) {
    throw new Error(`${id}: 须满足 published(${published}) <= updated(${updated}) <= lastmod(${lastmod})`);
  }
  return { published, updated, lastmod };
}
