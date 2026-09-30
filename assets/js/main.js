(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro veil + hero entrance ---------- */
  const reveal = () => document.body.classList.add('is-loaded');
  if (document.readyState === 'complete') requestAnimationFrame(reveal);
  else window.addEventListener('load', reveal, { once: true });
  // never hold the page hostage if an image is slow
  setTimeout(reveal, 2200);

  /* ---------- Header state ---------- */
  const header = document.querySelector('.header');
  const wa = document.querySelector('.wa');
  const buybar = document.querySelector('.buybar');
  const offer = document.getElementById('comprar');
  let offerInView = false;

  const onScrollState = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 20);
    wa.classList.toggle('is-visible', y > 500);
    buybar.classList.toggle('is-visible', y > 700 && !offerInView);
  };

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('nav');
  const setMenu = (open) => {
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  };
  toggle.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* ---------- Reveal: fade in on enter, fade out on leave ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
        } else if (entry.boundingClientRect.top > 0) {
          // only fade out when the element leaves through the bottom (scrolling back up),
          // so content above stays put and the page never feels empty
          el.classList.remove('is-visible');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Line-draw bear outline ---------- */
  document.querySelectorAll('[data-draw]').forEach((svg) => {
    const path = svg.querySelector('path');
    const len = Math.ceil(path.getTotalLength());
    svg.style.setProperty('--len', len);
    if (reduceMotion || !('IntersectionObserver' in window)) { svg.classList.add('is-visible'); return; }
    new IntersectionObserver(([entry]) => {
      svg.classList.toggle('is-visible', entry.isIntersecting);
    }, { threshold: 0.3 }).observe(svg);
  });

  /* ---------- Offer visibility (hide mobile buy bar there) ---------- */
  if (offer && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      offerInView = entry.isIntersecting;
      onScrollState();
    }).observe(offer);
  }

  /* ---------- Scroll-linked parallax & marquee ---------- */
  const parallaxEls = [...document.querySelectorAll('[data-parallax]')].map((el) => ({
    el, speed: parseFloat(el.dataset.parallax) || 0,
  }));
  const marquees = [...document.querySelectorAll('[data-marquee]')].map((el) => ({
    el, dir: parseFloat(el.dataset.marquee) || 1,
  }));
  const mouseEls = [...document.querySelectorAll('[data-mouse]')].map((el) => ({
    el, amt: parseFloat(el.dataset.mouse) || 0,
  }));

  let mx = 0, my = 0, cmx = 0, cmy = 0;
  let ticking = false;
  const vh = () => window.innerHeight;

  const frame = () => {
    ticking = false;
    const h = vh();

    parallaxEls.forEach(({ el, speed }) => {
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > h + 200) return;
      const center = r.top + r.height / 2 - h / 2;
      el.style.translate = `0 ${(-center * speed).toFixed(1)}px`;
    });

    marquees.forEach(({ el, dir }) => {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > h) return;
      const progress = (h - r.top) / (h + r.height);
      const shift = (progress - 0.5) * el.scrollWidth * 0.25 * dir;
      el.style.transform = `translate3d(${(shift - el.scrollWidth * 0.12).toFixed(1)}px,0,0)`;
    });
  };

  const requestFrame = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  };

  // Smooth mouse follow for hero floaters (desktop only)
  const mouseLoop = () => {
    cmx += (mx - cmx) * 0.06;
    cmy += (my - cmy) * 0.06;
    mouseEls.forEach(({ el, amt }) => {
      el.style.transform = `translate3d(${(cmx * amt).toFixed(2)}px, ${(cmy * amt).toFixed(2)}px, 0)`;
    });
    requestAnimationFrame(mouseLoop);
  };

  window.addEventListener('scroll', () => { onScrollState(); if (!reduceMotion) requestFrame(); }, { passive: true });
  window.addEventListener('resize', requestFrame, { passive: true });
  onScrollState();

  if (!reduceMotion) {
    requestFrame();
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      window.addEventListener('pointermove', (e) => {
        mx = e.clientX / window.innerWidth - 0.5;
        my = e.clientY / window.innerHeight - 0.5;
      }, { passive: true });
      mouseLoop();
    }
  }

  /* ---------- FAQ accordion ---------- */
  const faq = document.querySelector('[data-faq]');
  faq?.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq__q');
    if (!btn) return;
    const item = btn.parentElement;
    const open = !item.classList.contains('is-open');
    faq.querySelectorAll('.faq__item.is-open').forEach((other) => {
      if (other !== item) {
        other.classList.remove('is-open');
        other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
      }
    });
    item.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  /* ---------- Shop: kit selector ---------- */
  const shop = document.querySelector('[data-shop]');
  if (shop) {
    const brl = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const jarsBox = document.querySelector('[data-jars]');
    const gift = document.querySelector('[data-gift]');
    const total = shop.querySelector('[data-total]');
    const installments = shop.querySelector('[data-installments]');
    const cta = shop.querySelector('[data-checkout]');
    const INSTALLMENTS = 3;

    // [jar height (% of stage), horizontal step between jars (% of stage width)]
    const layout = { 1: [88, 0], 2: [82, 22], 3: [76, 20], 5: [68, 15], 7: [62, 11.5] };

    const renderJars = (qty) => {
      const [h, step] = layout[qty] || layout[7];
      jarsBox.innerHTML = '';
      const mid = (qty - 1) / 2;
      for (let i = 0; i < qty; i++) {
        const img = new Image();
        img.src = 'assets/img/jar-400.webp';
        img.alt = '';
        img.width = 400;
        img.height = 758;
        // fan out from the center: middle jar in front, outer ones smaller, higher and behind
        const offset = i - mid;
        const dist = Math.abs(offset);
        img.style.left = `${50 + offset * step}%`;
        img.style.bottom = `${dist * 2.5}%`;
        img.style.height = `${h * (1 - dist * 0.05)}%`;
        img.style.zIndex = String(10 - Math.round(dist * 2));
        img.style.setProperty('--i-delay', `${(dist * 0.07).toFixed(2)}s`);
        jarsBox.appendChild(img);
      }
    };

    const tick = (el) => { el.classList.remove('is-tick'); void el.offsetWidth; el.classList.add('is-tick'); };

    const update = (animate) => {
      const input = shop.querySelector('input[name=kit]:checked');
      const price = parseFloat(input.dataset.price);
      total.textContent = brl(price);
      installments.textContent = `ou ${INSTALLMENTS}x de ${brl(Math.round((price / INSTALLMENTS) * 100) / 100)}`;
      cta.href = input.dataset.url;
      renderJars(parseInt(input.value, 10));
      if (animate) {
        tick(total);
        gift.classList.remove('is-bump'); void gift.offsetWidth; gift.classList.add('is-bump');
      }
    };

    shop.addEventListener('change', () => update(true));

    // Meta Pixel: checkout intent with the selected kit
    cta.addEventListener('click', () => {
      if (typeof window.fbq !== 'function') return;
      const input = shop.querySelector('input[name=kit]:checked');
      window.fbq('track', 'InitiateCheckout', {
        value: parseFloat(input.dataset.price),
        currency: 'BRL',
        num_items: parseInt(input.value, 10),
        content_name: `GummyBe ${input.value} pote(s) + checklist diário`,
      });
    });
    update(false);
  }

  /* ---------- Benefits slider: 3 visible, infinite loop, autoplay ---------- */
  document.querySelectorAll('[data-slider]').forEach((slider) => {
    const track = slider.querySelector('[data-track]');
    const originals = [...track.children];
    const count = originals.length;
    const dotsBox = slider.querySelector('[data-dots]');

    // clone the set once so the strip can keep moving and wrap around seamlessly
    originals.forEach((slide) => {
      const clone = slide.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach((img) => { img.alt = ''; img.loading = 'eager'; });
      track.appendChild(clone);
    });

    let index = 0;
    let timer = null;
    let wrapTimer = null;

    const stepWidth = () => {
      const [a, b] = track.children;
      return b.offsetLeft - a.offsetLeft;
    };

    const dots = originals.map((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Ir para o benefício ${i + 1}`);
      dot.addEventListener('click', () => { goTo(i); restart(); });
      dotsBox.appendChild(dot);
      return dot;
    });
    const syncDots = () => dots.forEach((d, k) => d.setAttribute('aria-current', String(k === index % count)));

    const jump = (i) => { track.scrollTo({ left: i * stepWidth(), behavior: 'auto' }); };

    const goTo = (i) => {
      clearTimeout(wrapTimer);
      // going back from the first card: hop to its clone first, then slide
      if (i < 0) { jump(count); i = count - 1; }
      index = i;
      track.scrollTo({ left: index * stepWidth(), behavior: reduceMotion ? 'auto' : 'smooth' });
      syncDots();
      // after reaching the cloned set, silently return to the real one
      if (index >= count) {
        wrapTimer = setTimeout(() => { if (index >= count) { index -= count; jump(index); syncDots(); } }, 700);
      }
    };

    let scrollEnd;
    track.addEventListener('scroll', () => {
      clearTimeout(scrollEnd);
      scrollEnd = setTimeout(() => {
        const i = Math.round(track.scrollLeft / stepWidth());
        if (i >= count) { index = i - count; jump(index); } else index = i;
        syncDots();
      }, 120);
    }, { passive: true });

    slider.querySelector('[data-prev]').addEventListener('click', () => { goTo(index - 1); restart(); });
    slider.querySelector('[data-next]').addEventListener('click', () => { goTo(index + 1); restart(); });

    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { if (!reduceMotion && !timer) timer = setInterval(() => goTo(index + 1), 2800); };
    const restart = () => { stop(); start(); };

    slider.addEventListener('pointerenter', stop);
    slider.addEventListener('pointerleave', start);
    slider.addEventListener('focusin', stop);
    slider.addEventListener('touchstart', stop, { passive: true });
    slider.addEventListener('touchend', () => setTimeout(start, 1500), { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.4 }).observe(slider);
    }

    syncDots();
  });

  /* ---------- Before / after comparison ---------- */
  document.querySelectorAll('[data-ba]').forEach((ba) => {
    const range = ba.querySelector('.ba__range');
    const set = (v) => ba.style.setProperty('--pos', `${v}%`);
    range.addEventListener('input', () => set(range.value));

    // pointer drag (mouse + touch); the range input stays for keyboard users
    const fromPointer = (e) => {
      const r = ba.getBoundingClientRect();
      const v = Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100));
      range.value = v;
      set(v.toFixed(1));
    };
    let dragging = false;
    ba.addEventListener('pointerdown', (e) => {
      dragging = true;
      range.dataset.touched = '1';
      ba.setPointerCapture(e.pointerId);
      fromPointer(e);
    });
    ba.addEventListener('pointermove', (e) => { if (dragging) fromPointer(e); });
    const end = () => { dragging = false; };
    ba.addEventListener('pointerup', end);
    ba.addEventListener('pointercancel', end);

    // a gentle "peek" the first time it scrolls into view, hinting that it is draggable
    if (reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const frames = [50, 70, 30, 50];
      let k = 0;
      const tick = () => {
        if (k >= frames.length || range.dataset.touched) return;
        ba.style.transition = 'none';
        const from = parseFloat(getComputedStyle(ba).getPropertyValue('--pos')) || 50;
        const to = frames[k++];
        const t0 = performance.now();
        const step = (now) => {
          if (range.dataset.touched) return;
          const p = Math.min(1, (now - t0) / 700);
          const e = p < .5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          const v = from + (to - from) * e;
          set(v.toFixed(1)); range.value = v;
          if (p < 1) requestAnimationFrame(step); else setTimeout(tick, 120);
        };
        requestAnimationFrame(step);
      };
      setTimeout(tick, 500);
    }, { threshold: 0.6 });
    io.observe(ba);
  });

  /* ---------- Testimonials: "ler mais" only where the text is clamped ---------- */
  const testimonials = [...document.querySelectorAll('.testimonial')].map((card) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'testimonial__more';
    btn.textContent = 'ler mais';
    btn.setAttribute('aria-expanded', 'false');
    btn.hidden = true;
    btn.addEventListener('click', () => {
      const open = card.classList.toggle('is-open');
      btn.textContent = open ? 'ler menos' : 'ler mais';
      btn.setAttribute('aria-expanded', String(open));
    });
    card.appendChild(btn);
    return { card, btn, quote: card.querySelector('blockquote') };
  });
  const checkClamp = () => testimonials.forEach(({ card, btn, quote }) => {
    if (card.classList.contains('is-open')) return;
    btn.hidden = quote.scrollHeight <= quote.clientHeight + 2;
  });
  checkClamp();
  document.fonts?.ready.then(checkClamp);
  let clampTimer;
  window.addEventListener('resize', () => { clearTimeout(clampTimer); clampTimer = setTimeout(checkClamp, 150); }, { passive: true });

  /* ---------- Year ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  root.classList.add('ready');
})();
