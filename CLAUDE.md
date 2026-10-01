# pianotuner.top — 站点约定（2026-09-05 起：Vite + React SSG）

13 个真实页（9 个产品/公司页 + 指南 Hub + 3 篇指南）× 2 语言，外加 404 错误页 × 2，构建期预渲染成静态 HTML（中文 `/x.html`，英文 `/en/x.html`），浏览器再 hydrate 接管动效。
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
仓库根          GENERATED 部署树 = 34 个 html（26 页 + 6 存根 + 2 个 404）+ en/ assets/ images/ fonts/ robots.txt sitemap.xml favicon.svg og-cover.jpg
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
- 一个模板、一个 bundle、26 个预渲染页 + 2 个 404：`scripts/prerender.mjs` 先把 `build-stage/index.html` 读进内存（它既是模板又是输出），每页渲染两次比对（非确定性即失败），**SSR 环境不加 jsdom**——render 期读 `window` 直接在构建期抛错，这就是测试。
- `entry-server.jsx` 不包 `MotionProvider`；GSAP 会进 SSR module graph（hooks 顶层 registerPlugin，已验证 Node 导入安全），Lenis 在 effect 里动态 import 不进。
- `entry-client.jsx` 按 `<html data-ssr>` 决定 `hydrateRoot` / `createRoot`，不猜 DOM。
- `.claude/launch.json` 里 `pt-preview` / `pt-dev` 直接指向 node@24 二进制（`npx` 会解析到坏掉的 v25）。

## i18n 与 URL

- 语言是构建期常量：`<LangProvider lang>` 只提供 `{lang, t}`，`t(zh, en)` API 与 melspectrum 一致。每页只渲染一种语言，运行时永不切换（`key={lang}` 重挂载 hack 不存在）。
- `app/src/i18n/urls.js` 是唯一知道 `/en/` 的地方：`href(lang, page, hash)` / `counterpart` / `canonical`。**站内链接一律绝对且经 `href()`**，verify 规则强制。首页 canonical 是 `/` 与 `/en/`，不是 `index.html`；主机固定 `www.`。apex → www 的 301 要在 Cloudflare Redirect Rule 做（2026-10-01：现有 API token 没有 Rulesets 权限，规则需在面板建或给 token 补权限）。
- 语言开关是真 `<a hreflang>`，点击写 `localStorage.pt_lang`。**自动跳转只认显式存储偏好**（head 内联脚本，`?nolang` 逃生），`navigator.language` 只触发一条可关闭的提示条（`LangHint`，只在 effect 里渲染，不进 SSR）。
- `.t-ui` 大写/字距规则挂 `:root[data-lang]`（en 大写 + .08em，zh 不大写 + .04em）——语义统一，不做 CSS 属性统一。`μ`、邮箱等字面量加 `.literal` 豁免。
- `useNavTheme(line, initialTheme)`：`'bottom'` 哨兵在 effect 内解析，`initialTheme` 来自页面 meta，SSR 首帧导航配色就对。

## SEO 契约（2026-10-01，计划见 vault `00-公司/官网/SEO-策略.md`）

