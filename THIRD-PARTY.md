# Third-Party Software & Assets

Everything below is **self-hosted** from this repository. The site makes no
runtime requests to third-party CDNs — mainland China is our primary market and
public CDNs (and Google Fonts) are unreliable or unreachable there.

## JavaScript

| Component | Version | Retrieved | Source | License |
|---|---|---|---|---|
| GSAP (core) | 3.15.0 | 2026-08-29 | https://github.com/greensock/GSAP · https://gsap.com | GreenSock Standard "No Charge" License — https://gsap.com/standard-license |
| GSAP ScrollTrigger | 3.15.0 | 2026-08-29 | same package | same |
| GSAP SplitText | 3.15.0 | 2026-08-29 | same package | same |

Files: `assets/vendor/gsap/{gsap,ScrollTrigger,SplitText}.min.js`
Obtained via `https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/<file>` (npm package `gsap`).

Since Webflow's acquisition of GreenSock, the entire GSAP toolset — including
plugins that were previously Club GSAP-only, such as SplitText and DrawSVG — is
free for commercial use. No membership, license key, or auth token is required.
The upstream license headers are preserved verbatim in the minified files.

## Fonts

| Component | Version | Retrieved | Source | License |
|---|---|---|---|---|
| Inter (Latin subset, variable) | @fontsource-variable/inter | 2026-08-29 | https://github.com/rsms/inter | SIL Open Font License 1.1 |

File: `assets/fonts/inter-latin-wght-normal.woff2`
Chinese text intentionally uses **system faces** (PingFang SC / Microsoft YaHei /
Hiragino Sans GB) rather than a self-hosted CJK webfont: a full CJK face is
measured in megabytes, which would defeat the purpose of dropping Google Fonts.

## Explicitly NOT used

**Entropy Piano Tuner** (GPLv3) — we have studied the published behaviour of
prior-art tuning software, but **no EPT source code is copied, ported, linked, or
derived from** in this site, the firmware, or the app. Algorithms as such are not
protected by copyright; the source is, and we do not use it.
