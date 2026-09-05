import { useState } from 'react';
import { useT } from '../i18n';
import { SUBSCRIBE_API } from '../data/site';
import { Button } from './ui';

/** 「通知我开售」邮件收集，POST 到同源 /api/pianotuner/subscribe（nginx 反代到后端）。 */
export default function SubscribeForm({ source, dark = false }) {
  const { t, lang } = useT();
  const [status, setStatus] = useState(null); // null | 'sending' | 'ok' | 'err' | 'invalid'
  const onSubmit = async (e) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email')?.toString().trim() || '';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setStatus('invalid'); return; }
    setStatus('sending');
    try {
      const r = await fetch(SUBSCRIBE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, lang }),
      });
      setStatus(r.ok ? 'ok' : 'err');
    } catch {
      setStatus('err');
    }
  };
  const msg = {
    invalid: t('请输入有效的邮箱地址。', 'Please enter a valid email address.'),
    sending: t('提交中…', 'Sending…'),
    ok: t('已登记。开售时我们会第一时间通知你。', 'Registered. We will notify you the moment sales open.'),
    err: t('提交失败，请稍后再试，或直接写邮件给我们。', 'Submission failed — please try again later, or email us directly.'),
  }[status];
  return (
    <form className={`subscribe${dark ? ' subscribe--dark' : ''}`} onSubmit={onSubmit} noValidate>
      <label className="t-ui subscribe__label" htmlFor={`sub-${source}`}>{t('邮箱', 'EMAIL')}</label>
      <div className="subscribe__row">
        <input id={`sub-${source}`} className="subscribe__input" type="email" name="email" required
               placeholder={t('you@example.com', 'you@example.com')} autoComplete="email" />
        <Button type="submit" variant={dark ? 'accent' : 'dark'}>{t('通知我开售', 'Notify me')}</Button>
      </div>
      <p className="t-body-sm subscribe__status" role="status" aria-live="polite">{msg || ''}</p>
    </form>
  );
}