- **日期三字段**（`app/src/pages/dates.js`）：`published` 首次发布 → Article `datePublished`；`updated` 正文/实质内容最后修改 → Article `dateModified`；`lastmod` 对搜索引擎有意义的最后变化（正文、结构化数据、重要链接）→ sitemap `<lastmod>`。缺省 `lastmod ← updated ← published`。改颜色/动效/间距/纯部署三个都不动；只改 schema 或加重要内链只动 `lastmod`；**改 Nav/Footer 等全站链接时改 `SITE_LINKS_CHANGED`**（所有页 lastmod 的下限）。sitemap 绝不用构建日期，也不出 `priority`/`changefreq`（Google 忽略）。prerender 拦 `published<=updated<=lastmod<=今天`、Article 日期 ≠ meta；verify 拦 sitemap 集合/顺序、lastmod 格式、`datePublished<=dateModified<=lastmod`。源码不变两次 clean build 的 sitemap 必须逐字节相同。
- **canonical origin 不变量**：HTML 与 sitemap 里任何指向本站的绝对 URL 必须以 `https://www.pianotuner.top/` 开头（不许 http、不许 apex），全部从 `paths.mjs` 的 `SITE.origin` 派生，verify 硬校验。
- **指南**：清单与分组在 `app/src/data/guides.js`（`GUIDE_CATEGORIES` + 每篇 `category`/`desc*`），Hub 是 `guides.html`（WebPage + 两级面包屑，不套 Article）；指南页面包屑三级（首页 → 调律指南 → 本文）。新指南：`PAGES` + `registry.js` + `guides.js` + meta 写 `published`/`updated`、`jsonLd: (lang, { dates }) => article(…, { dates })`。选题由 GSC 数据决定，内容合同只放 vault（禁写清单本身会泄露发明点位置，不进公开 repo）。
- **404**：`ERROR_PAGES = ['404']`，`meta.errorPage` → noindex，不出 canonical/hreflang/og:url/JSON-LD/data-alt-url，不进 sitemap；语言开关在 404 上指向首页。verify 把它当第三类产物单独校验。
- **埋点**（`app/src/lib/analytics.js` 顶部是权威清单）：T1 `waitlist-signup`/`cta-testflight`/`contact-email`，T2 `cta-waitlist`/`cta-pro`/`demo-complete`，T3 `demo-play`/`scroll-50`/`scroll-90`/`guide-product-click`。**同一用户动作只能一种发射方式**：静态链接/按钮用 `data-umami-event(-<key>)`，程序事件用 `track()`，同一元素禁止两种都用。属性值只用 `AT` / `TARGET` 枚举。完播率、CTA 转化用 Umami Funnel 算，不用事件次数相除。浏览器面板隐藏时 scroll 事件不派发，测 `useScrollDepth` 要手动 `dispatchEvent(new Event('scroll'))` 或用无头 Chrome。
- 导航 6 个链接在 1024–1199px 放不下品牌副标题，这一段隐藏副标题（`app.css`）；再加导航项先量 1024px 下 `.nav` 的 `scrollWidth`。

## 视频滚动锁定（本站签名，`app/src/lib/motion/useHeroVideoLock.js`）

1. 滚到 hero 页面 pin 住；2. 滚轮位移驱动 `video.currentTime`；3. 播完才放开。锁定距离 `clamp(dur*420, 600, innerHeight*2.4)`。

- 只在 `(min-width:768px) and (prefers-reduced-motion: no-preference)` 分支里注入 `src`；`<video>` 出厂**不带 `src`**（`display:none` 拦不住请求）。verify 断言 hero video 无 `src` 且 `data-src-mp4` 指向真实文件。
- **不设 `scrub`**：这个 trigger 没绑 tween，数值 scrub 对 `self.progress` 无作用；平滑全部交给 Lenis。
- pin 在 `loadedmetadata` 后「晚建」：建完必须 `ScrollTrigger.sort(); refresh()`，否则后面所有 trigger 短一个锁定距离（2026-08-30 线上事故）。**pin 销毁是镜像问题，teardown 也要 sort+refresh**；`loadedmetadata` 监听显式移除；`dataset.ptLoaded` 守卫 StrictMode 双挂载。`lib/motion/index.js` 的 `refreshSoon()` 也是 sort-then-refresh（melspectrum 的没有 sort，别原样覆盖回来）。
- 换视频/poster **必须换文件名**：滚动锁定发大量 Range 请求，Cloudflare 与浏览器按字节区间缓存，同 URL 换内容会拼出解不出的流（2026-09-01）。视频在 `app/public/assets/video/`，Vite 原样拷贝不加 hash；verify 规则：同名视频 sha256 变了就失败。旧文件名留着指向当前内容。
- 编码：`-g 12`（24fps）、`-movflags +faststart`、`-an`（BGM 是 CC BY 非商用）、`muted playsinline` + poster。

## 动效体系（`app/src/lib/motion/hooks.js` + `tokens.js`，2026-09-28 重构）

