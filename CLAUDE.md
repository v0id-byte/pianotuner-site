# pianotuner.top — 站点约定（2026-09-05 起：Vite + React SSG）

9 个真实页 × 2 语言，构建期预渲染成静态 HTML（中文 `/x.html`，英文 `/en/x.html`），浏览器再 hydrate 接管动效。
设计系统整套搬自 melspectrum.com（`app/src/styles/{tokens,app,motion}.css`），但 **melspectrum 不是黄金实现**：
它自己的矛盾（`useSteps` pin+scrub 0.3、`refreshSoon` 无 `sort()`、跑马灯裸 `LAB-TESTED ±2 ¢`、`publish` 用 `readdirSync` 全拷）一律不继承。
搬它的视觉系统和成熟 motion primitive；保留 pianotuner 实测形成的产品 invariant（视频滚动锁定、三步不 pin、精度脚注）。

---

## 目录角色（`scripts/paths.mjs` 是唯一契约）

```
app/            源码（Vite root）：index.html 模板、public/（原样拷贝的静态资产）、src/
source-assets/  原始素材（NotoSansSC.ttf 等）——永不投产，verify 见到 .ttf 即失败
scripts/        构建工具链：subset-fonts / prerender / verify-build / publish-build / deploy / text-diff / vite-plugin-mpa-dev
build-stage/    vite + 预渲染产物（gitignore）；.build-manifest.json 只存在这里（STAGE_ONLY）
仓库根          GENERATED 部署树 = 24 个 html + en/ assets/ images/ fonts/ robots.txt sitemap.xml favicon.svg og-cover.jpg
REPO_ONLY       CLAUDE.md THIRD-PARTY.md CLAIMS-VERSION package.json vite.config.js …（发布/部署脚本结构上碰不到）
ORIGIN_ONLY     只在 origin 的东西（demo1.mp4、admin/、payment_codes/、firmware/…）：部署只做 symlink 接入 + 前后 sha256 不变断言
```

**「local == git == origin」只对 `DEPLOY`（= GENERATED）成立**，不是整个 docroot 逐字节相等。`demo1.mp4`（14MB）按决定 origin-only，`demo.html` 引用它、本地 preview 404 属预期。

## 构建（Node 24，别的版本直接拒绝）

```bash
export PATH=/opt/homebrew/opt/node@24/bin:$PATH   # 本机默认 node 是坏掉的 v25（simdjson dylib 丢失）
npm run stage     # subset-fonts → vite build → vite build --ssr → prerender → verify:stage
npm run build     # = stage + publish:build（allowlist 提升到仓库根，失败回滚）
npm run preview   # vite preview build-stage，端口 4173 —— sirv 支持 Range 206，hero 视频只在这里验
npm run dev       # 客户端渲染的 MPA dev（scripts/vite-plugin-mpa-dev.mjs，经 transformIndexHtml）
```

- `vite.config.js`：`root:'app'`、**`base:'/'`（否则 `/en/*` 找不到 `/assets`）**、**`appType:'mpa'`（preview 与 nginx `try_files` 一样 404）**、`manifest:false`。
- 一个模板、一个 bundle、18 个预渲染页：`scripts/prerender.mjs` 先把 `build-stage/index.html` 读进内存（它既是模板又是输出），每页渲染两次比对（非确定性即失败），**SSR 环境不加 jsdom**——render 期读 `window` 直接在构建期抛错，这就是测试。
- `entry-server.jsx` 不包 `MotionProvider`；GSAP 会进 SSR module graph（hooks 顶层 registerPlugin，已验证 Node 导入安全），Lenis 在 effect 里动态 import 不进。
- `entry-client.jsx` 按 `<html data-ssr>` 决定 `hydrateRoot` / `createRoot`，不猜 DOM。
- `.claude/launch.json` 里 `pt-preview` / `pt-dev` 直接指向 node@24 二进制（`npx` 会解析到坏掉的 v25）。

## i18n 与 URL

- 语言是构建期常量：`<LangProvider lang>` 只提供 `{lang, t}`，`t(zh, en)` API 与 melspectrum 一致。每页只渲染一种语言，运行时永不切换（`key={lang}` 重挂载 hack 不存在）。
- `app/src/i18n/urls.js` 是唯一知道 `/en/` 的地方：`href(lang, page, hash)` / `counterpart` / `canonical`。**站内链接一律绝对且经 `href()`**，verify 规则强制。首页 canonical 是 `/` 与 `/en/`，不是 `index.html`；主机固定 `www.`（apex 与 www 都 200 无 301）。
- 语言开关是真 `<a hreflang>`，点击写 `localStorage.pt_lang`。**自动跳转只认显式存储偏好**（head 内联脚本，`?nolang` 逃生），`navigator.language` 只触发一条可关闭的提示条（`LangHint`，只在 effect 里渲染，不进 SSR）。
- `.t-ui` 大写/字距规则挂 `:root[data-lang]`（en 大写 + .08em，zh 不大写 + .04em）——语义统一，不做 CSS 属性统一。`μ`、邮箱等字面量加 `.literal` 豁免。
- `useNavTheme(line, initialTheme)`：`'bottom'` 哨兵在 effect 内解析，`initialTheme` 来自页面 meta，SSR 首帧导航配色就对。

