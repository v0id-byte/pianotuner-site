import { useEffect, useRef } from 'react';

/**
 * 底部固定进度条。spur 那里是实时 IP 计数器；我们没有实时指标，编一个就是撒谎——
 * 所以这里是一条静态身份读数。不放任何精度数字（全局 chrome 无处承载角标与脚注）。
 */
export default function Progress({ theme }) {
  const barRef = useRef(null);
  const labelRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      const bar = barRef.current;
      const label = labelRef.current;
      if (!bar || !label) return;
      bar.style.width = `${p * 100}%`;
      const x = Math.max(0, bar.offsetWidth - label.offsetWidth);
      label.style.transform = `translateX(${x}px)`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  const color = theme === 'light' ? 'var(--color-black)' : 'var(--color-accent)';
  return (
    <div className="progress" aria-hidden="true">
      <div className="progress__label t-ui" ref={labelRef} style={{ color }}>⬡ PIANO TUNER · iOS TESTFLIGHT</div>
      <div className="progress__bar" ref={barRef} style={{ background: color }} />
    </div>
  );
}