- **E0：静止态必须是可见态。** CSS 里绝不写 `opacity:0` 基态；隐藏只由 JS 成功建立 timeline 后 `gsap.set` 写 inline。`data-motion-ready` 按 section 局部标记，不在 `<html>` 上。验收：404 掉入口 JS、禁用 JS、reduced-motion 三种情况全部可读。
- **首屏零闪烁**：hook 绑定时已在首屏（顶边高于 88%）的元素**不藏**，直接 `done`；首屏标题走「cover」擦除（色条与藏字同一帧落位，随后滑出），经 View Transition 抵达的首屏标题不播。
- 一个属性只能有一个 motion owner：Lenis 管滚动插值（lerp 0.12）、ScrollTrigger 管进度、GSAP 管 transform/opacity、CSS 只管 hover/focus。**禁 `gsap.killTweensOf(el)`**（元素级 API 会杀掉别的 owner 的补间，2026-09-04 melspectrum 线上事故）。成文例外（CSS 所有）：移动菜单 `<dialog>` 入场、跨页 View Transition。布局动画例外（有意为之）：FAQ 高度、SVG 路径描绘。
- **运动 token**：`lib/motion/tokens.js` 的 `EASE`（out `.22,1,.36,1` 入场 / inOut `.65,0,.35,1` 跨屏移动 / wipe `1,0,0,1` / exit / scrub=`none`）、`DUR`（xs .15 · s .25 · m .5 · l .8 · xl 1.1 · wipe .9）、`START = 'top 88%'`、`CASCADE`（each 70ms、封顶 420ms、组间休止 120ms）。**与 `tokens.css` 的 `--ease-*` / `--dur-*` 是同一组数，改一处必须同步另一处。** 入场永不用 ease-in；scrub 永远线性（`scrub: true`，输入平滑归 Lenis，不叠数值 scrub）。
- **显现生命周期**（`bindCascade`）：`data-reveal` = `pending → visible → done`。`pt:revealed` 在 **visible**（opacity 过阈值 = fade×0.6）派发，不是动画结束；`done` 时 `clearProps: 'opacity,transform'`（否则 inline transform 会压掉 `.spec:hover` 等 hover 位移）。每个元素自己的触发线（`START`），**组内级联由 DOM 决定**（`data-reveal-group` 或 `.steps/.stack-deck/.specs/.contact-grid/.net__metrics/.team-grid`，否则归 section），同组共享排队时钟——慢滚与快速甩屏节奏一致。先建空 `gsap.context` 再绑定（起点已越过的触发器会在 `create()` 内同步调 `onEnter`）。资源显式登记，cleanup 逐个 kill；StrictMode 双挂载后 ScrollTrigger 数量必须与生产一致。
- 档位（透明度先于位移完成）：lead y48 · fade .5 / rise 1.1 · delay .12；metric y18 scale .94 · .5/.8；base y12 · .5/.8；stack y14 · .5/.8。
- 通用区块 `components/Section.jsx`（岛 / topic / 显现 hooks / 可选 countUp），不要再在页面里复制本地 `Section`。
- 逐行擦除条 `useTextReveal`：SplitText `autoSplit` + `onSplit` 返回 timeline（官方推荐），字体就绪后才拆。`.reveal-text` 所在子树 React **不得重渲染**（SplitText 改了 DOM）。**含 `<sup><a href="#precision-note">` 的文字不要加 `.reveal-text`**（角标用 `<Fn />` 放在 reveal 元素外）。擦除条静止态用 `opacity`，绝不用 `transform`。
- **三步区不 pin**（2026-09-01 实测：紧挨 hero pin 再卡一次很难受）：`useStepsPath` 以 `.steps` 自己的行程 scrub（`START → top 40%`），生命周期跟随 scrub 进度（onUpdate/onRefresh）；手机改走组内级联。melspectrum 的 `useSteps` pin **不移植**。
- 跑马灯方向恒定只调速度（负 timeScale 会卡死）；三份 clone 两份 `aria-hidden`；**跑马灯不放任何精度数字**（承载不了角标与脚注）。
- `Scramble` 只用于拉丁/数字且**不是 Gate F 管的数字**（TESTFLIGHT / RAILSBACK / 版本号可以，`±2` 不可以）。组件遇到任何非 ASCII 文本自动保持静态，所以全站 `.card__num`（`01 · WRISTS` 等）统一走它：进场**等宿主 `pt:revealed`**（IO 只做兜底，`playOnce` 幂等锁）+ ≥1024px 悬停重触发。
- FAQ 是原生 `<details>`，`useFaqAccordion` 只在有动效时接管 summary 点击：**每项一条可逆 timeline**（play / reverse，连点只换方向），展开 ease-out、收起 1.4×；`data-state` 即时驱动 + 号；无 JS / reduced-motion 原生开合不变，开合后 `refreshSoon()`。
- 悬停反馈（仅 `hover:hover and pointer:fine`）：卡片 / 步骤 / 指标顶边 1px 主题色细线，进入 `--dur-m` 缓出、离开 `--dur-s`。按钮填充用 `scaleX`，不补间 width。
- **跨页过渡**：`@view-transition { navigation: auto }` 只在 `no-preference` 下；`.nav-frame` 命名 `pt-nav`（同一时刻必须唯一）。`head.js` 的 `pagereveal` 内联脚本写 `html[data-vt]`（arrive → done，取自 `ViewTransition.finished`），**只用来少播首屏入场，可见性永不依赖它**。Firefox 等不支持时照常硬导航。
- **`/#hash` 落点**：首屏视频 pin 晚建会把目标推下一个锁定距离（曾差 2100px）。`MotionProvider.fixHashLanding()` 在 pin 建好后的第一次 refresh 重新对准一次——仅限 `navigate` 类型导航且用户尚未滚动/触摸/按键；刷新与前进后退交给浏览器恢复。`pageshow.persisted` 时 `refreshSoon()`。
- 动效层级与预算：T1 叙事（hero 擦除、区块显现、三步、跨页过渡）> T2 信息（级联、Scramble、FAQ、count-up）> T3 反馈（hover、按钮、焦点、菜单）；T3 不得抢 T1。同一视口至多 1 个主动效 + 2 个次动效。
- 对比表 `.cmp` 首列 `position: sticky`（手机横滑时行名不丢），≤719px 显示 `.tablewrap__hint`。
- reduced-motion = 整个体系进入静态构图：Lenis 不启动、所有 hook 早退（无 `data-reveal`、ScrollTrigger 0 个，仅剩 ScrollTrigger 自身的 0 时长 delayedCall）、`motion.css` 兜底、无 view-transition-name。
- rAF 与 setTimeout 竞速（`afterPaint`）：后台标签页 / 隐藏面板会暂停 rAF。**Claude 浏览器面板隐藏时 rAF 被节流**（`innerWidth` 读出 0 就是隐藏了），测动效用 `scripts/qa/cdp.mjs`（无头 Chrome）或先量帧率：预热 1s 后采样 1s，**<45 帧直接判 SKIP**，不下结论。
- **验收工具（REPO_ONLY）**：`scripts/qa/cdp.mjs`（shoot 整页截图 / flash 首帧闪烁 / audit 注入 `motion-audit.js` 求值 / snap hover 截图 / keys 键盘 / nav hash·BFCache·连点 / vt 跨页过渡 / nojs 404·禁用 JS）+ `scripts/qa/diff.py`（像素回归三联图）。Chrome 冷启动慢，`PTQA_TMP` 指到可写目录。
- 动效清单（owner 一眼可查）：

  | 组件 | owner | 触发 | 属性 | 时长 |
  |---|---|---|---|---|
  | hero 视频锁定 | ScrollTrigger pin | 进入 hero | pin + `currentTime` | 锁定距离 |
  | 标题擦除 | GSAP | 首屏 cover / START | box xPercent、行 opacity | .9 / .5 |
  | 区块显现 | GSAP（bindCascade） | START，组内排队 | opacity、y、scale | .5 / .8–1.1 |
  | 三步 | GSAP scrub | `.steps` START→40% | 步 opacity、连线 scaleX | scroll |
  | Railsback / 拍频图 | GSAP scrub | START / 82% | dashoffset / 画布 | scroll |
  | 网格视差 | GSAP scrub | hero 首屏一段 | y | scroll |
  | Scramble | GSAP | 宿主 pt:revealed / hover | 文本 | 1.75 |
  | FAQ | GSAP 可逆 timeline | 点击 | height、opacity | .5 / .25 |
  | 按钮 / 卡片线 / 高亮 | CSS | hover / focus | transform、opacity | .25 / .5 |
  | 移动菜单 | CSS（例外） | dialog open | opacity、y | .25 / .5 |
  | 跨页 | View Transition（例外） | 同源导航 | root opacity、y | .25 / .35 |

