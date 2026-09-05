#!/usr/bin/env node
// source-assets/fonts/NotoSansSC.ttf -> app/public/fonts/NotoSansSC-subset.woff2
// Inter：直接复用已切好的变量字体（@fontsource 拉丁子集），不再用 pyftsubset 切变量 TTF
//（有把字重轴压平、让 t-display 300 失效的风险）。
// 码点从 app/src/** + app/index.html 收割，作为 build 第一步自动执行；剥注释再收割
//（注释里的中文会把字形打进子集，melspectrum 实测多 50KB）。
import { execFileSync } from 'node:child_process';
import { readFileSync, copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { assertNode24 } from './paths.mjs';

assertNode24();
const SRC = 'source-assets/fonts';
const OUT = 'app/public/fonts';
const SCAN_DIRS = ['app/src'];
const SCAN_FILES = ['app/index.html'];
const WARN_KB = 200;
const FAIL_KB = 320;

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (['.jsx', '.js', '.css', '.html'].includes(extname(p))) acc.push(p);
  }
  return acc;
}
const stripComments = (src) =>
  src.replace(/\/\*[\s\S]*?\*\//g, ' ')
     .replace(/^\s*\/\/.*$/gm, ' ')
     .replace(/\{\/\*[\s\S]*?\*\/\}/g, ' ')
     .replace(/<!--[\s\S]*?-->/g, ' ');

const files = [...SCAN_DIRS.flatMap((d) => walk(d)), ...SCAN_FILES.filter((f) => existsSync(f))];
let text = files.map((f) => stripComments(readFileSync(f, 'utf8'))).join('');
text += ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
text += '·—–…※、。，：；！？（）〈〉《》「」『』【】〔〕±≈≠≤≥×÷°′″¢€£¥©®™→←↑↓↗↘⬡κ♪♭♯';

const cjk = new Set();
for (const ch of text) { const cp = ch.codePointAt(0); if (cp > 0x2e7f) cjk.add(cp); }

mkdirSync(OUT, { recursive: true });
copyFileSync(join(SRC, 'Inter-var.woff2'), join(OUT, 'Inter-var.woff2'));
console.log(`subset-fonts: Inter-var.woff2 复制（${(statSync(join(OUT, 'Inter-var.woff2')).size / 1024).toFixed(1)} KB）`);

const unicodes = [...cjk].map((c) => c.toString(16)).join(',');
const out = join(OUT, 'NotoSansSC-subset.woff2');
execFileSync('pyftsubset', [
  join(SRC, 'NotoSansSC.ttf'),
  `--output-file=${out}`,
  '--flavor=woff2',
  `--unicodes=${unicodes}`,
  '--layout-features=kern,liga,calt,ccmp,locl',
  '--no-hinting',
  '--desubroutinize',
], { stdio: 'inherit' });
const kb = statSync(out).size / 1024;
console.log(`subset-fonts: 收割 ${cjk.size} 个 CJK 码点（${files.length} 个文件）→ NotoSansSC-subset.woff2 ${kb.toFixed(1)} KB`);
if (kb > FAIL_KB) {
  console.error(`subset-fonts: 超过 ${FAIL_KB} KB 上限 —— 回退到系统 CJK 字体（去掉 @font-face 与 preload）`);
  process.exit(1);
}
if (kb > WARN_KB) console.warn(`subset-fonts: WARNING 超过 ${WARN_KB} KB 预算`);
