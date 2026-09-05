#!/usr/bin/env node
// 事务式部署到 origin（root@192.255.139.83:/var/www/html-pianotuner）。
// 默认 dry-run，--apply 才执行。只走 DEPLOY 显式清单，全链无 rsync。
//
//  0. 预检：工作树干净、verify:root 通过、ssh 可达
//  1. tar 备份 + tar -tzf 验证 + df 空间预检 + 记录 ORIGIN_ONLY sha256
//  2. 上传整个 DEPLOY 到 /var/www/releases/pianotuner-<ts>/（先 hashed 资产，再 HTML）
//     release 内逐文件 sha256 == 本地；ORIGIN_ONLY 以 symlink 接入 legacy 目录
//  3. 原子切换：/var/www/html-pianotuner -> release（首次先把现目录 mv 成 releases/pianotuner-legacy）
//  4. 任一步失败 → 从 tar 恢复；保留最近 3 个 release
//  5. 在线验收由 --verify 单独跑（也在 --apply 末尾自动跑）
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { DEPLOY, ORIGIN_ONLY, PAGES, REDIRECTS, LANGS, SITE, assertNode24 } from './paths.mjs';
import { verifyBuild } from './verify-build.mjs';

assertNode24();
const HOST = 'root@192.255.139.83';
const ROOT = '/var/www/html-pianotuner';
const RELEASES = '/var/www/releases';
const LEGACY = `${RELEASES}/pianotuner-legacy`;
const BACKUPS = '/root/backups';
// 旧存档页：移出 docroot，nginx 返回 410（robots 不是访问控制）
const GONE = ['refined_buy.html', 'pro-backup-20260317.html', '钢琴调音机器人 | 自动调音 ±0.1精度 - Piano Tuner.html'];
const APPLY = process.argv.includes('--apply');
const VERIFY_ONLY = process.argv.includes('--verify');
const ts = new Date().toISOString().replace(/[-:]/g, '').replace(/\..*/, '').replace('T', '-');
const REL = `${RELEASES}/pianotuner-${ts}`;

const sh = (cmd, opts = {}) => execFileSync('ssh', ['-o', 'BatchMode=yes', HOST, cmd], { encoding: 'utf8', ...opts });
const log = (s) => console.log(`deploy: ${s}`);
const die = (s) => { console.error(`deploy: ✗ ${s}`); process.exit(1); };

function walk(dir, acc = []) {
  for (const n of readdirSync(dir)) {
    const f = join(dir, n);
    if (statSync(f).isDirectory()) walk(f, acc); else acc.push(f);
  }
  return acc;
}
const sha = (f) => createHash('sha256').update(readFileSync(f)).digest('hex');

