import { createContext, useContext, useMemo } from 'react';

// 语言是构建期常量：每个 HTML 只渲染一种语言，运行时永不切换。
// t(zh, en) 的 API 与 melspectrum 完全一致，组件可以原样迁移。
const LangCtx = createContext({ lang: 'zh', t: (zh) => zh });

export function LangProvider({ lang, children }) {
  const value = useMemo(
    () => ({ lang, t: (zh, en) => (lang === 'en' && en !== undefined ? en : zh) }),
    [lang],
  );
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export const useT = () => useContext(LangCtx);
