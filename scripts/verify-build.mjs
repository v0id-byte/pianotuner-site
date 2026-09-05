#!/usr/bin/env node
// 构建产物校验（V0 静态层）。既可作为 CLI（verify-build.mjs <dir>），也可被 publish-build.mjs
// 直接 import —— 后者需要在删除备份之前就地校验根目录，否则 verify:root 只是验尸。
//
// 断言清单见 CLAUDE.md「构建门禁」。manifest 是「验证通过」的凭证，只在全部断言通过后写出，
// 且只写在 stage（.build-manifest.json，dotfile，永不进仓库根、永不部署）。
import { readdirSync, statSync, existsSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { join, relative, extname, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { PAGES, REDIRECTS, LANGS, GENERATED, STAGE_ONLY, ORIGIN_ONLY, MANIFEST, SITE, STAGE_DIR, assertNode24 } from './paths.mjs';

const SKIP_DIRS = new Set(['node_modules', '.git', '.claude', 'app', 'source-assets', 'scripts', 'build-stage', '.ssr-stage', '.publish-backup']);

/** Gate F 内容红线（website-public-claims.md 在 vault 里；这里是它的构建期投影）。 */
export const FORBIDDEN_STRINGS = [
  { pattern: /±\s*1\s*(音分|cents?|¢)/i, why: '±1 音分（内部目标，prohibited）' },
  { pattern: /±\s*0\.5\b/, why: '±0.5（prohibited）' },
  { pattern: /±\s*0\.01\b/, why: '±0.01（prohibited）' },
  { pattern: /±\s*0\.1\b/, why: '±0.1（robots 仍 Disallow 的旧 URL 口径）' },
  { pattern: /±\s*4\s*(音分|cents?|¢)/i, why: '±4（与 ±2 冲突，未决）' },
  { pattern: /\bGM\s?-?28/i, why: '电机型号' },
  { pattern: /\bAS\s?-?5047/i, why: '编码器型号' },
  { pattern: /\bDRV\s?-?8316/i, why: '驱动芯片型号' },
  { pattern: /\bESP32/i, why: 'MCU 型号' },
  { pattern: /\b125\s*:\s*1\b/, why: '减速比' },
  { pattern: /\b5\.39\s*N/i, why: '额定扭矩' },
  { pattern: /\b24\s*N\s*[·.]?\s*m\b/i, why: '峰值扭矩' },
  { pattern: /202610321775/, why: '专利申请号（只写「已进入发明专利申请程序」）' },
  { pattern: /Quick\s*Check/i, why: '已撤下的功能名（孤证）' },
  { pattern: /每年节省|save[^.]{0,40}per year/i, why: 'ROI 省钱叙事（已改产能/护腕/可委派）' },
  { pattern: /溢价\s*20|20\s*[–-]\s*50\s*%/, why: '服务溢价 20–50%（无来源）' },
  { pattern: /液态声学|美谱声学/, why: '已废弃的名称' },
  { pattern: /粤ICP备|公网安备/, why: '占位备案号' },
  { pattern: /PHOTO PLACEHOLDER/i, why: '占位文本' },
  { pattern: /fonts\.googleapis|fonts\.gstatic|cdnjs\.cloudflare|jsdelivr|unpkg\.com/i, why: '公共 CDN / Google Fonts（大陆不可达）' },
  { pattern: /website-public-claims/, why: 'claims 文件名不得进入公开面' },
  { pattern: /LAB-TESTED\s*±/, why: '跑马灯 / 标签里不得出现带精度数字的状态语义标签' },
  { pattern: /一次性买断|buy once, own it|终身授权|永久 CDK/i, why: 'Pro 是年度订阅，买断口径 deprecated' },
  { pattern: /Qin Liuhaoran/, why: '旧拼音署名（应为 Soren Qin）' },
];

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const n of readdirSync(dir)) {
    if (SKIP_DIRS.has(n) || n.startsWith('.')) continue;
    const f = join(dir, n);
    if (statSync(f).isDirectory()) walk(f, acc);
    else acc.push(f);
  }
  return acc;
}

const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};

