(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  const topbar = document.querySelector('[data-topbar]');
  const menuBtn = document.querySelector('[data-menu-btn]');
  const nav = document.querySelector('[data-nav]');

  function setOpen(open){
    if (!topbar) return;
    if (open) topbar.setAttribute('data-open','');
    else topbar.removeAttribute('data-open');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', String(open));
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = topbar?.hasAttribute('data-open');
      setOpen(!open);
    });
  }

  if (nav) {
    nav.addEventListener('click', (ev) => {
      const a = ev.target.closest('a[data-nav-link]');
      if (!a) return;
      setOpen(false);
    });
  }

  // Scroll reveal
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (!prefersReduced && revealEls.length) {
    const revealObs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            revealObs.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => revealObs.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Active section highlighting
  const sections = Array.from(document.querySelectorAll('[data-section]'));
  const navLinks = Array.from(document.querySelectorAll('[data-nav-link]'));

  function activate(id){
    navLinks.forEach((a) => {
      const href = a.getAttribute('href');
      const targetId = href ? href.replace('#','') : '';
      a.classList.toggle('is-active', targetId === id);
    });
  }

  if (sections.length && !prefersReduced) {
    const secObs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0));

        if (!visible.length) return;
        const id = visible[0].target.id;
        if (id) activate(id);
      },
      {
        rootMargin: `-${Math.round(window.innerHeight * 0.25)}px 0px -${Math.round(window.innerHeight * 0.55)}px 0px`,
        threshold: [0.05, 0.15, 0.35]
      }
    );
    sections.forEach((s) => secObs.observe(s));
  } else {
    const onScroll = () => {
      const headerOffset = document.querySelector('[data-topbar]')?.offsetHeight || 70;
      let current = sections[0]?.id || 'home';
      for (const s of sections) {
        const top = s.getBoundingClientRect().top;
        if (top - headerOffset <= 0) current = s.id;
      }
      activate(current);
    };
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }

  // Contact form is handled by Formspree (@formspree/ajax) in index.html.
})();