## 配色：暖中性 + 单一克制的青色（2026-09-28 定稿）

- **克制是规则本身。** 实测（无头 Chrome 按可见面积）：apple.com 强调色 ≈0.1% 页面面积、linear ≈0.25%、teenage.engineering / Leica 0%；本站改前首页 6.7%、pro 14%（彩色眉标块 + 整屏青色岛），改后 0.3–0.9%。强调色只做**信号**：CTA 按钮、链接、擦除条、hover 高亮、小号数据标签、焦点相关。**不做大面积平涂**：眉标是等宽小字（浅岛 accent ink、深岛 ash），`.island-accent` 已改为浅瓷白底（类名保留）。
- 一度试过「铜/青双主题色」（铜 `#D9B26F`），用户判定「土」：中明度中饱和的平涂卡其既没有信号色的纯度，也没有真金属的高光阴影。**暖意来自中性色与产品图，不来自第二个强调色**（Leica 做法）。已回滚（`git revert 2710fe0`），别再加回来。
- 暖中性：black `#16140f`、white `#fbfaf7`、gunmetal `#43403a`、charcoal `#5b5853`、ash `#8e8a83`、silver `#b5b1a9`、alabaster `#dcd6cc`、platinum `#eeebe5`、porcelain `#f7f5f1`；nav / hero scrim / menu backdrop 的 rgba 同步为 `22,20,15`，`theme-color` 为 `#16140f`。
- 强调色两档：**fill** `--color-teal` #2DD4BF（深底 9.89，或背后是黑字）/ **ink** `--color-teal-ink` #0B6E63（浅底文字 5.15–5.87）。组件只写 `var(--accent-fill)` / `var(--accent-text)`（按岛自动取 fill 或 ink），不写色值；`--color-accent(-deep)` 是别名。
- 浅岛作用域里 `--color-ash` 重映射为 `--color-ash-ink` #6b6861（4.67:1）；页脚版权行用 ash（5.36:1）。全站纯色岛全文字对比度扫描 0 失败——`scripts/qa/motion-audit.js` 的 `contrast()` 默认扫所有直接含文字的元素。
- 焦点环双色：2px 内圈 outline + 外圈 box-shadow，随岛翻转，任何背景都 ≥3:1。
- 硬编码扫描：`grep -rni "#2DD4BF\|#0B6E63\|#141414\|#fafafa" app/src` 只允许 `tokens.css`、BeatFigure 的兜底值、`head.js` 跳转存根。favicon / og-cover 仍为青。

