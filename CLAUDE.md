# pianotuner.top — 站点约定

静态多页站，12 个 HTML，无构建、无框架。中英双语同时进 DOM，用 `body.lang-zh` / `.lang-en` 切换。

---

## 视频滚动锁定（Video scroll-lock）—— 本站默认模式

**规则：只要不是太长的视频（单场景实拍或渲染视频，约 3–8 秒），首屏/展示区一律用「滚动锁定播放」，不要用「边滚边划过」。**

行为（仿 Apple 产品页）：

1. 滚到该区块时，**页面停住不动**（pin）
2. 滚轮/触控板的位移驱动视频从第一帧走到最后一帧
3. **播完之后**，页面才恢复正常向下滚动

不要做成「页面照常滚动、视频顺带播一点」——那样看不完整，也没有停顿感。

### 实现

`assets/motion.js` 里的 `hero-video` effect 就是参考实现：

```js
ScrollTrigger.create({
  trigger: hero,
  start: 'top top',
  end: '+=' + lock,        // 锁定距离，见下
  pin: true,
  pinSpacing: true,
  scrub: 0.3,
  anticipatePin: 1,
  invalidateOnRefresh: true,
  onUpdate: function (self) {
    var tgt = self.progress * dur;
    if (Math.abs(video.currentTime - tgt) > 0.01) video.currentTime = tgt;
  }
});
```

**锁定距离**由片长推出，并且要夹住上下限，否则短片锁得太随意、长片让人以为页面卡死：

```js
var lock = Math.round(dur * 420);                       // ~420px 滚动 / 每秒素材
lock = Math.max(600, Math.min(lock, window.innerHeight * 2.4));
```

### 必须一起满足的条件

| 项 | 要求 |
|---|---|
| **编码** | 短 GOP，**不要默认 `-g 1`**。24fps 用 `-g 12`（0.5s 关键帧间隔）。实测：`-g 1` 比 `-g 12` 大 **3.1 倍**（2.78MB vs 0.89MB）。只有实测出现 seek 卡顿才继续降 GOP |
| **必须** | `-movflags +faststart`、`muted`、`playsinline`、配 poster |
| **音轨** | 一律 `-an`。宣传片 BGM 是 CC BY **非商用**，对外必须去音轨 |
| **移动端** | **不 pin，也不加载视频**。`display:none` 拦不住请求——视频必须**不带 `src`** 出厂，只在桌面分支用 JS 注入 `data-src-*`；否则浏览器照样取 metadata |
| **reduced-motion** | 不 pin、不加载，只显示 poster |
| **无 JS / 库加载失败** | poster `<img>` 本身就是完整的首屏，不依赖任何脚本 |
| **页面还有别的 pin** | 见下方「晚建 pin 会打乱后面所有 trigger」——必须 `ScrollTrigger.sort()` 再 `refresh()` |

### ⚠️ 晚建的 pin 会打乱它后面所有 trigger（2026-08-30 踩过）

滚动锁定的 pin **只能在视频报出 `duration` 之后才建**（锁定距离由片长推出），也就是说它是 `loadedmetadata` 回调里**异步**创建的。而此时页面上后面的 pin（本站是 `#how-it-works`）**早就量完并缓存了自己的 start/end**，那份缓存里**没有 hero 的 pin spacer**。

后果：后面每个 trigger 都短了整整一个锁定距离（1440×900 下是 2100px），`#how-it-works` 提前 2100px 就 pin 住，把工作原理区直接拍在上一屏（银色 showcase）身上——表现为「下一页突然出现，再滑一下又突然消失」。

**`ScrollTrigger.refresh()` 单独调用修不好**，因为它沿用陈旧的**创建顺序**。必须两步，且有先后：

```js
ScrollTrigger.sort();     // 按文档位置重排
ScrollTrigger.refresh();  // 带着 spacer 重算 offset
```

建完 hero pin 之后要调一次；`PTMotion.refresh()`（字体就绪 / resize / 切语言的统一入口）里也做了同样两步，否则每次重排又会退回错误顺序。

验收：`#how-it-works` 的 trigger `start` 必须等于它的 `getBoundingClientRect().top + scrollY - 64`，且**重载 / 切语言 / resize 三种情况都要各验一次**。

### ⚠️ 换视频必须换文件名（2026-09-01 踩过）