// ---------- 在线验收 ----------
async function verifyLive(releaseSha) {
  const fails = [];
  const urls = [];
  for (const l of LANGS) for (const p of PAGES) urls.push((l === 'en' ? '/en/' : '/') + (p === 'index' ? '' : `${p}.html`));
  const stubs = [];
  for (const l of LANGS) for (const p of Object.keys(REDIRECTS)) stubs.push((l === 'en' ? '/en/' : '/') + `${p}.html`);
  const KNOWN = [/\/cdn-cgi\/l\/email-protection/, /email-decode\.min\.js/, /cloudflareinsights|beacon\.min\.js/];
  for (const u of urls) {
    const r = await fetch(`${SITE.origin}${u}?v=${ts}`, { headers: { 'Cache-Control': 'no-cache' } });
    if (r.status !== 200) { fails.push(`${u} → ${r.status}`); continue; }
    const body = await r.text();
    const rel = u === '/' ? 'index.html' : u === '/en/' ? 'en/index.html' : u.slice(1);
    const cfs = r.headers.get('cf-cache-status');
    if (releaseSha[rel] && createHash('sha256').update(body).digest('hex') !== releaseSha[rel]) {
      // 允许已知的 edge transform：去掉它们再比
      const stripped = body.replace(/<script[^>]*email-decode[^>]*><\/script>/g, '').replace(/<script[^>]*cloudflareinsights[^>]*><\/script>/g, '');
      const local = readFileSync(rel, 'utf8');
      // Cloudflare 把 <a href="mailto:x"> x </a> 改写成 <a href="/cdn-cgi/l/email-protection#…"><span class="__cf_email__" …>[email protected]</span></a>，
      // 标记在内层 span 上，所以整段 <a …>…</a> 一起归一化成 MAILTO（两边同样处理）。
      const onlyKnown = stripped.replace(/<a[^>]*href="\/cdn-cgi\/l\/email-protection[^"]*"[^>]*>[\s\S]*?<\/a>/g, 'MAILTO').replace(/<span class="__cf_email__"[^>]*>[\s\S]*?<\/span>/g, 'MAILTO');
      const localNorm = local.replace(/<a[^>]*href="mailto:[^"]*"[^>]*>[\s\S]*?<\/a>/g, 'MAILTO');
      if (onlyKnown.replace(/\s+/g, '') !== localNorm.replace(/\s+/g, '')) {
        fails.push(`${u} Cloudflare 响应 ≠ origin（cf-cache-status=${cfs}）——可能命中旧缓存，需 purge`);
      }
    }
  }
  for (const u of stubs) {
    const r = await fetch(`${SITE.origin}${u}?v=${ts}`);
    const body = await r.text();
    if (r.status !== 200 || !/http-equiv="refresh"/.test(body)) fails.push(`存根 ${u} → ${r.status}`);
  }
  for (const u of ['/sitemap.xml', '/robots.txt']) {
    const r = await fetch(`${SITE.origin}${u}?v=${ts}`);
    if (r.status !== 200) fails.push(`${u} → ${r.status}`);
  }
  const api = await fetch(`${SITE.origin}/api/pianotuner/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (api.status === 404 || api.status >= 500) fails.push(`/api/pianotuner/subscribe → ${api.status}`);
  for (const range of ['bytes=0-1023', 'bytes=900000-901023']) {
    const r = await fetch(`${SITE.origin}/assets/video/hero-v20m-v2.mp4`, { headers: { Range: range } });
    if (r.status !== 206) fails.push(`视频 Range ${range} → ${r.status}（应为 206）`);
    else {
      const buf = Buffer.from(await r.arrayBuffer());
      const [a, b] = range.slice(6).split('-').map(Number);
      const local = readFileSync('assets/video/hero-v20m-v2.mp4').subarray(a, b + 1);
      if (!buf.equals(local)) fails.push(`视频 Range ${range} 字节与本地不一致`);
    }
  }
  for (const u of GONE.map((g) => '/' + encodeURIComponent(g))) {
    const r = await fetch(`${SITE.origin}${u}`);
    if (r.status !== 410 && r.status !== 404) fails.push(`${u} → ${r.status}（应为 410）`);
  }
  return fails;
}

if (VERIFY_ONLY) {
  const fails = await verifyLive({});
  if (fails.length) { for (const f of fails) console.error('  ✗ ' + f); process.exit(1); }
  log('在线验收通过'); process.exit(0);
}

// ---------- 0. 预检 ----------
const dirty = execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim();
if (dirty && APPLY) die('工作树不干净，先提交或 stash');
const v = verifyBuild('.', { writeManifest: false });
if (!v.ok) die('verify:root 未通过:\n  ' + v.failures.join('\n  '));
const files = DEPLOY.flatMap((d) => (existsSync(d) ? (statSync(d).isDirectory() ? walk(d) : [d]) : []));
const localSha = Object.fromEntries(files.map((f) => [f, sha(f)]));
log(`清单 ${DEPLOY.length} 项 / ${files.length} 个文件（${(files.reduce((n, f) => n + statSync(f).size, 0) / 1024 / 1024).toFixed(1)} MB）`);
try { sh('true'); } catch { die('ssh 不可达'); }
const isLink = sh(`[ -L ${ROOT} ] && echo link || echo dir`).trim();
log(`origin ${ROOT} 当前是 ${isLink === 'link' ? 'symlink → ' + sh(`readlink ${ROOT}`).trim() : '真实目录（首次切换会先搬成 legacy）'}`);
if (!APPLY) {
  console.log('\n--- dry-run：将上传以下顶层项 ---');
  for (const d of DEPLOY) console.log('  ' + d);
  console.log(`--- ORIGIN_ONLY（只做 symlink 接入 + sha256 不变断言）：${ORIGIN_ONLY.join(', ')}`);
  console.log('\n加 --apply 执行。');
  process.exit(0);
}

// ---------- 1. 备份 ----------
const tarName = `${BACKUPS}/html-pianotuner-${ts}.tgz`;
sh(`mkdir -p ${BACKUPS} ${RELEASES} && tar czf ${tarName} -C $(dirname $(readlink -f ${ROOT})) $(basename $(readlink -f ${ROOT})) && tar -tzf ${tarName} > /dev/null`);
log(`备份 ${tarName} 已验证可读`);
const avail = +sh(`df -B1 --output=avail /var/www | tail -1`).trim();
if (avail < 500 * 1024 * 1024) die('磁盘剩余不足 500MB');
// 切换过一次之后 ROOT 里的 ORIGIN_ONLY 项都是指向 legacy 的 symlink，必须 -L 跟进去，否则指纹是空输入的哈希（第二次部署 2026-09-05 踩到）
const originOnlyBefore = sh(`cd ${ROOT} && for f in ${ORIGIN_ONLY.join(' ')}; do [ -e "$f" ] && (find -L "$f" -type f -exec sha256sum {} + | sort) ; done | sha256sum`).trim();
log(`ORIGIN_ONLY 指纹 ${originOnlyBefore.slice(0, 16)}…`);

// 切换前的目标：切换过就是当前 release，首次切换是搬成 legacy 的原目录。失败时先把 docroot 切回去，再删新 release
//（2026-09-05 第二次部署踩到：先删 release 再不管 symlink，站点直接 404）。
const prevTarget = isLink === 'link' ? sh(`readlink -f ${ROOT}`).trim() : LEGACY;
let switched = false;
function rollback(why) {
  console.error(`deploy: 失败 —— ${why}，正在恢复`);
  try {
    if (switched) {
      sh(`ln -sfn ${prevTarget} ${ROOT}.new && mv -T ${ROOT}.new ${ROOT}`);
      console.error(`deploy: docroot 已切回 ${prevTarget}`);
    }
    sh(`rm -rf ${REL}`);
    console.error(`deploy: release 目录已清理${switched ? '' : '，docroot 未被触碰'}`);
  } catch (e) {
    console.error(`deploy: 恢复失败：${e.message}。备份在 ${tarName}，请人工处理`);
  }
  process.exit(1);
}

try {
  // ---------- 2. 上传 release ----------
  sh(`mkdir -p ${REL}`);
  const order = [...DEPLOY.filter((d) => /^(assets|fonts|images)$/.test(d)), ...DEPLOY.filter((d) => !/^(assets|fonts|images)$/.test(d))];
  for (const d of order) {
    execFileSync('scp', ['-q', '-r', d, `${HOST}:${REL}/`], { stdio: 'inherit' });
  }
  const remote = sh(`cd ${REL} && find . -type f -exec sha256sum {} + `).trim().split('\n');
  const remoteSha = Object.fromEntries(remote.map((l) => { const [h, f] = l.split(/\s+/); return [f.replace(/^\.\//, ''), h]; }));
  for (const [f, h] of Object.entries(localSha)) if (remoteSha[f] !== h) throw new Error(`release 内 ${f} sha256 不一致`);
  for (const f of Object.keys(remoteSha)) if (!localSha[f]) throw new Error(`release 内多出 ${f}`);
  log(`release ${REL} 逐文件 sha256 一致（${files.length} 个）`);
  // legacy 里所有不在 DEPLOY 清单、也不在 GONE（改 410）里的顶层项，全部以 symlink 接入 release：
  // 旧图片、支付码、admin、固件、demo 视频等外部可能还有人链到，不能因为换了 docroot 就静默 404。
  const legacyPath = isLink === 'link' ? LEGACY : ROOT; // 首次切换前 legacy 还在 ROOT
  const legacyTop = sh(`ls -A ${legacyPath}`).trim().split('\n').filter(Boolean);
  const linkThese = legacyTop.filter((f) => !DEPLOY.includes(f) && !GONE.includes(f));
  log(`legacy 接入（symlink）：${linkThese.join(' ')}`);
  sh(`cd ${REL} && for f in ${linkThese.map((f) => JSON.stringify(f)).join(' ')}; do ln -s ${LEGACY}/"$f" "$f"; done; chown -h -R www-data:www-data ${REL}`);
  // ---------- 3. 原子切换 ----------
  if (isLink === 'dir') {
    sh(`mv ${ROOT} ${LEGACY} && ln -s ${REL} ${ROOT}.new && mv -T ${ROOT}.new ${ROOT}`);
  } else {
    sh(`ln -s ${REL} ${ROOT}.new && mv -T ${ROOT}.new ${ROOT}`);
  }
  switched = true;
  sh('nginx -t 2>&1 | tail -1');
  log(`已切换 ${ROOT} → ${REL}`);
  const originOnlyAfter = sh(`cd ${ROOT} && for f in ${ORIGIN_ONLY.join(' ')}; do [ -e "$f" ] && (find -L "$f" -type f -exec sha256sum {} + | sort) ; done | sha256sum`).trim();
  if (originOnlyAfter !== originOnlyBefore) throw new Error('ORIGIN_ONLY 内容在切换后发生变化');
  // 保留最近 3 个 release
  sh(`cd ${RELEASES} && ls -1dt pianotuner-2* | tail -n +4 | xargs -r rm -rf`);
} catch (e) {
  rollback(e.message);
}

// ---------- 5. 在线验收 ----------
const fails = await verifyLive(localSha);
if (fails.length) {
  console.error('deploy: 在线验收未通过（docroot 已切换，备份与 legacy 均保留）：');
  for (const f of fails) console.error('  ✗ ' + f);
  console.error(`  回退：ssh ${HOST} 'ln -sfn ${prevTarget} ${ROOT}.new && mv -T ${ROOT}.new ${ROOT}'`);
  process.exit(1);
}
log('在线验收通过。现在提交：git add -A -- ' + DEPLOY.join(' ') + ' && git commit && git push');
