// Portfolio interactions — theme, cursor halo, clock, margin tracker, reveal, work rows, tweaks

(function () {
  const root = document.documentElement;

  // ─── Theme ───────────────────────────────────────────────────
  const savedTheme = localStorage.getItem('kr:theme') || 'ivory';
  setTheme(savedTheme);

  function setTheme(name) {
    if (name === 'ivory') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', name);
    localStorage.setItem('kr:theme', name);
    const lbl = document.querySelector('.theme-toggle .lbl');
    if (lbl) lbl.textContent = ({ivory: 'Ivory', midnight: 'Midnight', paper: 'Paper'})[name];
    document.querySelectorAll('[data-theme-opt]').forEach(el => {
      el.classList.toggle('active', el.dataset.themeOpt === name);
    });
  }

  // ─── Global clicks ───────────────────────────────────────────
  document.addEventListener('click', (e) => {
    const tog = e.target.closest('.theme-toggle');
    if (tog) {
      const order = ['ivory', 'midnight', 'paper'];
      const cur = localStorage.getItem('kr:theme') || 'ivory';
      setTheme(order[(order.indexOf(cur) + 1) % order.length]);
    }
    const opt = e.target.closest('[data-theme-opt]');
    if (opt) setTheme(opt.dataset.themeOpt);

    const tweakBtn = e.target.closest('[data-tweaks-toggle]');
    if (tweakBtn) document.querySelector('.tweaks-panel').classList.toggle('open');
    const closeBtn = e.target.closest('[data-tweaks-close]');
    if (closeBtn) document.querySelector('.tweaks-panel').classList.remove('open');

    const workRow = e.target.closest('.work-row');
    if (workRow) {
      document.querySelectorAll('.work-row.open').forEach(r => {
        if (r !== workRow) r.classList.remove('open');
      });
      workRow.classList.toggle('open');
    }
  });

  // ─── Cursor halo ────────────────────────────────────────────
  const cursor = document.querySelector('.cursor');
  if (cursor && !matchMedia('(pointer: coarse)').matches) {
    let tx = 0, ty = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      cursor.classList.add('active');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    const tick = () => {
      cx += (tx - cx) * 0.22;
      cy += (ty - cy) * 0.22;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(tick);
    };
    tick();

    // hover state over interactive things
    const hoverables = 'a, button, .work-row, .service, .stat, .chip, .press-card, .contact-cta a, .theme-toggle, .tweak-opt';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) cursor.classList.add('hover');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) cursor.classList.remove('hover');
    });
  }

  // ─── Singapore clock ────────────────────────────────────────
  const clockEl = document.querySelector('.sg-clock .t');
  const pad = (n) => String(n).padStart(2, '0');
  const depTimes = document.querySelectorAll('.dep-time[data-offset]');
  const milesEl = document.getElementById('bp-miles');
  if (clockEl || depTimes.length || milesEl) {
    const tick = () => {
      const now = new Date();
      // Singapore = UTC+8
      const sg = new Date(now.getTime() + (now.getTimezoneOffset() + 480) * 60000);
      if (clockEl) clockEl.textContent = `${pad(sg.getHours())}:${pad(sg.getMinutes())}:${pad(sg.getSeconds())}`;
      // Departure times = SGT now + offset minutes (stable per load, animated updating)
      depTimes.forEach((el) => {
        const off = parseInt(el.getAttribute('data-offset'), 10) || 0;
        const t = new Date(sg.getTime() + off * 60000);
        el.textContent = `${pad(t.getHours())}:${pad(t.getMinutes())}`;
      });
      // Miles counter — subtly animate last digits
      if (milesEl) {
        const base = 284000;
        const drift = Math.floor((now.getTime() / 1000) % 40);
        milesEl.textContent = (base + drift).toLocaleString();
      }
    };
    tick();
    setInterval(tick, 1000);
  }

  // ─── Margin section tracker ─────────────────────────────────
  const sectionNames = {
    about: 'About',
    work: 'Selected Work',
    services: 'Services',
    press: 'Podcast · Press',
    skills: 'Toolkit',
    contact: 'Contact',
  };
  const marginSec = document.querySelector('.margin-num .sec');
  const io2 = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting && e.target.id && sectionNames[e.target.id]) {
        if (marginSec) marginSec.textContent = sectionNames[e.target.id];
      }
    });
  }, { threshold: 0.25 });
  Object.keys(sectionNames).forEach(id => {
    const el = document.getElementById(id);
    if (el) io2.observe(el);
  });

  // ─── Brand wall filters ─────────────────────────────────────
  const chips = document.querySelectorAll('.bw-chip');
  const cells = document.querySelectorAll('.brand-cell');
  if (chips.length && cells.length) {
    chips.forEach((c) => {
      c.addEventListener('click', () => {
        chips.forEach((x) => x.classList.remove('active'));
        c.classList.add('active');
        const f = c.getAttribute('data-filter');
        cells.forEach((cell) => {
          if (f === 'all' || cell.getAttribute('data-sec') === f) {
            cell.classList.remove('hidden');
          } else {
            cell.classList.add('hidden');
          }
        });
      });
    });
  }

  // ─── Scroll reveal ──────────────────────────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  // ─── Edit mode (Tweaks toolbar integration) ─────────────────
  window.addEventListener('message', (ev) => {
    const d = ev.data || {};
    if (d.type === '__activate_edit_mode') {
      document.querySelector('.tweaks-panel').classList.add('open');
    } else if (d.type === '__deactivate_edit_mode') {
      document.querySelector('.tweaks-panel').classList.remove('open');
    }
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (_) {}
})();