**不要原地覆盖同名的 hero 视频。** 滚动锁定会发大量 Range 请求，浏览器和 Cloudflare 都**按字节区间缓存**。一旦同一个 URL 的内容变了（本次 1572114 → 1863853 字节），手上还留着旧文件部分区间的客户端会把**旧区间和新区间拼在一起**，得到一个解不出来的流——表现就是首屏卡在 poster、「视频不播放」。

规矩：

- 换视频/poster 一律**带版本后缀**（`hero-v20m-v2.mp4`），让每个客户端拿到一个它从没缓存过的 URL。这样立刻生效，不用等 `max-age=14400` 过期
- **旧文件名先留着别删**，继续指向当前内容。万一有人手上是旧 HTML，他拿到的是能播的视频而不是 404；等缓存轮换完再清理
- 排查顺序：先用 `ffprobe` 比 profile/level/pix_fmt/faststart 排除编码问题，再用**带 cache-buster 的 URL** 复现。本次编码是清白的（新旧都是 H.264 High/yuv420p/faststart，新版 level 3.1 反而比旧版 5.0 更宽容）

### 本地验证视频必须用支持 Range 的服务器

`python3 -m http.server` **对 Range 请求返回 200 而不是 206**，视频因此**完全无法 seek**，会伪装成「编解码器不支持」的假象（本项目已经误判过一次）。用 `.claude/launch.json` 里配的那个带 Range 的 dev server，或任何支持 206 的服务器。生产（Cloudflare→origin）实测返回 206，没问题。

---

## 动效层约定

- 自托管 **GSAP + ScrollTrigger + SplitText**（`assets/vendor/gsap/`）。**不走公共 CDN** —— 主力用户在中国大陆，cdnjs/jsdelivr 不稳。版本与许可记在 `THIRD-PARTY.md`。
- **内容默认可读。** 动画初态（隐藏/位移/裁切）只能写在 `.motion-ready`（GSAP 已加载并注册成功后才加）或 `.reveal-ready`（reveal controller 初始化成功后才加）之下。
  **绝不能写 `[data-motion] { opacity: 0 }` 这种顶层规则** —— 一旦 `motion.js` 404 或解析失败，内容就永久消失。
  验收必须包含：手动 404 掉 `motion.js` 本身、404 掉 vendor、禁用 JS，三种情况页面都要完整可读。
- 新效果通过 `PTMotion.register({name, build, rebuild, revert})` 注册，异常被隔离，单个效果炸掉不会带塌其他。
- **双语会改变断行**：SplitText 只能 split **当前可见**的语言 span（隐藏元素 `display:none` 没有布局，量不出行）。字体加载完成 / resize / 切语言后都要重建。
- 切语言的重建**不能只依赖 `requestAnimationFrame`** —— 后台标签页 rAF 会被暂停。用 rAF + `setTimeout` 竞速。
- **移动端不 pin。** 地址栏伸缩会改 viewport 高度，pin spacer 按旧高度算，会跳动、留巨大空隙、返回时定位错乱。用 `gsap.matchMedia()` 分支。
- 已有的 `.reveal` / `.stg-item` IntersectionObserver 系统保留，**不要和它抢同一批元素**（`.step-container` 的子元素已被它接管）。

---

## 字体

**不要引 Google Fonts。** `fonts.googleapis.com` 在中国大陆不可达，主力用户是国内调音师——旧版每页都在等一个永远连不上的域名。

现在：Inter（Latin 子集，自托管，OFL）+ **中文走系统字体**（PingFang SC / 微软雅黑）。
完整 CJK webfont 动辄数 MB，与首屏目标冲突；真要自托管 Noto Sans SC 必须 subset + `unicode-range` + 限字重 + `font-display:swap`，并计入传输预算。

---

## 内容：所有对外数字先过 Gate F

**`website-public-claims.md` 是官网允许出现的数字与状态的唯一出处，它在知识图谱 vault 里（`00-公司/官网/`），不在本仓库。**

本仓库是 **public GitHub 仓库**，生产服务器又会直接吐静态文件（`robots.txt` 返回 200），所以 claims 正文绝不能进来——里面有 prohibited 条目、专利号、内部目标和 vault 路径。仓库里只留一行 `CLAIMS-VERSION`；`.gitignore` 已封。

四态：`verified` / `target` / `prohibited` / `deprecated`。

判定规则：

> **可证明性决定去留，而不是是否泄密决定去留。**
> 没有对应测试记录、测试条件与来源的数字，即使不涉密，也不得保留。

几条长期红线：

