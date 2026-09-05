import { renderToString } from 'react-dom/server';
import { LangProvider } from './i18n';
import { PAGES_BY_ID } from './pages/registry.js';
import { renderHead, htmlAttrs, renderRedirectStub } from './pages/head.js';

// 不包 MotionProvider：它只透传 children，Lenis 不该进 SSR 图。
// 这里没有 jsdom：任何 render 期读 window 的代码会在构建期直接抛错，这就是测试。
export function render(pageId, lang) {
  const entry = PAGES_BY_ID[pageId];
  if (!entry) throw new Error(`unknown page: ${pageId}`);
  const { Page } = entry;
  const html = renderToString(
    <LangProvider lang={lang}>
      <Page />
    </LangProvider>,
  );
  return { html, head: renderHead(pageId, lang), htmlAttrs: htmlAttrs(pageId, lang, true) };
}

export { renderRedirectStub, PAGES_BY_ID };
