import { useRef, useState } from 'react';
import { useT } from '../../i18n';
import Shell from '../../components/Shell';
import Scramble from '../../components/Scramble';
import PageHero from '../../components/PageHero';
import SubscribeForm from '../../components/SubscribeForm';
import { Button, Eyebrow, SectionHead } from '../../components/ui';
import { useTextReveal, useReveal, useStackDeck } from '../../lib/motion/hooks';
import { EMAIL_REPORT, EMAIL_BUSINESS } from '../../data/site';

export const meta = {
  navTheme: 'dark',
  zh: { title: '联系我们 | Piano Tuner', desc: 'Piano Tuner 联系方式：常规咨询与技术支持、微信客服、商务合作（琴行 / 钢琴厂 / 调律师）。我们将在 1–2 个工作日内回复。' },
  en: { title: 'Contact Us | Piano Tuner', desc: 'Contact Piano Tuner: general inquiries and support, WeChat, business partnerships (piano stores, manufacturers, tuners). We reply within 1–2 business days.' },
  jsonLd: (lang, { self }) => ({
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    url: self,
    name: lang === 'en' ? 'Contact Piano Tuner' : '联系 Piano Tuner',
  }),
};

const TYPES = [
  ['general', '常规咨询', 'General inquiry', EMAIL_REPORT],
  ['store', '琴行合作', 'Piano store partnership', EMAIL_BUSINESS],
  ['manufacturer', '钢琴厂合作', 'Manufacturer partnership', EMAIL_BUSINESS],
  ['tuner', '调律师合作', 'Tuner partnership', EMAIL_BUSINESS],
  ['bulk', '批量采购', 'Bulk order', EMAIL_BUSINESS],
  ['oem', 'OEM / 定制', 'OEM / custom', EMAIL_BUSINESS],
  ['other', '其他', 'Other', EMAIL_REPORT],
];

/** 留言表单没有后端：校验后拼 mailto 交给用户自己的邮件客户端（与旧站行为一致）。 */
function MessageForm() {
  const { t, lang } = useT();
  const [err, setErr] = useState('');
  const onSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get('name') || '').toString().trim();
    const email = (fd.get('email') || '').toString().trim();
    const type = (fd.get('type') || '').toString();
    const msg = (fd.get('message') || '').toString().trim();
    if (!name || !email || !type || !msg) { setErr(t('请填写所有字段。', 'Please fill in every field.')); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setErr(t('请输入有效的邮箱地址。', 'Please enter a valid email address.')); return; }
    const row = TYPES.find((x) => x[0] === type) || TYPES[0];
    const label = lang === 'en' ? row[2] : row[1];
    const subject = encodeURIComponent(`[Piano Tuner] ${label} — ${name}`);
    const body = encodeURIComponent(`${t('姓名', 'Name')}: ${name}\n${t('邮箱', 'Email')}: ${email}\n${t('类型', 'Type')}: ${label}\n\n${msg}`);
    setErr('');
    window.location.href = `mailto:${row[3]}?subject=${subject}&body=${body}`;
  };
  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <label><span className="t-ui">{t('姓名', 'NAME')}</span><input name="name" type="text" required autoComplete="name" /></label>
      <label><span className="t-ui">{t('邮箱', 'EMAIL')}</span><input name="email" type="email" required autoComplete="email" /></label>
      <label>
        <span className="t-ui">{t('合作类型', 'INQUIRY TYPE')}</span>
        <select name="type" required defaultValue="">
          <option value="" disabled>{t('请选择…', 'Please select…')}</option>
          {TYPES.map(([v, zh, en]) => <option value={v} key={v}>{t(zh, en)}</option>)}
        </select>
      </label>
      <label><span className="t-ui">{t('留言内容', 'MESSAGE')}</span><textarea name="message" required /></label>
      <div><Button type="submit" variant="dark">{t('发送消息', 'Send message')}</Button></div>
      <p className="t-body-sm" role="alert" style={{ minHeight: '1.4em', margin: 0, color: 'var(--color-charcoal)' }}>{err}</p>
    </form>
  );
}