## 字体

不引 Google Fonts。Inter 变量字体复用 `@fontsource` 的拉丁子集（不要用 pyftsubset 切变量 TTF，会压平字重轴）；Noto Sans SC 由 `scripts/subset-fonts.mjs` 每次构建从 `app/src` 收割码点（剥注释）子集化，>200KB 警告、>320KB 失败回退系统字体。当前约 239KB（法律页文案多）。

## 内容：Gate F 是构建期闸门，不靠人记得

`website-public-claims.md` 只在 vault（`00-公司/官网/`），仓库只留 `CLAIMS-VERSION`。`scripts/verify-build.mjs` 的 `FORBIDDEN_STRINGS` 是它的投影（±1/±0.5/±0.01/±4、电机/编码器/驱动/MCU 型号、减速比、扭矩、专利号、Quick Check、省钱叙事、买断口径、Qin Liuhaoran、占位备案号、CDN…），扫 html/js/css/txt/xml——死代码里的旧 claims 也不许进 bundle。

**精度条件规则只对最终 HTML 做**：含 `±2` 的页面必须有且仅有一个 `id="precision-note"`、每处 `±2` 紧跟 `<sup class="fn-ref"><a href="#precision-note">`、脚注含「实验室测试结果」与「最终性能以量产版本的验证结果为准」。`<PrecisionNote />` 的措辞逐字来自 claims §2，不得改。无法承载角标的位置（title/meta/JSON-LD）写「实验室测试精度 ±2 音分 / lab-tested ±2 cents」。JSON-LD 逐块解析，**无 offers/availability**（无真实预售）。底部进度条是 `⬡ PIANO TUNER · iOS TESTFLIGHT`——全局 chrome 无处承载角标，所以不放数字。

