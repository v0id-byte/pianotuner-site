/*!
 * Piano Tuner — motion layer (Stage 2A: infrastructure only)
 *
 * Third-party, self-hosted, see THIRD-PARTY.md:
 *   GSAP 3.15.0 + ScrollTrigger + SplitText
 *   © GreenSock — GreenSock Standard "No Charge" License
 *   https://gsap.com/standard-license
 *
 * DESIGN RULE
 *   Content is readable without this file. `.motion-ready` is added only after
 *   GSAP and its plugins are confirmed loaded and registered; every animated
 *   initial state in motion.css hangs off that class. If this file never runs,
 *   the page is static and complete — not blank.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  var PT = (window.PTMotion = {
    ready: false,
    reason: null,
    gsapVersion: null,
    plugins: {},
    registry: [],   // Stage 2B signature animations register here
    mm: null,
    refresh: function () {},
    register: function () {}
  });

  function bail(reason) {
    PT.reason = reason;
    root.classList.remove('motion-ready');
    root.classList.add('motion-failed');
    return false;
  }

  // 1. Respect the user's OS setting. Not an error — just no motion.
  if (reduceMQ.matches) return bail('prefers-reduced-motion');

  // 2. Hard requirement: the libraries actually arrived.
  if (!window.gsap)          return bail('gsap-missing');
  if (!window.ScrollTrigger) return bail('scrolltrigger-missing');

  var gsap = window.gsap;

  // 3. Registration must succeed before any CSS initial state is armed.
  try {
    gsap.registerPlugin(window.ScrollTrigger);
    PT.plugins.ScrollTrigger = true;
    if (window.SplitText) {
      gsap.registerPlugin(window.SplitText);
      PT.plugins.SplitText = true;
    }
  } catch (e) {
    return bail('plugin-registration-failed: ' + (e && e.message));
  }

  PT.gsapVersion = gsap.version;
  PT.mm = gsap.matchMedia();

  // 4. Arm the animated initial states.
  root.classList.remove('motion-failed');
  root.classList.add('motion-ready');
  PT.ready = true;

  var ScrollTrigger = window.ScrollTrigger;
  PT.refresh = function () { try { ScrollTrigger.refresh(); } catch (e) {} };

  /* ---------------------------------------------------------------------
   * Re-layout triggers.
   *
   * This site ships BOTH languages in the DOM and swaps them with a body
   * class, so a language switch changes every measured width and line break.
   * Font swap and viewport resize do the same. Anything measured (SplitText
   * lines, ScrollTrigger start/end) must be rebuilt on each.
   * ------------------------------------------------------------------- */

  // (a) webfont finished loading
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { rebuild('fonts-ready'); });
  }

  // (b) viewport resize — ScrollTrigger self-refreshes, but splits must redo
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { rebuild('resize'); }, 180);
  }, { passive: true });

  // (c) language switch — wrap the site's existing global
  function hookLanguageSwitch() {
    var prev = window.toggleLanguage;
    if (typeof prev !== 'function' || prev.__ptMotionHooked) return;
    var wrapped = function () {
      var r = prev.apply(this, arguments);
      // Let the class swap paint before re-measuring. rAF is the right signal when
      // the tab is visible, but browsers PAUSE rAF in hidden/background tabs — so a
      // timeout races it and whichever lands first wins.
      var done = false;
      var go = function () {
        if (done) return;
        done = true;
        rebuild('language-switch');
      };
      requestAnimationFrame(function () { requestAnimationFrame(go); });
      setTimeout(go, 120);
      return r;
    };
    wrapped.__ptMotionHooked = true;
    window.toggleLanguage = wrapped;
  }
  // the page wraps toggleLanguage on DOMContentLoaded; hook after that
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(hookLanguageSwitch, 0); });
  } else {
    setTimeout(hookLanguageSwitch, 0);
  }

  // (d) if the OS setting flips mid-session, tear everything down
  var onReduceChange = function (e) {
    if (!e.matches) return;
    PT.registry.forEach(function (item) {
      try { item.revert && item.revert(); } catch (err) {}
    });
    try { ScrollTrigger.getAll().forEach(function (st) { st.kill(); }); } catch (err) {}
    try { PT.mm && PT.mm.revert(); } catch (err) {}
    root.classList.remove('motion-ready');
    PT.ready = false;
    PT.reason = 'reduced-motion-enabled-late';
  };
  if (reduceMQ.addEventListener) reduceMQ.addEventListener('change', onReduceChange);
  else if (reduceMQ.addListener) reduceMQ.addListener(onReduceChange);

  var rebuildCount = 0;
  function rebuild(why) {
    if (!PT.ready) return;
    rebuildCount++;
    PT.lastRebuild = { why: why, count: rebuildCount };
    PT.registry.forEach(function (item) {
      try { item.rebuild && item.rebuild(why); } catch (e) {}
    });
    PT.refresh();
  }
  PT.rebuild = rebuild;

  /* ---------------------------------------------------------------------
   * Registration API for Stage 2B.
   *
   *   PTMotion.register({ name, build, rebuild, revert })
   *
   * `build` runs once now; `rebuild` runs on font/resize/language changes;
   * `revert` runs if reduced-motion is turned on mid-session. Anything that
   * throws is isolated so one broken effect cannot take down the rest.
   * ------------------------------------------------------------------- */
  PT.register = function (item) {
    if (!item || typeof item.build !== 'function') return;
    try {
      item.build(gsap, ScrollTrigger, PT.mm);
      PT.registry.push(item);
    } catch (e) {
      if (window.console && console.warn) {
        console.warn('[PTMotion] effect "' + (item.name || '?') + '" failed to build:', e);
      }
    }
  };

  // Stage 2B effects.

  /* -------------------------------------------------------------------
   * Railsback curve — drawn as you scroll.
   *
   * The path is generated from assets/data/railsback-demo.json (the standard
   * inharmonicity model, parameters included in that file) — not eyeballed,
   * and not measured product data. The caption says so. Swap that JSON for a
   * frozen measured dataset and the drawing here needs no changes.
   *
   * pathLength="1" is set on the path, so dasharray/offset work in normalised
   * units and we never have to measure getTotalLength().
   * ----------------------------------------------------------------- */
  PT.register({
    name: 'railsback-draw',
    build: function (gsap, ScrollTrigger, mm) {
      var fig = document.querySelector('.rb-figure');
      if (!fig) return;
      var curve = fig.querySelector('.rb-curve');
      var area = fig.querySelector('.rb-area');
      if (!curve) return;

      gsap.set(curve, { strokeDashoffset: 1 });
      gsap.timeline({
        scrollTrigger: { trigger: fig, start: 'top 84%', end: 'bottom 55%', scrub: 0.5 }
      })
      .to(curve, { strokeDashoffset: 0, ease: 'none', duration: 1 }, 0)
      .to(area, { opacity: 1, ease: 'none', duration: 1 }, 0.15);
    }
  });

  /* -------------------------------------------------------------------
   * "3 simple steps" — pinned progression.
   *
   * Desktop/tablet only, deliberately. On phones a pinned section fights
   * the collapsing address bar: the viewport height changes mid-scroll, so
   * the pin spacer is computed against a height that no longer exists,
   * producing jumps, a giant gap, and a scroll position that restores
   * wrongly on back-navigation. Mobile gets a plain staggered reveal.
   * ----------------------------------------------------------------- */
  PT.register({
    name: 'steps-pin',
    build: function (gsap, ScrollTrigger, mm) {
      var sec = document.querySelector('#how-it-works');
      var boxes = sec && sec.querySelectorAll('.step-box');
      var line = sec && sec.querySelector('.step-line');
      if (!sec || !boxes || boxes.length !== 3) return;

      mm.add({
        pinned: '(min-width: 768px)',
        plain: '(max-width: 767px)'
      }, function (ctx) {
        var c = ctx.conditions;

        if (c.plain) {
          // No pin on phones. Nothing else to do either: the page's own
          // IntersectionObserver already tags .step-container children as
          // .stg-item and staggers them in. Adding a second system here would
          // fight it and could strand the steps at opacity 0.
          return;
        }

        // pinned progression
        gsap.set(boxes, { opacity: 0.28 });
        if (line) gsap.set(line, { scaleX: 0, transformOrigin: 'left center' });

        var tl = gsap.timeline({
          scrollTrigger: {
            trigger: sec,
            start: 'top top+=64',
            end: '+=' + Math.round(window.innerHeight * 1.15),
            pin: true,
            pinSpacing: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true
          }
        });
        if (line) tl.to(line, { scaleX: 1, ease: 'none', duration: 3 }, 0);
        for (var i = 0; i < boxes.length; i++) {
          tl.to(boxes[i], { opacity: 1, duration: 0.8, ease: 'power2.out' }, i * 0.95);
        }
      });
    }
  });

  /* -------------------------------------------------------------------
   * Section headings — rise out of a mask, line by line.
   *
   * The site keeps BOTH languages in the DOM and hides one with
   * `display:none`. A hidden element has no layout, so SplitText cannot
   * measure its lines: we must split only the currently visible language
   * span, and re-split whenever the language changes.
   * ----------------------------------------------------------------- */
  PT.register({
    name: 'heading-lines',
    build: function (gsap, ScrollTrigger, mm) {
      if (!PT.plugins.SplitText) return;
      var SplitText = window.SplitText;
      var splits = [];

      function visibleSpan(h) {
        var zh = document.body.classList.contains('lang-zh');
        var el = h.querySelector(zh ? ':scope > .zh' : ':scope > .en');
        // headings without per-language spans animate as a whole
        return el || h;
      }

      function teardown() {
        splits.forEach(function (s) {
          try { s.st && s.st.kill(); } catch (e) {}
          try { s.split && s.split.revert(); } catch (e) {}
        });
        splits = [];
      }

      function setup() {
        teardown();
        var heads = document.querySelectorAll('.section-title');
        Array.prototype.forEach.call(heads, function (h) {
          var target = visibleSpan(h);
          if (!target || !target.offsetParent) return;   // skip anything not laid out
          var split;
          try {
            split = new SplitText(target, { type: 'lines', mask: 'lines', linesClass: 'pt-hline' });
          } catch (e) { return; }
          if (!split.lines || !split.lines.length) { try { split.revert(); } catch (e) {} return; }

          gsap.set(split.lines, { yPercent: 110 });
          var tl = gsap.to(split.lines, {
            yPercent: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, paused: true
          });
          var st = ScrollTrigger.create({
            trigger: h, start: 'top 86%',
            onEnter: function () { tl.play(); },
            once: true,
            // if the heading is already above the fold on load, show it immediately
            onRefresh: function (self) { if (self.progress > 0) tl.progress(1); }
          });
          splits.push({ split: split, st: st, tl: tl });
        });
      }

      setup();
      this.rebuild = function () { setup(); };
      this.revert = function () { teardown(); };
    }
  });

  /* -------------------------------------------------------------------
   * Beat frequency — what a tuner actually hears.
   *
   * Physics note: two sinusoids "converging" is mathematically true but
   * explains nothing. Beating is the SUM:
   *
   *     sin(2*pi*f1*t) + sin(2*pi*f2*t)
   *       = 2 * cos(2*pi*(df/2)*t) * sin(2*pi*f_avg*t)
   *
   * i.e. a carrier at the mean frequency inside an amplitude envelope that
   * pulses at |f1 - f2|. So we draw the two sources faintly, the sum
   * prominently, and the envelope as the thing the ear latches onto.
   *
   * This is a physics illustration, not measured product data. The caption
   * says so in both languages.
   * ----------------------------------------------------------------- */
  PT.register({
    name: 'beat-canvas',
    build: function (gsap, ScrollTrigger, mm) {
      var fig = document.querySelector('.beat-figure');
      var cv = fig && fig.querySelector('.beat-canvas');
      if (!cv) return;
      var ctx = cv.getContext('2d');
      var numEl = fig.querySelector('.beat-num');

      var F1 = 220;                 // reference tone (Hz)
      var state = { detune: 6.0 };  // |f2 - f1| in Hz, driven by scroll
      var W = 0, H = 0, dpr = 1;

      function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        var r = cv.getBoundingClientRect();
        if (!r.width) return false;
        W = Math.round(r.width); H = Math.round(r.height);
        cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
      }

      var COPPER = '#e6a15c';
      var TEAL = '#2dd4bf';

      function draw() {
        if (!W && !resize()) return;
        var df = state.detune;
        var f2 = F1 + df;
        var SPAN = 3.2;              // seconds of signal across the width
        var VIS = 1 / 60;            // carrier scale: legible on screen, ~12 cycles

        ctx.clearRect(0, 0, W, H);

        var padL = 0, lane = H / 3.25, amp = lane * 0.30;
        var y1 = lane * 0.52, y2 = lane * 1.45, y3 = lane * 2.62;
        var sumAmp = lane * 0.46;

        function wave(fn, y, colour, width, alpha) {
          ctx.beginPath();
          for (var x = 0; x <= W; x++) {
            var tt = (x / W) * SPAN;
            var yy = y - fn(tt);
            x === 0 ? ctx.moveTo(padL + x, yy) : ctx.lineTo(padL + x, yy);
          }
          ctx.strokeStyle = colour; ctx.globalAlpha = alpha;
          ctx.lineWidth = width; ctx.lineJoin = 'round'; ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // lane 1 + 2: the two source tones, drawn separately so you can watch
        // them drift in and out of phase with each other
        wave(function (tt) { return Math.sin(2 * Math.PI * F1 * VIS * tt) * amp; }, y1, COPPER, 1.5, 0.85);
        wave(function (tt) { return Math.sin(2 * Math.PI * f2 * VIS * tt) * amp; }, y2, TEAL, 1.5, 0.85);

        // lane 3: the sum — carrier inside an envelope pulsing at |f1-f2|
        function envAt(tt) { return Math.abs(Math.cos(Math.PI * df * tt)); }
        ctx.beginPath();
        for (var x = 0; x <= W; x++) {
          var tt = (x / W) * SPAN;
          ctx.lineTo(padL + x, y3 - envAt(tt) * sumAmp);
        }
        for (var xb = W; xb >= 0; xb--) {
          var tb = (xb / W) * SPAN;
          ctx.lineTo(padL + xb, y3 + envAt(tb) * sumAmp);
        }
        ctx.closePath();
        ctx.fillStyle = 'rgba(230,161,92,0.11)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(230,161,92,0.40)';
        ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);

        wave(function (tt) {
          var s = Math.sin(2 * Math.PI * F1 * VIS * tt) + Math.sin(2 * Math.PI * f2 * VIS * tt);
          return (s / 2) * sumAmp;
        }, y3, COPPER, 1.8, 1);

        // lane labels
        var zh = document.body.classList.contains('lang-zh');
        ctx.font = '500 11px Inter, system-ui, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(255,255,255,0.40)';
        ctx.fillText(zh ? '基准音' : 'reference', 8, lane * 0.10);
        ctx.fillText(zh ? '待调音' : 'string being tuned', 8, lane * 1.03);
        ctx.fillStyle = 'rgba(230,161,92,0.72)';
        ctx.fillText(zh ? '两者叠加 —— 你听见的「拍」' : 'the two summed — the beat you hear', 8, lane * 2.02);

        if (numEl) numEl.textContent = df < 0.05 ? '0.0' : df.toFixed(1);
      }

      function rebuild() { resize(); draw(); }
      resize(); draw();

      // scroll drives the detuning down to zero — the moment it comes into tune
      gsap.to(state, {
        detune: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: fig,
          start: 'top 82%',
          end: 'bottom 40%',
          scrub: 0.4
        },
        onUpdate: draw
      });

      // hand our rebuild back to the registry entry (PT.register calls build with
      // `this` bound to the item, so font/resize/language changes reach us)
      this.rebuild = rebuild;
    }
  });

  /* -------------------------------------------------------------------
   * Hero — pinned scroll-lock playback (Apple product-page pattern).
   *
   * The hero PINS: the page stops advancing while the wheel/trackpad drives
   * the clip from first frame to last. Only once the clip is finished does
   * the page resume normal scrolling. This is the house pattern for any
   * short single-scene or rendered clip — see CLAUDE.md, "Video scroll-lock".
   *
   * Pin distance is derived from the clip length so a longer clip locks for
   * proportionally more scroll, with a floor and a ceiling so it can never
   * feel like the page has frozen.
   *
   * The <video> ships with NO src and preload="none". A source is injected
   * only inside the desktop matchMedia branch, so phones and reduced-motion
   * users never issue the request at all — `display:none` would not have
   * prevented it. The poster <img> underneath is the hero on its own.
   * ----------------------------------------------------------------- */
  PT.register({
    name: 'hero-video',
    build: function (gsap, ScrollTrigger, mm) {
      var wrap = document.querySelector('.hero-media');
      var video = wrap && wrap.querySelector('.hero-video');
      var hero = document.querySelector('.hero');
      if (!video || !hero) return;

      mm.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', function () {
        if (!video.dataset.ptLoaded) {
          // One format on purpose: for this rendered content VP9 encoded LARGER than
          // H.264 at matched quality, and H.264 seeks reliably everywhere, which is what
          // scroll-lock scrubbing actually needs.
          var mp4 = video.getAttribute('data-src-mp4');
          if (!mp4) return;
          video.src = mp4;
          video.preload = 'auto';
          video.dataset.ptLoaded = '1';
          video.load();
        }

        var st;
        function wire() {
          video.classList.add('is-live');
          var dur = video.duration;
          if (!isFinite(dur) || dur <= 0) return;

          // ~420 px of scroll per second of footage, clamped to something a
          // person will actually push through.
          var lock = Math.round(dur * 420);
          lock = Math.max(600, Math.min(lock, Math.round(window.innerHeight * 2.4)));

          st = ScrollTrigger.create({
            trigger: hero,
            start: 'top top',
            end: '+=' + lock,
            pin: true,
            pinSpacing: true,
            scrub: 0.3,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: function (self) {
              var tgt = self.progress * dur;
              if (Math.abs(video.currentTime - tgt) > 0.01) {
                try { video.currentTime = tgt; } catch (e) {}
              }
            }
          });
        }

        if (video.readyState >= 1) wire();
        else video.addEventListener('loadedmetadata', wire, { once: true });

        return function () {
          if (st) st.kill();
          video.classList.remove('is-live');
          try { video.removeAttribute('src'); video.load(); } catch (e) {}
          delete video.dataset.ptLoaded;
        };
      });
    }
  });

  

  

  

  

})();
