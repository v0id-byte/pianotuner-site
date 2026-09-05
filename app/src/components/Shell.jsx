import { useT } from '../i18n';
import { useNavTheme } from '../lib/useNavTheme';
import Nav from './Nav';
import Footer from './Footer';
import Progress from './Progress';
import LangHint from './LangHint';

/** 每页共用的壳：skip link + 固定导航 + <main> + 页脚 + 底部进度条。 */
export default function Shell({ page, navTheme = 'dark', children }) {
  const { t } = useT();
  const theme = useNavTheme(72, navTheme);
  const bottom = useNavTheme('bottom', navTheme);
  return (
    <>
      <a className="skip-link t-ui" href="#main">{t('跳到主要内容', 'Skip to content')}</a>
      <Nav theme={theme} page={page} />
      <LangHint />
      <main id="main">{children}</main>
      <Footer page={page} />
      <Progress theme={bottom} />
    </>
  );
}
