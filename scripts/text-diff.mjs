#!/usr/bin/env node
// 文案搬运比对：把旧页（git 里 pre-vite-static 的 .zh/.en span）与新页（x.html / en/x.html）的正文
// 剥标签后按句子比对，逐句报增删。文案搬运是本次改版最高风险的任务：限定语极易丢。
// 用法: node scripts/text-diff.mjs <page> [--lang zh|en] [--dir build-stage]
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const page = args.find((a) => !a.startsWith('--'));
if (!page) { console.error('用法: text-diff.mjs <page> [--lang zh|en] [--dir build-stage]'); process.exit(2); }
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const langs = opt('--lang') ? [opt('--lang')] : ['zh', 'en'];
const dir = opt('--dir', 'build-stage');

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/&copy;/g, '©');
const sentences = (text) => new Set(
  decode(text).replace(/\s+/g, ' ').split(/(?<=[。！？.!?])\s*/).map((s) => s.trim()).filter((s) => s.length > 6),
);

function oldText(lang) {
  let html;
  try { html = execFileSync('git', ['show', `pre-vite-static:${page}.html`], { encoding: 'utf8' }); }
  catch { return null; }
  html = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  const other = lang === 'zh' ? 'en' : 'zh';
  html = html.replace(new RegExp(`<span class="${other}">[\\s\\S]*?</span>`, 'g'), ' ');
  return html.replace(/<[^>]+>/g, ' ');
}
function newText(lang) {
  const f = join(dir, lang === 'en' ? 'en' : '', `${page}.html`);
  if (!existsSync(f)) return null;
  let html = readFileSync(f, 'utf8');
  html = html.replace(/<head>[\s\S]*?<\/head>/, '').replace(/<script[\s\S]*?<\/script>/g, '');
  return html.replace(/<[^>]+>/g, ' ');
}

// 归一化：去掉全部标点/空白/引号差异后做包含判断，只报真正丢失的内容
const norm = (s) => decode(s).replace(/[\s\p{P}\p{S}]/gu, '').toLowerCase();
let bad = 0;
for (const lang of langs) {
  const a = oldText(lang);
  const b = newText(lang);
  if (a === null || b === null) { console.log(`[${page}/${lang}] 缺少旧页或新页，跳过`); continue; }
  const A = sentences(a);
  const B = sentences(b);
  const nb = norm(b);
  const na = norm(a);
  const removed = [...A].filter((s) => !nb.includes(norm(s)));
  const added = [...B].filter((s) => !na.includes(norm(s)));
  console.log(`\n=== ${page} / ${lang}：旧 ${A.size} 句 · 新 ${B.size} 句 · 删 ${removed.length} · 增 ${added.length} ===`);
  for (const s of removed) console.log('  - ' + s.slice(0, 140));
  for (const s of added) console.log('  + ' + s.slice(0, 140));
  bad += removed.length;
}
process.exit(0);
