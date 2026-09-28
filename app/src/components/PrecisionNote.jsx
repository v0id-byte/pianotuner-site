import { useT } from '../i18n';
import { href } from '../i18n/urls';

/**
 * 强制披露脚注（website-public-claims §2）：页面上任何 ±2 音分都必须带 * 角标并指向这里。
 * 措辞不得改动。IP 声明只写「已进入发明专利申请程序」，不写申请号、不写保护范围，
 * 拆解/逆向条款只在 terms。
 */
export default function PrecisionNote({ ip = true }) {
  const { t, lang } = useT();
  return (
    <section className="island-dark p-custom py-section-sm notes" data-nav-theme="dark">
      <p id="precision-note" className="notes__item">
        <span className="t-ui notes__mark">*</span>
        <span>
          {t(
            '±2 音分为实验室测试结果，测试条件与量产版本、真实琴况均可能不同。实际表现受钢琴状态、弦轴摩擦、环境温湿度与操作方式影响；最终性能以量产版本的验证结果为准。',
            '±2 cents is a laboratory test result; test conditions may differ from the production unit and from a real instrument in the field. Actual performance depends on the piano\'s condition, tuning-pin friction, ambient temperature and humidity, and how the tool is used. Final performance will be as verified on the production version.',
          )}
        </span>
      </p>
      {ip ? (
        <p className="notes__item">
          <span className="t-ui notes__mark">IP</span>
          <span>
            {t('本产品相关技术已进入发明专利申请程序，相关知识产权依法受到保护。详见', 'The technology in this product has entered the invention-patent application process; the related intellectual property is protected by law. See the')}{' '}
            <a href={href(lang, 'terms')}>{t('服务条款', 'Terms of Service')}</a>.
          </span>
        </p>
      ) : null}
    </section>
  );
}
