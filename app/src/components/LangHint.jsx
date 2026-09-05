import { useEffect, useState } from 'react';

/**
 * 语言提示条：只有 head 内联脚本判定「无存储偏好且 UA 非中文」时才出现。
 * 完全在 effect 里决定显示，不进 SSR，杜绝 hydration mismatch。关闭即记住中文偏好。
 */
export default function LangHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(document.documentElement.dataset.langHint === 'en');
  }, []);
  if (!show) return null;
  const alt = typeof document !== 'undefined' ? document.documentElement.dataset.altUrl : '/en/';
  const remember = (l) => { try { localStorage.setItem('pt_lang', l); } catch { /* ignore */ } };
  return (
    <div className="lang-hint t-ui" role="status">
      <span>English version available</span>
      <a href={alt} onClick={() => remember('en')}>[ EN → ]</a>
      <button type="button" onClick={() => { remember('zh'); setShow(false); }} aria-label="Dismiss">✕</button>
    </div>
  );
}
