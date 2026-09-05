import { useT } from '../i18n';
import { href } from '../i18n/urls';
import { LangToggle } from './Nav';
import { TESTFLIGHT, MELSPECTRUM, EMAIL_REPORT, EMAIL_BUSINESS, LEGAL_ZH, LEGAL_EN } from '../data/site';

export default function Footer({ page }) {
  const { t, lang } = useT();
  return (
    <footer className="island-dark p-custom py-section-sm footer" data-nav-theme="dark">
      <div className="footer__cols">
        <div className="footer__col">
          <h3 className="t-ui">{t('产品', 'PRODUCT')}</h3>
          <a href={href(lang, 'index')}>{t('首页', 'Home')}</a>
          <a href={href(lang, 'pro')}>{t('专业版', 'Pro')}</a>
          <a href={href(lang, 'demo')}>{t('实测演示', 'Demo')}</a>
          <a href={href(lang, 'buy')}>{t('预售与候补名单', 'Pre-order & waitlist')}</a>
          <a href={TESTFLIGHT} target="_blank" rel="noopener noreferrer">TESTFLIGHT ↗</a>
        </div>
        <div className="footer__col">
          <h3 className="t-ui">{t('支持', 'SUPPORT')}</h3>
          <a href={href(lang, 'support')}>{t('帮助与支持中心', 'Support center')}</a>
          <a href={href(lang, 'index', 'faq')}>{t('常见问题', 'FAQ')}</a>
          <a href={href(lang, 'contact')}>{t('联系我们', 'Contact')}</a>
        </div>
        <div className="footer__col">
          <h3 className="t-ui">{t('公司', 'COMPANY')}</h3>
          <a href={href(lang, 'about')}>{t('关于我们', 'About')}</a>
          <a href={MELSPECTRUM} target="_blank" rel="noopener noreferrer">MELSPECTRUM.COM ↗</a>
          <a href={href(lang, 'privacy')}>{t('隐私政策', 'Privacy')}</a>
          <a href={href(lang, 'terms')}>{t('服务条款', 'Terms')}</a>
        </div>
        <div className="footer__col">
          <h3 className="t-ui">{t('联系', 'CONTACT')}</h3>
          <a className="literal" href={`mailto:${EMAIL_REPORT}`}>{EMAIL_REPORT}</a>
          <a className="literal" href={`mailto:${EMAIL_BUSINESS}`}>{EMAIL_BUSINESS}</a>
          <div className="footer__lang"><LangToggle page={page} /></div>
        </div>
      </div>
      <div className="footer__legal t-ui">
        <span>© 2026 {lang === 'en' ? LEGAL_EN : LEGAL_ZH}</span>
        <span>{t('Piano Tuner · 用创新造就美好 · 保留所有权利', 'Piano Tuner · All rights reserved')}</span>
      </div>
    </footer>
  );
}
