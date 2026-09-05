// Single source of truth for the source / artifact / origin contract.
//
//   PAGES       real pages, rendered in both language trees
//   REDIRECTS   legacy URLs kept alive as same-language meta-refresh stubs
//   GENERATED   owned by the build; the ONLY things publish-build may write into the repo root
//               and the ONLY things deploy may copy to the origin (explicit allowlist, never rsync)
//   STAGE_ONLY  exist in build-stage/ only, never promoted, never deployed
//   REPO_ONLY   hand-maintained; publish/deploy must never touch
//   ORIGIN_ONLY exist on the origin webroot only (legacy backend data, big media); deploy asserts
//               their sha256 is unchanged before/after, and never writes them
//   FORBIDDEN   no build script may write to or delete from these
export const PAGES = ['index', 'about', 'pro', 'demo', 'contact', 'support', 'buy', 'privacy', 'terms'];
export const REDIRECTS = { buy_pro: 'buy', buy_railsback: 'buy', beta_preorder: 'buy' };
export const LANGS = ['zh', 'en'];

export const SITE = {
  origin: 'https://www.pianotuner.top',
  brand: 'Piano Tuner',
};

const htmlNames = [...PAGES, ...Object.keys(REDIRECTS)].map((p) => `${p}.html`);
export const GENERATED = [
  ...htmlNames,
  'en',
  'assets',
  'images',
  'fonts',
  'robots.txt',
  'sitemap.xml',
  'favicon.svg',
  'og-cover.jpg',
];
export const STAGE_ONLY = ['.build-manifest.json'];
export const REPO_ONLY = [
  'CLAUDE.md', 'THIRD-PARTY.md', 'CLAIMS-VERSION', '.gitignore', '.node-version',
  'package.json', 'package-lock.json', 'vite.config.js', 'app', 'source-assets', 'scripts',
];
export const ORIGIN_ONLY = [
  'demo1.mp4', 'demo.mp4', 'admin', 'payment_codes', 'firmware', 'firmware.json', 'patents',
  'intervals', 'PianoTuner_KnowledgeBase', 'footer_backup_20260404',
];
export const FORBIDDEN = [
  'app', 'source-assets', 'scripts', 'node_modules', 'build-stage', '.ssr-stage',
  '.publish-backup', '.git', '.claude',
];
export const DEPLOY = GENERATED;

export const STAGE_DIR = 'build-stage';
export const SSR_DIR = '.ssr-stage';
export const BACKUP_DIR = '.publish-backup';
export const MANIFEST = '.build-manifest.json';

export function assertNode24() {
  const major = +process.versions.node.split('.')[0];
  if (major !== 24) {
    console.error(`需要 Node 24（当前 ${process.versions.node}）。用 PATH=/opt/homebrew/opt/node@24/bin:$PATH`);
    process.exit(2);
  }
}