## 视频滚动锁定（本站签名，`app/src/lib/motion/useHeroVideoLock.js`）

1. 滚到 hero 页面 pin 住；2. 滚轮位移驱动 `video.currentTime`；3. 播完才放开。锁定距离 `clamp(dur*420, 600, innerHeight*2.4)`。

- 只在 `(min-width:768px) and (prefers-reduced-motion: no-preference)` 分支里注入 `src`；`<video>` 出厂**不带 `src`**（`display:none` 拦不住请求）。verify 断言 hero video 无 `src` 且 `data-src-mp4` 指向真实文件。
- **不设 `scrub`**：这个 trigger 没绑 tween，数值 scrub 对 `self.progress` 无作用；平滑全部交给 Lenis。
- pin 在 `loadedmetadata` 后「晚建」：建完必须 `ScrollTrigger.sort(); refresh()`，否则后面所有 trigger 短一个锁定距离（2026-08-30 线上事故）。**pin 销毁是镜像问题，teardown 也要 sort+refresh**；`loadedmetadata` 监听显式移除；`dataset.ptLoaded` 守卫 StrictMode 双挂载。`lib/motion/index.js` 的 `refreshSoon()` 也是 sort-then-refresh（melspectrum 的没有 sort，别原样覆盖回来）。
- 换视频/poster **必须换文件名**：滚动锁定发大量 Range 请求，Cloudflare 与浏览器按字节区间缓存，同 URL 换内容会拼出解不出的流（2026-09-01）。视频在 `app/public/assets/video/`，Vite 原样拷贝不加 hash；verify 规则：同名视频 sha256 变了就失败。旧文件名留着指向当前内容。
- 编码：`-g 12`（24fps）、`-movflags +faststart`、`-an`（BGM 是 CC BY 非商用）、`muted playsinline` + poster。

## 动效体系（`app/src/lib/motion/hooks.js`）

- **E0：静止态必须是可见态。** CSS 里绝不写 `opacity:0` 基态；隐藏只由 JS 成功建立 timeline 后 `gsap.set` 写 inline。`data-motion-ready` 按 section 局部标记，不在 `<html>` 上。验收：404 掉入口 JS、禁用 JS、reduced-motion 三种情况全部可读。
- 一个属性只能有一个 motion owner：Lenis 管滚动插值（lerp 0.12）、ScrollTrigger 管进度、GSAP 管 transform/opacity、CSS 只管 hover/focus。**禁 `gsap.killTweensOf(el)`**（元素级 API 会杀掉别的 owner 的补间，2026-09-04 melspectrum 线上事故）。
- 逐行擦除条 `useTextReveal`：SplitText `autoSplit` + `onSplit` 返回 timeline（官方推荐），字体就绪后才拆。`.reveal-text` 所在子树 React **不得重渲染**（SplitText 改了 DOM）。**含 `<sup><a href="#precision-note">` 的文字不要加 `.reveal-text`**（角标用 `<Fn />` 放在 reveal 元素外）。擦除条静止态用 `opacity`，绝不用 `transform`。
- 三档滚动显现：`.anim-up--lead` 56px/1.0s、`.anim-up--metric` 带 scale、`.anim-up` 10px/0.75s。
- **三步区不 pin**（2026-09-01 实测：紧挨 hero pin 再卡一次很难受）：`useStepsPath` 用区块自己的行程 scrub（`top bottom → top top+=64`），手机不建。melspectrum 的 `useSteps` pin **不移植**。
- 跑马灯方向恒定只调速度（负 timeScale 会卡死）；三份 clone 两份 `aria-hidden`；**跑马灯不放任何精度数字**（承载不了角标与脚注）。
- `Scramble` 只用于拉丁/数字且**不是 Gate F 管的数字**（TESTFLIGHT / RAILSBACK / 版本号可以，`±2` 不可以）。组件遇到任何非 ASCII 文本自动保持静态，所以全站 `.card__num`（`01 · WRISTS` 等）统一走它：进场一次 + ≥1024px 悬停重触发。
- FAQ 是原生 `<details>`，`useFaqAccordion` 只在有动效时接管 summary 点击、补间 `.faq__body` 高度；无 JS / reduced-motion 原生开合不变，开合后 `refreshSoon()`。
- 对比表 `.cmp` 首列 `position: sticky`（手机横滑时行名不丢），≤719px 显示 `.tablewrap__hint`。
- reduced-motion = 整个体系进入静态构图：Lenis 不启动、所有 hook 早退、`motion.css` 兜底。
- rAF 与 setTimeout 竞速（`afterPaint`）：后台标签页 / 隐藏面板会暂停 rAF。**Claude 浏览器面板隐藏时 rAF 被节流**，测动效前先量一次（600ms 内少于 10 帧就别下「动效没生效」的结论）。

## 字体

不引 Google Fonts。Inter 变量字体复用 `@fontsource` 的拉丁子集（不要用 pyftsubset 切变量 TTF，会压平字重轴）；Noto Sans SC 由 `scripts/subset-fonts.mjs` 每次构建从 `app/src` 收割码点（剥注释）子集化，>200KB 警告、>320KB 失败回退系统字体。当前约 239KB（法律页文案多）。

