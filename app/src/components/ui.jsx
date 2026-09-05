import { useT } from '../i18n';

export function Arrow() {
  return (
    <svg viewBox="0 0 11 10" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M1 5H10M10 5L6 0.5M10 5L6 9.5" />
    </svg>
  );
}

/** [ LABEL → ] — 全站默认 CTA。 */
export function BracketLink({ href, children, external = false, highlight = false, className = '' }) {
  const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a className={`blink t-ui${highlight ? ' hl' : ''}${className ? ` ${className}` : ''}`} href={href} {...ext}>
      <span aria-hidden="true">[</span>
      <span>{children}</span>
      <Arrow />
      <span aria-hidden="true">]</span>
    </a>
  );
}

export function Button({ href, children, variant = 'accent', external = false, type, onClick, className = '' }) {
  const cls = `btn btn--${variant} t-ui${className ? ` ${className}` : ''}`;
  if (!href) {
    return (
      <button type={type || 'button'} className={cls} onClick={onClick}>
        <span>{children}</span>
        <i aria-hidden="true" />
      </button>
    );
  }
  const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a className={cls} href={href} {...ext}>
      <span>{children}</span>
      <i aria-hidden="true" />
    </a>
  );
}

export function Eyebrow({ children, plain = false, inverse = false }) {
  return (
    <span className={`t-ui eyebrow${plain ? ' eyebrow--plain' : ''}${inverse ? ' eyebrow--inverse' : ''}`}>
      {children}
    </span>
  );
}

/** 精度角标：放在 .reveal-text 之外，避免 SplitText 深切链接节点。 */
export function Fn() {
  const { t } = useT();
  return (
    <sup className="fn-ref">
      <a href="#precision-note" aria-label={t('精度说明', 'Precision note')}>*</a>
    </sup>
  );
}

/** 区块标题块。h2 带 reveal-text；基态永远可见。 */
export function SectionHead({ eyebrow, title, sub, id }) {
  return (
    <div className="sec-head grid-custom" id={id}>
      <div className="sec-head__eyebrow">
        <Eyebrow>{eyebrow}</Eyebrow>
      </div>
      <h2 className="t-h2 reveal-text">{title}</h2>
      {sub ? <p className="t-body">{sub}</p> : null}
    </div>
  );
}

export const useLang = () => useT();