export function verifyBuild(dir, { writeManifest = true, prevManifest = null } = {}) {
  const isRoot = dir === '.';
  const p = (...x) => join(dir, ...x);
  const fail = [];
  const note = (s) => fail.push(s);

  // 1. 24 个 HTML 恰好存在；<html> 属性与目录一致
  const expected = [];
  for (const lang of LANGS) {
    const sub = lang === 'en' ? 'en' : '';
    for (const id of PAGES) expected.push({ lang, id, rel: join(sub, `${id}.html`), stub: false });
    for (const id of Object.keys(REDIRECTS)) expected.push({ lang, id, rel: join(sub, `${id}.html`), stub: true });
  }
  const htmlFiles = walk(dir).filter((f) => extname(f) === '.html').map((f) => relative(dir, f));
  const expectedSet = new Set(expected.map((e) => e.rel));
  for (const h of htmlFiles) if (!expectedSet.has(h)) note(`多出来的 HTML: ${h}`);
  for (const e of expected) {
    const f = p(e.rel);
    if (!existsSync(f)) { note(`缺少 ${e.rel}`); continue; }
    const html = readFileSync(f, 'utf8');
    const htmlTag = (html.match(/<html[^>]*>/) || [''])[0];
    const wantLang = e.lang === 'en' ? 'en' : 'zh-CN';
    if (attr(htmlTag, 'lang') !== wantLang) note(`${e.rel}: <html lang> 应为 ${wantLang}`);
    if (attr(htmlTag, 'data-lang') !== e.lang) note(`${e.rel}: data-lang 应为 ${e.lang}`);
    if (!/<title>[^<]+<\/title>/.test(html)) note(`${e.rel}: 没有 <title>`);
    if (e.stub) {
      const to = (e.lang === 'en' ? '/en/' : '/') + `${REDIRECTS[e.id]}.html`;
      if (!html.includes(`content="0;url=${to}"`)) note(`${e.rel}: 存根应跳到 ${to}`);
      if (!/name="robots" content="noindex, follow"/.test(html)) note(`${e.rel}: 存根缺 noindex,follow`);
      if (!html.includes(`<link rel="canonical" href="${SITE.origin}${to}"`)) note(`${e.rel}: 存根 canonical 应指向 ${to}`);
      continue;
    }
    if (attr(htmlTag, 'data-page') !== e.id) note(`${e.rel}: data-page 应为 ${e.id}`);
    if (attr(htmlTag, 'data-ssr') !== '1') note(`${e.rel}: 预渲染页 data-ssr 应为 1`);
    const path = (l) => (l === 'en' ? '/en/' : '/') + (e.id === 'index' ? '' : `${e.id}.html`);
    const alt = attr(htmlTag, 'data-alt-url');
    if (alt !== path(e.lang === 'en' ? 'zh' : 'en')) note(`${e.rel}: data-alt-url 应为 ${path(e.lang === 'en' ? 'zh' : 'en')}，实际 ${alt}`);
    // 2. canonical = self；hreflang 三条闭合
    const self = SITE.origin + path(e.lang);
    if (!html.includes(`<link rel="canonical" href="${self}"`)) note(`${e.rel}: canonical 应为 ${self}`);
    if (!html.includes(`hreflang="zh-CN" href="${SITE.origin + path('zh')}"`)) note(`${e.rel}: hreflang zh-CN 不闭合`);
    if (!html.includes(`hreflang="en" href="${SITE.origin + path('en')}"`)) note(`${e.rel}: hreflang en 不闭合`);
    if (!html.includes(`hreflang="x-default" href="${SITE.origin + path('zh')}"`)) note(`${e.rel}: x-default 应指向中文`);
    // 3. 本地引用按 stage 根解析；ORIGIN_ONLY 视为已知外部
    for (const m of html.matchAll(/(?:src|href)="(\/[^"#?]+)"/g)) {
      const ref = m[1].replace(/^\//, '');
      if (!ref || ref.startsWith('en/') && !ref.endsWith('.html')) continue;
      const top = ref.split('/')[0];
      if (ORIGIN_ONLY.includes(top) || ORIGIN_ONLY.includes(ref)) continue;
      if (!existsSync(p(ref)) && !existsSync(p(ref, 'index.html'))) note(`${e.rel}: 悬空引用 /${ref}`);
    }
    // 4. 站内链接绝对化
    for (const m of html.matchAll(/(?:href|src)="([^"]*)"/g)) {
      const v = m[1];
      if (/^(https?:|mailto:|tel:|#|\/|data:)/.test(v) || v === '') continue;
      note(`${e.rel}: 相对链接 "${v}"（站内链接必须绝对）`);
    }
    // 5. hero <video>：有 data-src-mp4、无 src，且文件真实存在
    for (const v of html.matchAll(/<video[^>]*>/g)) {
      const tag = v[0];
      if (/\ssrc=/.test(tag) && !/controls/.test(tag)) note(`${e.rel}: hero <video> 不得带 src`);
      const ds = attr(tag, 'data-src-mp4');
      if (ds && !existsSync(p(ds.replace(/^\//, '')))) note(`${e.rel}: data-src-mp4 指向不存在的 ${ds}`);
    }
    // 6. 精度条件规则（只对最终 HTML）：含 ±2 的页面必须有且仅有一个 #precision-note，每处 ±2 紧跟角标
    const body = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '').replace(/<head>[\s\S]*?<\/head>/, '');
    const hits = [...body.matchAll(/±\s*2\s*(音分|cents?|¢|<)/g)];
    if (hits.length) {
      const notes = (body.match(/id="precision-note"/g) || []).length;
      if (notes !== 1) note(`${e.rel}: 含 ±2 但 #precision-note 出现 ${notes} 次（须恰好 1 次）`);
      if (!/实验室测试结果/.test(body) && !/laboratory test result/i.test(body)) note(`${e.rel}: 脚注缺「实验室测试结果」`);
      if (!/最终性能以量产版本的?验证结果为准/.test(body) && !/verified on the production version|production version verifies/i.test(body)) note(`${e.rel}: 脚注缺量产验证限定语`);
      for (const h of hits) {
        const after = body.slice(h.index, h.index + 160);
        const inNote = body.lastIndexOf('id="precision-note"', h.index) > body.lastIndexOf('</p>', h.index);
        if (!inNote && !/<sup class="fn-ref"><a href="#precision-note"/.test(after)) note(`${e.rel}: 裸写 ±2（无角标）: …${after.replace(/<[^>]+>/g, '').slice(0, 40)}…`);
      }
    }
    // 7. JSON-LD 可解析且无 offers / availability
    for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
      try {
        const ld = JSON.parse(m[1]);
        const s = JSON.stringify(ld);
        if (/"offers"|"availability"/.test(s)) note(`${e.rel}: JSON-LD 不得声明 offers/availability（无真实预售）`);
      } catch { note(`${e.rel}: JSON-LD 不是合法 JSON`); }
    }
    // 8. 运行时不引用 .json（nginx deny）
    if (/fetch\([^)]*\.json/.test(html) || /(src|href)="[^"]+\.json"/.test(html)) note(`${e.rel}: 引用了 .json（origin nginx 对 *.json 返回 404）`);
  }

  // 9. stage 顶层集合 == GENERATED ∪ STAGE_ONLY（多一个少一个都失败）—— 只对 stage 做
  if (!isRoot) {
    const top = readdirSync(dir);
    const allowed = new Set([...GENERATED, ...STAGE_ONLY]);
    for (const t of top) if (!allowed.has(t)) note(`stage 顶层多出未登记项: ${t}`);
    for (const g of GENERATED) if (!existsSync(p(g))) note(`stage 缺少 GENERATED 项: ${g}`);
  }

  // 10. 泄漏与红线（html/js/css/txt/xml 全扫，死代码里的旧 claims 也不许进 bundle）
  const files = walk(dir);
  for (const f of files) {
    const rel = relative(dir, f);
    if (extname(rel) === '.ttf') note(`原始字体泄漏: ${rel}`);
    if (/\.source\./.test(rel)) note(`原始素材泄漏: ${rel}`);
  }
  const textFiles = files.filter((f) => /\.(html|js|css|txt|xml)$/.test(f));
  for (const f of textFiles) {
    const body = readFileSync(f, 'utf8');
    for (const { pattern, why } of FORBIDDEN_STRINGS) {
      if (pattern.test(body)) note(`禁用内容出现在 ${relative(dir, f)}：${why}`);
    }
    if (/\.json["')]/.test(body) && /\.js$/.test(f) && /fetch\([^)]*\.json/.test(body)) note(`${relative(dir, f)}: 运行时 fetch .json`);
  }

  // 11. 体积预算：入口 JS gzip ≤ 220KB
  for (const f of files.filter((x) => /assets\/index-[^/]+\.js$/.test(x))) {
    const gz = gzipSync(readFileSync(f)).length / 1024;
    if (gz > 220) note(`${relative(dir, f)} gzip ${gz.toFixed(1)}KB 超过 220KB 预算`);
  }

  // 12. 视频不可变：与上一份 manifest 比，同名视频 sha256 变了就失败
  const manifest = {};
  for (const g of GENERATED) {
    const target = p(g);
    if (!existsSync(target)) continue;
    const list = statSync(target).isDirectory() ? walk(target) : [target];
    for (const f of list) manifest[relative(dir, f)] = createHash('sha256').update(readFileSync(f)).digest('hex');
  }
  const prev = prevManifest || (existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : null);
  if (prev) {
    for (const [k, v] of Object.entries(manifest)) {
      if (/\.(mp4|webm)$/.test(k) && prev[k] && prev[k] !== v) note(`视频 ${k} 内容变了但文件名没变（Range 缓存会拼接新旧字节）——换文件名`);
    }
  }

  if (fail.length) {
    if (!isRoot) rmSync(p(MANIFEST), { force: true });
    return { ok: false, failures: fail, manifest: null };
  }
  if (writeManifest && !isRoot) writeFileSync(p(MANIFEST), JSON.stringify(manifest, null, 2) + '\n');
  return { ok: true, failures: [], manifest };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  assertNode24();
  const dir = process.argv[2];
  if (!dir) { console.error('用法: verify-build.mjs <dir>'); process.exit(2); }
  const { ok, failures, manifest } = verifyBuild(dir);
  if (!ok) {
    console.error(`verify-build(${dir}): 失败`);
    for (const f of failures) console.error('  ✗ ' + f);
    process.exit(1);
  }
  console.log(`verify-build(${dir}): ok — 已校验 ${Object.keys(manifest).length} 个产物`);
}