- 精度写「**目标** ±2 音分」+「最终性能以量产版本验证结果为准」。±1 / ±0.5 / ±0.01 一律不外宣
- 不出现电机型号、扭矩、减速比、编码器型号、传动回差
- 专利只写「已进入发明专利申请程序」，**不写申请号、不描述保护范围**；「禁止拆解/逆向」属于合同与商业秘密，**只放 `terms.html`**，不能挂在专利状态后面当作其延伸
- 法定主体是 **融谱智能科技（深圳）有限公司**，品牌是 MelSpectrum。**公司没有官方英文法定名**，英文写 `融谱智能科技（深圳）有限公司, operating under the MelSpectrum brand`
- 结构化数据不许伪造交易状态：没有真实可下单的预售，就不要声明 `availability`
- 对外材料**不得把 AI Agent 当真人团队成员呈现**
- 新增文案里的数字同样要过 Gate F —— 里程碑「发生了什么」可以公开，不等于其技术细节（角度、腔体尺寸、固件包大小）可以公开

改完必须**中英两份都改**（每条文案都有 `.zh` / `.en` 双份，极易只改一半）。

---

## 渲染（官网用图/视频）

- 管线在 `~/pianotuner_cad_export/`。**当前机型是 v20m**，零件是仓库根目录的 `v20m_*.stl`（2026-08-01）；`stl/` 里是 **v13/v14 老件，和实物对不上，不要用**。
- GPU 渲染在 **train-direct**（Tesla 32GB，OptiX）。Blender 5.1.2 在 `~/blender/`，工作目录 `~/ptrender/`。
- 渲染前可以停 `llama-proxy` / `llama-router` 腾显存（约 30GB）；**只 stop 不 disable**，渲染完记得起回来。
- 场景单位是**毫米**，模型跨度约 315mm：灯光功率要按 `P ≈ rel · 4π d²` 反推，不要用「随尺寸平方缩放」的经验式，会过曝约 50 倍（踩过）。
- 官网色调基准 = 现有 hero：暗胡桃木 + 拉丝铝，平均亮度约 **luma 86/255**，主色 `#504030` / `#605040`，铝件高光约占 10%。渲完用直方图对一下再上站。
- 木纹贴图用真实 PBR（Poly Haven CC0，`tex/wood_*`），程序化木纹会「糊」。

---

## 部署：local == git == origin，三方同步

单次改动必须**同时**推服务器和推仓库，不许只做一边。

两级验收，不要混为一谈：

- **A. local ↔ origin 文件系统 —— 必须 0 差异**（在服务器上算 SHA-256，不经 Cloudflare）。这里**不允许**出现 Cloudflare 差异
- **B. Cloudflare 响应 ↔ origin —— 只允许已知 edge transform**：`/cdn-cgi/l/email-protection`、`email-decode.min.js`、Insights beacon

即：

```
local == git == origin filesystem
Cloudflare response = origin + 已知 edge transforms
```

**origin = `root@192.255.139.83:/var/www/html-pianotuner/`（云端 VPS，端口 22，前置 Cloudflare）。树莓派 `rpi@mc.void1211.com:1211:/var/www/html/` 是不承接流量的陈旧镜像 —— 部署到那里会「成功」但线上毫无变化（2026-08-29 已踩过一次）。判定 origin 只能拿 Cloudflare 实际响应体的 sha256 去比候选主机上的文件，不要拿两台候选主机互比：它们可能只是都停在同一份旧内容上。**

流程：`tar` 备份 `/var/www/html-pianotuner/` → `scp` → `chown -R www-data:www-data` → A/B 两级验收 → 同一轮 `git add/commit/push` → 复验各页 200、`/api/pianotuner/subscribe` 通、`sitemap.xml` 可达。
**部署清单必须显式排除任何 claims 文件。**

### 已知的、有意的例外

| 文件 | 状态 | 说明 |
|---|---|---|
| `demo1.mp4` | **只在 origin，不进 git**（已 gitignore） | 14MB 演示视频，按决定不入库。A 级校验会看到 origin 多这一个文件 —— **这是预期行为，不要"修复"** |
| `website-public-claims.md` | 只在 vault | 见上方 Gate F |
| `.claude/` | 只在本地 | dev server 配置 + 后台任务 worktree |

---

## grep 时注意

`.claude/worktrees/` 下可能有后台任务开的 **旧代码 checkout**，递归 grep 会扫到它并全部报红。检查站点内容请用顶层 `*.html`，或显式 `--exclude-dir`（注意 zsh 不会对未加引号的变量做词分割）。
