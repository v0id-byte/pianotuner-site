import { useEffect } from 'react';
import { gsap, ScrollTrigger, prefersReduced, refreshNow } from './index';

/**
 * 首屏视频滚动锁定（本站签名，CLAUDE.md 规定的默认模式）：
 *  1. 滚到 hero 时页面 pin 住；2. 滚轮位移驱动视频从第一帧走到最后一帧；3. 播完才放开。
 *
 * - 只在桌面且非 reduced-motion 分支里才注入 src。视频出厂不带 src：display:none 拦不住请求。
 * - 锁定距离由片长推出并夹上下限：clamp(dur*420, 600, innerHeight*2.4)。
 * - 不设 scrub：这个 trigger 没绑 tween，数值 scrub 对 self.progress 无作用；平滑交给 Lenis。
 * - pin 是在 loadedmetadata 之后「晚建」的：建完必须 sort() 再 refresh()，否则后面所有 trigger
 *   都短一个锁定距离（2026-08-30 线上事故）。pin 销毁是镜像问题，teardown 也要做。
 */
export function useHeroVideoLock(heroRef, videoRef) {
  useEffect(() => {
    const hero = heroRef.current;
    const video = videoRef.current;
    if (!hero || !video || prefersReduced()) return undefined;
    const mm = gsap.matchMedia();

    mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const mp4 = video.getAttribute('data-src-mp4');
      if (!mp4) return undefined;
      if (!video.dataset.ptLoaded) {
        video.src = mp4;
        video.preload = 'auto';
        video.dataset.ptLoaded = '1';
        video.load();
      }
      let st = null;
      const wire = () => {
        const dur = video.duration;
        if (!Number.isFinite(dur) || dur <= 0) return;
        video.classList.add('is-live');
        let lock = Math.round(dur * 420);
        lock = Math.max(600, Math.min(lock, Math.round(window.innerHeight * 2.4)));
        st = ScrollTrigger.create({
          trigger: hero,
          start: 'top top',
          end: '+=' + lock,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate(self) {
            const tgt = self.progress * dur;
            if (Math.abs(video.currentTime - tgt) > 0.01) {
              try { video.currentTime = tgt; } catch { /* seeking while not ready */ }
            }
          },
        });
        hero.dataset.motionReady = 'true';
        refreshNow();
      };
      if (video.readyState >= 1) wire();
      else video.addEventListener('loadedmetadata', wire, { once: true });

      return () => {
        video.removeEventListener('loadedmetadata', wire);
        if (st) st.kill();
        video.classList.remove('is-live');
        delete hero.dataset.motionReady;
        try { video.removeAttribute('src'); video.load(); } catch { /* ignore */ }
        delete video.dataset.ptLoaded;
        refreshNow();
      };
    });

    return () => mm.revert();
  }, [heroRef, videoRef]);
}
