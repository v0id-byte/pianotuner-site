// dev 服务器的多页映射：/ /x.html /en/ /en/x.html -> (page, lang)。
// 客户端渲染（#root 留空、data-ssr="0"），head 与生产走同一个 head.js。
// 必须经 server.transformIndexHtml，否则会绕过 React 插件的 Fast Refresh preamble。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PAGES, REDIRECTS } from './paths.mjs';

export function mpaDev() {
  return {
    name: 'pt-mpa-dev',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url, 'http://x');
          let p = url.pathname;
          const lang = p.startsWith('/en/') || p === '/en' ? 'en' : 'zh';
          if (lang === 'en') p = p.slice(3) || '/';
          let page;
          if (p === '/' || p === '/index.html') page = 'index';
          else if (/^\/[a-z_]+\.html$/.test(p)) page = p.slice(1, -5);
          else return next();
          if (REDIRECTS[page]) {
            res.statusCode = 302;
            res.setHeader('Location', (lang === 'en' ? '/en/' : '/') + `${REDIRECTS[page]}.html`);
            return res.end();
          }
          if (!PAGES.includes(page)) return next();

          const { renderHead, htmlAttrs } = await server.ssrLoadModule('/src/pages/head.js');
          const template = readFileSync(join(server.config.root, 'index.html'), 'utf8');
          let html = template
            .replace(/<html[^>]*>/, `<html ${htmlAttrs(page, lang, false)}>`)
            .replace('<!--app-head-->', renderHead(page, lang))
            .replace('<!--app-html-->', '');
          html = await server.transformIndexHtml(req.url, html);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(html);
        } catch (e) {
          next(e);
        }
      });
    },
  };
}
