import { useEffect } from 'react';

// 自托管 Umami 的薄封装：脚本未加载（未配置 / 被拦截 / SSR）时静默跳过，绝不抛错。
//
// 事件约定（2026-10-01，分级见 vault 00-公司/官网/SEO-关键词与基线-2026-10.md）：
//   T1 转化   waitlist-signup {source, role, lang} · cta-testflight {at} · contact-email
//   T2 高意向 cta-waitlist {at} · cta-pro {at} · demo-complete
//   T3 参与度 demo-play · scroll-50 · scroll-90 · guide-product-click {guide, target}
// 同一个用户动作只能有一种发射方式：静态链接 / 按钮用 data-umami-event(-<key>) 属性，
// 程序事件（表单成功、视频、滚动、指南正文点击）用 track()。同一元素禁止两种都用。
// 属性值只用下面的枚举，别随手写新值（nav / navbar / header 会把数据切碎）。
export const AT = ['hero', 'index', 'nav', 'footer', 'pro', 'about', 'demo', 'buy', 'guide', '404'];
export const TARGET = ['product', 'pro', 'demo'];

export function track(event, data) {
  try {
    if (typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function') window.umami.track(event, data);
  } catch { /* 统计永远不能影响报名本身 */ }
}

/** scroll-50 / scroll-90：每次页面加载各最多一次（MPA：一次加载 = 一次挂载），都发完就摘监听。 */
export function useScrollDepth() {
  useEffect(() => {
    const sent = new Set();
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const p = window.scrollY / max;
      for (const [mark, ev] of [[0.5, 'scroll-50'], [0.9, 'scroll-90']]) {
        if (p >= mark && !sent.has(ev)) { sent.add(ev); track(ev); }
      }
      if (sent.size === 2) window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
}

/** 指南正文里通往产品 / Pro / Demo 的点击 → guide-product-click {guide, target}。
 *  只看 #main 内、没有 data-umami-event 的链接（Nav / Footer 与静态 CTA 各有自己的事件）。 */
export function useGuideProductClicks(guide) {
  useEffect(() => {
    const onClick = (e) => {
      const a = e.target.closest?.('#main a[href]');
      if (!a || a.hasAttribute('data-umami-event')) return;
      const path = new URL(a.href, location.href).pathname.replace(/^\/en\//, '/');
      const target = path === '/' ? 'product' : path === '/pro.html' ? 'pro' : path === '/demo.html' ? 'demo' : null;
      if (target) track('guide-product-click', { guide, target });
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [guide]);
}