export default function Contact() {
  const { t } = useT();
  const root = useRef(null);
  const deck = useRef(null);
  useTextReveal(root);
  useReveal(root);
  useStackDeck(deck);
  const b2b = [
    { num: '01 · STORES', title: t('琴行合作', 'Piano stores'), desc: t('为琴行客户提供设备租赁、联合销售分成、门店演示等合作模式。', 'Equipment leasing, joint sales, in-store demos for piano retailers.') },
    { num: '02 · MANUFACTURERS', title: t('钢琴厂合作', 'Manufacturers'), desc: t('OEM/ODM 定制、批量采购、预装调律服务整合。', 'OEM/ODM customization, bulk orders, factory tuning integration.') },
    { num: '03 · TUNERS', title: t('调律师合作', 'Tuners'), desc: t('调律师专属折扣、批量采购优惠、技术培训支持。', 'Exclusive tuner discounts, bulk pricing, technical training.') },
  ];
  return (
    <Shell page="contact" navTheme="dark">
      <PageHero
        eyebrow={t('CONTACT · 联系我们', 'CONTACT')}
        l1={t('有问题或合作意向？', 'Questions or partnerships?')}
        l2={t('欢迎来信。', "We'd love to hear from you.")}
      />
      <section className="island-light p-custom py-section" data-nav-theme="light" ref={root}>
        <div className="contact-grid" ref={deck}>
          <article className="card" data-stack-card>
            <Scramble className="card__num t-ui">01 · EMAIL</Scramble>
            <h3 className="t-h3">{t('电子邮件', 'Email')}</h3>
            <p className="card__desc t-body-sm">{t('常规咨询与技术支持', 'General inquiries & tech support')}</p>
            <a className="blink t-ui literal" href={`mailto:${EMAIL_REPORT}`}>{EMAIL_REPORT}</a>
          </article>
          <article className="card" data-stack-card>
            <Scramble className="card__num t-ui">02 · WECHAT</Scramble>
            <h3 className="t-h3">{t('微信客服', 'WeChat')}</h3>
            <p className="card__desc t-body-sm">{t('微信搜索或扫码添加企业微信', 'Search or scan to add us on WeChat')}</p>
            <img className="qr" src="/images/wechat-qr.webp" alt={t('企业微信二维码', 'WeChat QR code')} width="160" height="160" loading="lazy" />
          </article>
          <article className="card" data-stack-card>
            <Scramble className="card__num t-ui">03 · BUSINESS</Scramble>
            <h3 className="t-h3">{t('商务合作', 'Business')}</h3>
            <p className="card__desc t-body-sm">{t('B2B 合作与批量采购', 'B2B partnerships & bulk orders')}</p>
            <a className="blink t-ui literal" href={`mailto:${EMAIL_BUSINESS}`}>{EMAIL_BUSINESS}</a>
          </article>
        </div>
        <div style={{ marginTop: 'var(--gap-y-lg)' }}>
          <SectionHead eyebrow={t('ENTERPRISE · 企业级合作', 'ENTERPRISE')} title={t('企业级合作', 'Enterprise partnership')} sub={t('面向琴行、钢琴厂与专业调律师。', 'For piano stores, manufacturers, and professional tuners.')} />
          <div className="steps">
            {b2b.map((s) => (
              <article className="step" key={s.num}>
                <Scramble className="card__num t-ui">{s.num}</Scramble>
                <h3 className="t-h3">{s.title}</h3>
                <p className="card__desc t-body-sm">{s.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <div className="gasket" aria-hidden="true" />
      <section className="island-dark p-custom py-section" data-nav-theme="dark">
        <div className="product">
          <div className="product__body">
            <Eyebrow>{t('PRE-ORDER ALERTS · 开售通知', 'PRE-ORDER ALERTS')}</Eyebrow>
            <h2 className="t-h2">{t('开售通知 · 抢先登记', 'Pre-order alerts')}</h2>
            <p className="t-body" style={{ color: 'var(--color-silver)', maxWidth: '48ch' }}>{t('留下邮箱，新一轮早鸟预售开启时第一时间通知你。', "Leave your email and we'll notify you the moment the next early-bird round opens.")}</p>
            <SubscribeForm source="contact-page" dark />
          </div>
          <div className="product__side">
            <Eyebrow>{t('MESSAGE · 给我们留言', 'MESSAGE')}</Eyebrow>
            <h2 className="t-h2" style={{ marginTop: 16 }}>{t('给我们留言', 'Send a message')}</h2>
            <p className="t-body-sm" style={{ color: 'var(--color-silver)', margin: '12px 0 20px' }}>{t('我们将在 1–2 个工作日内回复。提交后会打开你的邮件客户端。', 'We reply within 1–2 business days. Submitting opens your mail client.')}</p>
            <MessageForm />
          </div>
        </div>
      </section>
    </Shell>
  );
}
