import { useCallback, useEffect, useRef, useState } from 'react';
import { useT } from '../i18n';
import { href, counterpart } from '../i18n/urls';
import { Button } from './ui';
import { TESTFLIGHT } from '../data/site';

const LINKS = [
  { id: 'pro', zh: '专业版', en: 'Pro' },
  { id: 'demo', zh: '实测演示', en: 'Demo' },
  { id: 'support', zh: '帮助', en: 'Support' },
  { id: 'about', zh: '关于', en: 'About' },
  { id: 'contact', zh: '联系', en: 'Contact' },
];

const remember = (l) => { try { localStorage.setItem('pt_lang', l); } catch { /* ignore */ } };

/** 语言开关：两个真 <a>（中键/新标签/复制链接都对），点击记住偏好。 */
export function LangToggle({ page }) {
  const { lang } = useT();
  const zhActive = lang !== 'en';
  return (
    <div className="lang-toggle t-ui">
      {zhActive
        ? <span aria-current="true" className="is-on">中</span>
        : <a href={counterpart('en', page)} hrefLang="zh-CN" onClick={() => remember('zh')}>中</a>}
      {zhActive
        ? <a href={counterpart('zh', page)} hrefLang="en" onClick={() => remember('en')}>EN</a>
        : <span aria-current="true" className="is-on">EN</span>}
    </div>
  );
}

/** 移动菜单：原生 <dialog>，模态焦点收容 / ESC / top layer 免费拿到。 */
function MobileMenu({ open, onClose, openerRef, page }) {
  const ref = useRef(null);
  const { t, lang } = useT();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      try { el.showModal(); } catch { el.close(); el.showModal(); }
      document.body.style.overflow = 'hidden';
      window.__lenis?.stop();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') { e.preventDefault(); ref.current?.close(); } };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);
  const handleClose = useCallback(() => {
    document.body.style.overflow = '';
    window.__lenis?.start();
    openerRef.current?.focus();
    onClose();
  }, [onClose, openerRef]);
  return (
    <dialog className="menu" ref={ref} onClose={handleClose} aria-label={t('主菜单', 'Main menu')}>
      <div className="menu__inner">
        <div className="menu__top" style={{ '--i': 0 }}>
          <span className="t-ui">MENU</span>
          <button type="button" className="menu__close t-ui" onClick={() => ref.current?.close()}>
            {t('关闭', 'Close')} ✕
          </button>
        </div>
        <a href={href(lang, 'index')} style={{ '--i': 1 }}>{t('首页', 'Home')}</a>
        {LINKS.map((l, n) => (
          <a key={l.id} href={href(lang, l.id)} aria-current={page === l.id ? 'page' : undefined} style={{ '--i': n + 2 }}>{t(l.zh, l.en)}</a>
        ))}
        <a href={href(lang, 'buy')} style={{ '--i': LINKS.length + 2 }}>{t('加入候补名单', 'Join the waitlist')}</a>
        <div className="menu__foot" style={{ '--i': LINKS.length + 3 }}>
          <LangToggle page={page} />
          <Button href={TESTFLIGHT} external>{t('TestFlight 体验 App', 'Get the app on TestFlight')}</Button>
        </div>
      </div>
    </dialog>
  );
}

export default function Nav({ theme = 'dark', page }) {
  const { t, lang } = useT();
  const [menuOpen, setMenuOpen] = useState(false);
  const burgerRef = useRef(null);
  return (
    <>
      <div className="nav-frame">
        <nav className="nav" data-theme={theme} aria-label={t('主导航', 'Primary')}>
          <a className="nav__brand" href={href(lang, 'index')}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" className="nav__mark" width="20" height="20" aria-hidden="true" focusable="false"><g fill="currentColor" color="currentColor"><g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M16 12.75 Q17.955 6.425 16 1.25"/><path d="M18.541 13.974 Q24.705 11.559 27.532 6.804"/><path d="M19.169 16.723 Q24.9 20.037 30.38 19.282"/><path d="M17.41 18.928 Q18.393 25.475 22.4 29.289"/><path d="M14.59 18.928 Q10.084 23.779 9.6 29.289"/><path d="M12.831 16.723 Q6.23 16.225 1.62 19.282"/><path d="M13.459 13.974 Q9.733 8.502 4.468 6.804"/></g></g></svg>
            <span className="nav__name">PIANO TUNER</span>
            <span aria-hidden="true">{t('钢琴调音机器人', 'Piano tuning robot')}</span>
          </a>
          <div className="nav__spacer" />
          <div className="nav__links t-ui">
            {LINKS.map((l) => (
              <a key={l.id} className="nav__link" href={href(lang, l.id)} aria-current={page === l.id ? 'page' : undefined}>
                {t(l.zh, l.en)}
              </a>
            ))}
          </div>
          <a className="nav__asn t-ui" href={href(lang, 'buy')} title={t('加入候补名单', 'Join the waitlist')}>
            {t('候补名单', 'WAITLIST')}
          </a>
          <LangToggle page={page} />
          <div className="nav__links">
            <Button href={TESTFLIGHT} external>{t('TestFlight 体验', 'TestFlight')}</Button>
          </div>
          <button
            type="button"
            ref={burgerRef}
            className="nav__burger"
            aria-label={t('打开菜单', 'Open menu')}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            <i /><i /><i />
          </button>
        </nav>
      </div>
      <div id="mobile-menu">
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} openerRef={burgerRef} page={page} />
      </div>
    </>
  );
}
