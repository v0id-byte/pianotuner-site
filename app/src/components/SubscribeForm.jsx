import { useState } from 'react';
import { useT } from '../i18n';
import { href } from '../i18n/urls';
import { SUBSCRIBE_API } from '../data/site';
import { track } from '../lib/analytics';
import { Button } from './ui';

const ROLES = [
  ['tuner', '调律师', 'Piano tuner'],
  ['owner', '琴主', 'Piano owner'],
  ['org', '琴行 / 学校', 'Store / school'],
  ['other', '其他', 'Other'],
];

/** 「通知我开售」邮件收集，POST 到同源 /api/pianotuner/subscribe（nginx 反代到后端）。身份单选可不填。 */
export default function SubscribeForm({ source, dark = false }) {
  const { t, lang } = useT();
  const [status, setStatus] = useState(null); // null | 'sending' | 'ok' | 'err' | 'invalid'
  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'ok' || status === 'sending') return;
    const fd = new FormData(e.currentTarget);
    const email = fd.get('email')?.toString().trim() || '';
    const role = fd.get('role')?.toString() || '';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { setStatus('invalid'); return; }
    setStatus('sending');
    try {
      const r = await fetch(SUBSCRIBE_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source, lang, role }),
      });
      setStatus(r.ok ? 'ok' : 'err');
      if (r.ok) track('waitlist-signup', { source, role: role || 'none', lang });
    } catch {
      setStatus('err');
    }
  };
  const msg = {
    invalid: t('请输入有效的邮箱地址。', 'Please enter a valid email address.'),
    sending: t('提交中…', 'Sending…'),
    ok: t('已登记。开售时第一时间通知你（首次登记会收到确认邮件）。', "You're on the list — we'll notify you the moment sales open (first-time sign-ups get a confirmation email)."),
    err: t('提交失败，请稍后再试，或直接写邮件给我们。', 'Submission failed — please try again later, or email us directly.'),
  }[status];
  const done = status === 'ok';
  const id = `sub-${source}`;
  return (
    <form className={`subscribe topic-brass${dark ? ' subscribe--dark' : ''}`} onSubmit={onSubmit} noValidate>
      <label className="t-ui subscribe__label" htmlFor={id}>{t('邮箱', 'EMAIL')}</label>
      <div className="subscribe__row">
        <input id={id} className="subscribe__input" type="email" name="email" required disabled={done}
               placeholder={t('you@example.com', 'you@example.com')} autoComplete="email" />
        <Button type="submit" variant={dark ? 'accent' : 'dark'}>{done ? t('已登记', 'Done') : t('通知我开售', 'Notify me')}</Button>
      </div>
      <fieldset className="subscribe__roles" disabled={done}>
        <legend className="t-body-sm">{t('我是（选填）', 'I am a… (optional)')}</legend>
        {ROLES.map(([v, zh, en]) => (
          <label key={v} className="t-body-sm"><input type="radio" name="role" value={v} /> {t(zh, en)}</label>
        ))}
      </fieldset>
      {!done && <p className="t-body-sm subscribe__note">{t('只在开售与重要进展时写信，不发广告；想退出，回信告诉我们即可。', 'We only write when sales open or something important ships — no ads. Reply any time to be removed.')}</p>}
      <p className="t-body-sm subscribe__status" role="status" aria-live="polite">
        {msg || ''}
        {done && <> <a href={href(lang, 'contact')}>{t('有问题？直接联系我们 →', 'Questions? Contact us →')}</a></>}
      </p>
    </form>
  );
}