## 内容：Gate F 是构建期闸门，不靠人记得

`website-public-claims.md` 只在 vault（`00-公司/官网/`），仓库只留 `CLAIMS-VERSION`。`scripts/verify-build.mjs` 的 `FORBIDDEN_STRINGS` 是它的投影（±1/±0.5/±0.01/±4、电机/编码器/驱动/MCU 型号、减速比、扭矩、专利号、Quick Check、省钱叙事、买断口径、Qin Liuhaoran、占位备案号、CDN…），扫 html/js/css/txt/xml——死代码里的旧 claims 也不许进 bundle。

**精度条件规则只对最终 HTML 做**：含 `±2` 的页面必须有且仅有一个 `id="precision-note"`、每处 `±2` 紧跟 `<sup class="fn-ref"><a href="#precision-note">`、脚注含「实验室测试结果」与「最终性能以量产版本的验证结果为准」。`<PrecisionNote />` 的措辞逐字来自 claims §2，不得改。无法承载角标的位置（title/meta/JSON-LD）写「实验室测试精度 ±2 音分 / lab-tested ±2 cents」。JSON-LD 逐块解析，**无 offers/availability**（无真实预售）。底部进度条是 `⬡ PIANO TUNER · iOS TESTFLIGHT`——全局 chrome 无处承载角标，所以不放数字。

其它红线：法定主体 **融谱智能科技（深圳）有限公司**，英文 `…, operating under the MelSpectrum brand`，无英文法定名；团队只列真实自然人，AI Agent 不得当团队成员；CTO 姓名按现页保持（claims §5 HOLD）；专利只写「已进入发明专利申请程序」；拆解/逆向条款只在 terms；Pro 是年度订阅 ¥499/年，不写买断。

改文案 **zh/en 一起改**，改完跑 `node scripts/text-diff.mjs <page>` 对照 `pre-vite-static` 标签逐句看增删。

## 部署（`scripts/deploy.mjs`，默认 dry-run，`--apply` 才执行）

origin = `root@192.255.139.83`，docroot `/var/www/html-pianotuner` **现在是 symlink → `/var/www/releases/pianotuner-<ts>/`**，旧目录是 `releases/pianotuner-legacy`。树莓派 `rpi@mc.void1211.com:1211:/var/www/html/` 是不承接流量的陈旧镜像，别往那里发。

流程：预检（工作树干净、verify:root、ssh）→ tar 备份到 `/root/backups/` 并 `tar -tzf` 验证 → df 预检 → 上传整个 DEPLOY 到新 release（先 hashed 资产后 HTML）→ release 内逐文件 sha256 == 本地 → legacy 里所有不在 DEPLOY、也不在 410 名单里的顶层项 symlink 接入 → `nginx -t` → `mv -T` 原子切换 symlink → ORIGIN_ONLY 指纹前后一致 → 保留最近 3 个 release → 在线验收（18 URL 200 且 body == origin（只允许 email-protection / email-decode / Insights 差异）、6 存根跳转、sitemap/robots、`/api/pianotuner/subscribe` 可达、hero 视频两段 Range 206 字节一致、旧存档页 410）→ 打印 git 命令。任一步失败：release 目录清理，docroot 不动；切换后验收失败给出一行回退命令。

**origin nginx 的 `limit_req zone=api_limit`（1r/s, burst 5）只在 `location /api/` 里**（2026-09-05 之前误放在 server 级，全站限速：部署脚本的在线验收从回环连发请求被限成 503，冷缓存首屏也会被限）。cloudflared 从 `[::1]:1212` 进来，`conf.d/cloudflare-ips.conf` 已把 `::1`/`127.0.0.1` 列为可信代理，access.log 里是访客真实 IP。旧存档页由 nginx `location = … { return 410; }` 处理，本体在 `/root/backups/legacy-pages/`。 `robots.txt`/`sitemap.xml` 在 origin 是 `expires -1`（Cloudflare 每次回源校验，改版后不用 purge）；Cloudflare 的 managed robots.txt 会在我们的文件前面拼一段 AI 爬虫声明，边缘响应≠本地属预期。**deploy.mjs 的失败路径**：记住切换前目标、失败先切回再删 release（2026-09-05 第二次部署曾因先删后不切回造成 4 分钟 404）。

**全链无 rsync、只走显式清单。** origin nginx 对 `*.json` 一律 404，所以运行时不得 fetch 任何 .json（Railsback 数据烘成 `data/railsback.js`）。CSP `script-src 'self' 'unsafe-inline'`、`font-src 'self'`，Vite 产物兼容，依赖升级后复查。

两级验收口径：A. release 文件系统 ↔ 本地 0 差异；B. Cloudflare 响应 ↔ origin 只允许已知 edge transform。

## grep 时注意

`.claude/worktrees/`、`node_modules/`、`build-stage/` 会把递归 grep 弄脏；查站点内容用 `app/src`，查产物用顶层 `*.html` + `en/*.html`。
