#!/usr/bin/env node
// 把「已验证」的 stage 提升为部署根（仓库根），失败必须回到上一个完整可部署版本。
//
// 与 melspectrum 版本的关键差别：**只遍历 GENERATED allowlist**，绝不 readdirSync(STAGE_DIR)
// 全拷——stage 里的 .build-manifest.json（STAGE_ONLY）与任何将来意外多出的顶层文件都不会被发布。
// 三条来之不易的约束保留：
//  1. 先登记意图再执行拷贝（cpSync 中途失败的半成品必须在回滚清单里）。
//  2. 根目录校验必须在删除备份「之前」内联完成，否则它只是验尸。
//  3. 残留的 .publish-backup/ 意味着上一次没干净收尾，必须中止交人工。
import { existsSync, mkdirSync, rmSync, renameSync, cpSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GENERATED, REPO_ONLY, STAGE_DIR, BACKUP_DIR, MANIFEST, assertNode24 } from './paths.mjs';
import { verifyBuild } from './verify-build.mjs';

assertNode24();
const FAIL_AFTER = process.env.PUBLISH_FAIL_AFTER ? +process.env.PUBLISH_FAIL_AFTER : null;
const FAIL_DURING = process.env.PUBLISH_FAIL_DURING || null;

const assertRepoOnly = (when) => {
  for (const f of REPO_ONLY) {
    if (!existsSync(f)) { console.error(`publish-build: ${f} 在${when}丢失 —— 中止`); process.exit(1); }
  }
};

if (!existsSync(STAGE_DIR)) { console.error('publish-build: 没有 build-stage/ —— 先跑 npm run stage'); process.exit(1); }
const manifestPath = join(STAGE_DIR, MANIFEST);
if (!existsSync(manifestPath)) { console.error(`publish-build: build-stage/ 没有 ${MANIFEST} —— 先跑 verify:stage`); process.exit(1); }
const stageManifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
if (existsSync(BACKUP_DIR)) {
  console.error(`publish-build: 检测到残留的 ${BACKUP_DIR}/ —— 上一次发布未干净收尾。`);
  console.error('  里面是上一版部署产物的唯一副本，请人工核对并恢复后删除该目录，再重新发布。');
  process.exit(1);
}
for (const g of GENERATED) {
  if (!existsSync(join(STAGE_DIR, g))) { console.error(`publish-build: stage 缺少 GENERATED 项 ${g}`); process.exit(1); }
}

assertRepoOnly('发布前');
mkdirSync(BACKUP_DIR, { recursive: true });
const movedToBackup = [];
const claimedInRoot = [];

function rollback(err) {
  console.error('\npublish-build: 发布失败 —— 正在回滚');
  console.error('  原因:', err?.message || err);
  try {
    for (const g of claimedInRoot) rmSync(g, { recursive: true, force: true });
    for (const g of movedToBackup) {
      const from = join(BACKUP_DIR, g);
      if (!existsSync(from)) continue;
      rmSync(g, { recursive: true, force: true });
      renameSync(from, g);
    }
    rmSync(BACKUP_DIR, { recursive: true, force: true });
    assertRepoOnly('回滚后');
    console.error('publish-build: 已回滚到上一个完整部署版本');
  } catch (rollbackErr) {
    console.error('publish-build: 回滚过程中再次失败 —— 部署树可能不完整');
    console.error('  回滚错误:', rollbackErr?.message || rollbackErr);
    console.error(`  ${BACKUP_DIR}/ 已保留，其中是上一版的完整副本。请人工执行：`);
    for (const g of movedToBackup) console.error(`    rm -rf ${g} && mv ${join(BACKUP_DIR, g)} ${g}`);
    console.error(`    rmdir ${BACKUP_DIR}`);
  }
  process.exit(1);
}

try {
  for (const g of GENERATED) {
    if (!existsSync(g)) continue;
    renameSync(g, join(BACKUP_DIR, g));
    movedToBackup.push(g);
  }
  let n = 0;
  for (const entry of GENERATED) {            // allowlist，不是 readdirSync
    claimedInRoot.push(entry);                 // 先登记，再拷贝
    if (FAIL_DURING === entry) throw new Error(`注入失败：拷贝 ${entry} 中途（PUBLISH_FAIL_DURING）`);
    cpSync(join(STAGE_DIR, entry), entry, { recursive: true });
    n++;
    if (FAIL_AFTER !== null && n >= FAIL_AFTER) throw new Error(`注入失败：已拷贝 ${n} 项后（PUBLISH_FAIL_AFTER）`);
  }
  assertRepoOnly('发布后');
  // 在销毁备份之前就地校验根目录 —— 这才是门禁
  const { ok, failures, manifest } = verifyBuild('.', { writeManifest: false, prevManifest: stageManifest });
  if (!ok) throw new Error('根目录校验未通过:\n    ' + failures.join('\n    '));
  // 根目录内容必须与 stage 逐文件一致
  for (const [k, v] of Object.entries(stageManifest)) if (manifest[k] !== v) throw new Error(`根目录 ${k} 与 stage 不一致`);
  for (const k of Object.keys(manifest)) if (!(k in stageManifest)) throw new Error(`根目录多出 ${k}`);
} catch (err) {
  rollback(err);
}

rmSync(BACKUP_DIR, { recursive: true, force: true });
// 本地凭证：记录本次发布的 manifest（gitignore，不部署），供下次视频不可变规则比对
cpSync(manifestPath, MANIFEST);
console.log(`publish-build: 已发布 ${claimedInRoot.length} 项到部署根，并通过根目录校验（${Object.keys(stageManifest).length} 个产物）`);