其它红线：法定主体 **融谱智能科技（深圳）有限公司**，英文 `…, operating under the MelSpectrum brand`，无英文法定名；团队只列真实自然人，AI Agent 不得当团队成员；CTO 姓名按现页保持（claims §5 HOLD）；专利只写「已进入发明专利申请程序」；拆解/逆向条款只在 terms；Pro 是年度订阅 ¥499/年，不写买断。

改文案 **zh/en 一起改**，改完跑 `node scripts/text-diff.mjs <page>` 对照 `pre-vite-static` 标签逐句看增删。

## 部署（`scripts/deploy.mjs`，默认 dry-run，`--apply` 才执行）

origin = `root@192.255.139.83`，docroot `/var/www/html-pianotuner` **现在是 symlink → `/var/www/releases/pianotuner-<ts>/`**，旧目录是 `releases/pianotuner-legacy`。树莓派 `rpi@mc.void1211.com:1211:/var/www/html/` 是不承接流量的陈旧镜像，别往那里发。

流程：预检（工作树干净、verify:root、ssh）→ tar 备份到 `/root/backups/` 并 `tar -tzf` 验证 → df 预检 → 上传整个 DEPLOY 到新 release（先 hashed 资产后 HTML）→ release 内逐文件 sha256 == 本地 → legacy 里所有不在 DEPLOY、也不在 410 名单里的顶层项 symlink 接入 → `nginx -t` → `mv -T` 原子切换 symlink → ORIGIN_ONLY 指纹前后一致 → 保留最近 3 个 release → 在线验收（26 URL 200 且 body == origin（只允许 email-protection / email-decode / Insights 差异）、6 存根跳转、sitemap/robots、`/api/pianotuner/subscribe` 可达、hero 视频两段 Range 206 字节一致、旧存档页 410、SEO 404：`/__seo-404-check-<ts>.html` 与 `/en/…` 必须真 404 且 body 是对应语言错误页）→ 打印 git 命令。任一步失败：release 目录清理，docroot 不动；切换后验收失败给出一行回退命令。

**origin nginx 的 `limit_req zone=api_limit`（1r/s, burst 5）只在 `location /api/` 里**（2026-09-05 之前误放在 server 级，全站限速：部署脚本的在线验收从回环连发请求被限成 503，冷缓存首屏也会被限）。cloudflared 从 `[::1]:1212` 进来，`conf.d/cloudflare-ips.conf` 已把 `::1`/`127.0.0.1` 列为可信代理，access.log 里是访客真实 IP。旧存档页由 nginx `location = … { return 410; }` 处理，本体在 `/root/backups/legacy-pages/`。**404 body**：server 级 `error_page 404 $pt_404_page;`，`conf.d/pianotuner-404.conf` 的 `map $uri` 按 `/en/` 前缀选 `/en/404.html` 或 `/404.html`（2026-10-01），状态码仍是 404；`deny`/`return 404` 的 location 也会用它，`/api/` 未开 `proxy_intercept_errors` 不受影响。 `robots.txt`/`sitemap.xml` 在 origin 是 `expires -1`（Cloudflare 每次回源校验，改版后不用 purge）；Cloudflare 的 managed robots.txt 会在我们的文件前面拼一段 AI 爬虫声明，边缘响应≠本地属预期。**deploy.mjs 的失败路径**：记住切换前目标、失败先切回再删 release（2026-09-05 第二次部署曾因先删后不切回造成 4 分钟 404）。

**全链无 rsync、只走显式清单。** origin nginx 对 `*.json` 一律 404，所以运行时不得 fetch 任何 .json（Railsback 数据烘成 `data/railsback.js`）。CSP `script-src 'self' 'unsafe-inline'`、`font-src 'self'`，Vite 产物兼容，依赖升级后复查。

两级验收口径：A. release 文件系统 ↔ 本地 0 差异；B. Cloudflare 响应 ↔ origin 只允许已知 edge transform。

## grep 时注意

`.claude/worktrees/`、`node_modules/`、`build-stage/` 会把递归 grep 弄脏；查站点内容用 `app/src`，查产物用顶层 `*.html` + `en/*.html`。
