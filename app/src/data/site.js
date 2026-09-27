// 站点级常量。数字口径以 vault 的 website-public-claims.md 为准（仓库只留 CLAIMS-VERSION 指针）。
export const TESTFLIGHT = 'https://testflight.apple.com/join/hV2YV4eE';
export const MELSPECTRUM = 'https://melspectrum.com';
export const EMAIL_PRIMARY = 'v0id@melspectrum.com'; // 首选联系邮箱（用户 2026-09-27 指定）
export const EMAIL_REPORT = 'report@pianotuner.top';
export const EMAIL_BUSINESS = 'business@pianotuner.top';
export const EMAIL_SUPPORT = 'support@pianotuner.top';
export const SUBSCRIBE_API = '/api/pianotuner/subscribe';
export const LEGAL_ZH = '融谱智能科技（深圳）有限公司';
export const LEGAL_EN = '融谱智能科技（深圳）有限公司, operating under the MelSpectrum brand';
// 自托管 Umami（origin 同源反代 /u.js、/u/e）。留空 = 不注入统计脚本（服务端未就绪时保持零 404）。
export const UMAMI_WEBSITE_ID = '';
