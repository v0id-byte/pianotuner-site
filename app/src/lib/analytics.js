// 自托管 Umami 的薄封装：脚本未加载（未配置 / 被拦截 / SSR）时静默跳过，绝不抛错。
export function track(event, data) {
  try {
    if (typeof window !== 'undefined' && window.umami && typeof window.umami.track === 'function') window.umami.track(event, data);
  } catch { /* 统计永远不能影响报名本身 */ }
}
