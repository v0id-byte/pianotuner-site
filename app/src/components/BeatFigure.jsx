import { useEffect, useRef } from 'react';
import { useT } from '../i18n';
import { gsap, prefersReduced } from '../lib/motion';

/**
 * 拍频物理示意：两个相近的音叠加产生「拍」，滚动把失谐量推到零。
 * canvas 是装饰（aria-hidden），读数与说明都在 DOM 文本里。不是实测数据，图注写明。
 */
export default function BeatFigure() {
  const { t, lang } = useT();
  const fig = useRef(null);
  const cv = useRef(null);
  const numRef = useRef(null);
  useEffect(() => {
    const canvas = cv.current;
    const figure = fig.current;
    if (!canvas || !figure) return undefined;
    const ctx = canvas.getContext('2d');
    const F1 = 220;
    const state = { detune: prefersReduced() ? 0 : 6.0 };
    let W = 0, H = 0;
    const cs = getComputedStyle(document.documentElement);
    const ACCENT = cs.getPropertyValue('--color-accent').trim() || '#2DD4BF';
    const WHITE = '#fafafa';
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas.getBoundingClientRect();
      if (!r.width) return false;
      W = Math.round(r.width); H = Math.round(r.height);
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };
    const draw = () => {
      if (!W && !resize()) return;
      const df = state.detune;
      const f2 = F1 + df;
      const SPAN = 3.2, VIS = 1 / 60;
      ctx.clearRect(0, 0, W, H);
      const lane = H / 3.25, amp = lane * 0.30;
      const y1 = lane * 0.52, y2 = lane * 1.45, y3 = lane * 2.62, sumAmp = lane * 0.46;
      const wave = (fn, y, colour, width, alpha) => {
        ctx.beginPath();
        for (let x = 0; x <= W; x++) {
          const tt = (x / W) * SPAN;
          const yy = y - fn(tt);
          if (x === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = colour; ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.stroke();
        ctx.globalAlpha = 1;
      };
      wave((tt) => Math.sin(2 * Math.PI * F1 * VIS * tt) * amp, y1, WHITE, 1.2, 0.7);
      wave((tt) => Math.sin(2 * Math.PI * f2 * VIS * tt) * amp, y2, ACCENT, 1.2, 0.85);
      const envAt = (tt) => Math.abs(Math.cos(Math.PI * df * tt));
      ctx.beginPath();
      for (let x = 0; x <= W; x++) ctx.lineTo(x, y3 - envAt((x / W) * SPAN) * sumAmp);
      for (let x = W; x >= 0; x--) ctx.lineTo(x, y3 + envAt((x / W) * SPAN) * sumAmp);
      ctx.closePath();
      ctx.strokeStyle = ACCENT; ctx.globalAlpha = 0.45; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      wave((tt) => ((Math.sin(2 * Math.PI * F1 * VIS * tt) + Math.sin(2 * Math.PI * f2 * VIS * tt)) / 2) * sumAmp, y3, WHITE, 1.5, 1);
      ctx.font = '400 11px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(250,250,250,0.45)';
      ctx.fillText(lang === 'en' ? 'REFERENCE' : '基准音', 8, lane * 0.10);
      ctx.fillText(lang === 'en' ? 'STRING BEING TUNED' : '待调音', 8, lane * 1.03);
      ctx.fillStyle = ACCENT;
      ctx.fillText(lang === 'en' ? 'SUM — THE BEAT YOU HEAR' : '两者叠加 —— 你听见的「拍」', 8, lane * 2.02);
      if (numRef.current) numRef.current.textContent = df < 0.05 ? '0.0' : df.toFixed(1);
    };
    resize(); draw();
    let tween;
    if (!prefersReduced()) {
      tween = gsap.to(state, {
        detune: 0, ease: 'none',
        scrollTrigger: { trigger: figure, start: 'top 82%', end: 'bottom 40%', scrub: 0.4 },
        onUpdate: draw,
      });
    }
    const ro = new ResizeObserver(() => { resize(); draw(); });
    ro.observe(canvas);
    return () => { ro.disconnect(); if (tween) { tween.scrollTrigger?.kill(); tween.kill(); } };
  }, [lang]);
  return (
    <figure className="beat" ref={fig}>
      <canvas className="beat__canvas" ref={cv} aria-hidden="true" />
      <figcaption className="beat__cap">
        <span className="beat__readout t-metric"><span ref={numRef}>6.0</span> <span className="t-ui">Hz {t('拍频', 'BEAT')}</span></span>
        <span className="specs__note">
          {t('示意图 · 两个相近的音叠加会产生「拍」，越接近，拍越慢；调准时拍频归零。',
             'Illustrative · two close tones beat against each other; the closer they are, the slower the beat. In tune, the beating stops.')}
        </span>
      </figcaption>
    </figure>
  );
}
