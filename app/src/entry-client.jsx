import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { LangProvider } from './i18n';
import MotionProvider from './lib/motion/MotionProvider.jsx';
import { PAGES_BY_ID } from './pages/registry.js';
import './styles/tokens.css';
import './styles/app.css';
import './styles/motion.css';
import './styles/pages.css';

const el = document.documentElement;
const lang = el.dataset.lang === 'en' ? 'en' : 'zh';
const entry = PAGES_BY_ID[el.dataset.page];
if (!entry) throw new Error(`unknown page: ${el.dataset.page}`);
const { Page } = entry;

// MotionProvider 在 LangProvider 内、页面外，且只透传 children，
// 所以只在客户端包裹不会改变 hydrate 时比对的树形。
const tree = (
  <StrictMode>
    <LangProvider lang={lang}>
      <MotionProvider>
        <Page />
      </MotionProvider>
    </LangProvider>
  </StrictMode>
);

const root = document.getElementById('root');
// 不猜 DOM：预渲染页在 <html> 上写 data-ssr="1"，dev 中间件写 "0"。
if (el.dataset.ssr === '1') hydrateRoot(root, tree);
else createRoot(root).render(tree);
