import { useEffect, useState } from 'react';

/**
 * 穿过判定线 y 的那个 [data-nav-theme] 区块决定导航配色。
 * line 可以是数字，或哨兵 'bottom'（在 effect 里解析成 innerHeight-8，供底部进度条用；
 * 绝不能在 render 期读 window，否则 SSR 与首帧不一致）。
 * initialTheme 来自页面 meta，让 SSR 首帧的导航就已经是对的颜色。
 */
export function useNavTheme(line = 72, initialTheme = 'dark') {
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    const check = () => {
      const y = line === 'bottom' ? window.innerHeight - 8 : line;
      const els = document.querySelectorAll('[data-nav-theme]');
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.top <= y && r.bottom > y) { setTheme(el.dataset.navTheme); return; }
      }
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [line]);
  return theme;
}
