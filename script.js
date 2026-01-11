// Header scroll effect (safe)
const header = document.querySelector('header.header') || document.getElementById('top');
if (header){
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20){
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  });
}

// Mobile menu toggle (desktop keeps the dropdown; mobile uses centered 3-link menu)
const toggle = document.querySelector('.nav__toggle');
const menu = document.getElementById('navMenu');
const mobileMenu = document.getElementById('mobileMenu');

const isMobile = () => window.matchMedia('(max-width: 600px)').matches;

function openMobileMenu(){
  if (!mobileMenu) return;
  mobileMenu.classList.add('is-open');
  document.body.classList.add('mobile-menu-open');
  toggle?.setAttribute('aria-expanded', 'true');
  mobileMenu.setAttribute('aria-hidden', 'false');
}

function closeMobileMenu(){
  if (!mobileMenu) return;
  mobileMenu.classList.remove('is-open');
  document.body.classList.remove('mobile-menu-open');
  toggle?.setAttribute('aria-expanded', 'false');
  mobileMenu.setAttribute('aria-hidden', 'true');
}

if (toggle){
  toggle.addEventListener('click', () => {
    // Mobile: centered menu
    if (mobileMenu && isMobile()){
      if (mobileMenu.classList.contains('is-open')) closeMobileMenu();
      else openMobileMenu();
      return;
    }
    // Desktop: original dropdown list
    if (!menu) return;
    const open = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
}

// Close actions for mobile menu
if (mobileMenu){
  mobileMenu.addEventListener('click', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    if (target.matches('[data-mobile-menu-close]')) closeMobileMenu();
    if (target.matches('[data-mobile-menu-link]')) closeMobileMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // Ensure menu state stays consistent when resizing
  window.addEventListener('resize', () => {
    if (!isMobile()) closeMobileMenu();
  });
}

// Active link on scroll
const links = document.querySelectorAll('.nav__menu a[data-section]');
const sections = [...links].map(l => document.getElementById(l.dataset.section)).filter(Boolean);

window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom >= 120){
      current = section.id;
    }
  });
  links.forEach(link => {
    link.classList.toggle('active', link.dataset.section === current);
  });
});


// ===== NAV ACTIVE SECTION (PRO) =====
const navLinks = document.querySelectorAll('.nav__menu a[data-section]');
const sectionsMap = {};
navLinks.forEach(l => {
  const id = l.dataset.section;
  const sec = document.getElementById(id);
  if (sec) sectionsMap[id] = sec;
});

const setActive = () => {
  let current = null;
  Object.entries(sectionsMap).forEach(([id, sec]) => {
    const r = sec.getBoundingClientRect();
    if (r.top <= 140 && r.bottom >= 140) current = id;
  });
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === current));
};
window.addEventListener('scroll', setActive, { passive:true });
setActive();


// ================================
// NAV PERSISTENT DROPDOWN LOGIC
// ================================
const navItems = document.querySelectorAll('.nav__dropdown');

navItems.forEach(item => {
  const trigger = item.querySelector('a');

  // Open on hover
  item.addEventListener('mouseenter', () => {
    closeAll();
    item.classList.add('open');
  });

  // Close only when mouse leaves item
  item.addEventListener('mouseleave', () => {
    item.classList.remove('open');
  });

  // Open on click (desktop & mobile)
  trigger.addEventListener('click', (e) => {
    // If it has submenu, prevent jump
    if (item.querySelector('.nav__submenu, .mega-menu')){
      e.preventDefault();
      const isOpen = item.classList.contains('open');
      closeAll();
      if (!isOpen) item.classList.add('open');
    }
  });
});

// Close when another nav link is hovered
function closeAll(){
  navItems.forEach(i => i.classList.remove('open'));
}


// ===== MEGA MENU PREVIEW (PORTAFOLIO) =====
(function(){
  const previewImg = document.getElementById('megaPreviewImg');
  const previewCaption = document.getElementById('megaPreviewCaption');
  const links = document.querySelectorAll('.mega-menu .mega-item[data-preview-src]');
  if (!previewImg || !previewCaption || !links.length) return;

  const setPreview = (el) => {
    const src = el.getAttribute('data-preview-src');
    const label = (el.querySelector('.mega-item__text')?.textContent || el.textContent || '').trim();
    if (src) previewImg.src = src;
    previewCaption.textContent = label || 'Portafolio';
  };

  // default
  setPreview(links[0]);

  links.forEach(el => {
    el.addEventListener('mouseenter', () => setPreview(el));
    el.addEventListener('focus', () => setPreview(el));
    // Touch: first tap updates preview, second tap navigates
    el.addEventListener('click', (e) => {
      // If viewport is wide enough to show preview, we keep navigation
      // but also update preview immediately.
      setPreview(el);
    });
  });
})();



// ===== QUICK SEARCH (CATALOGO) =====
(function(){
  const form = document.getElementById('quickSearchForm');
  const input = document.getElementById('quickSearchInput');
  const grid = document.getElementById('catalogoGrid');
  if (!form || !input || !grid) return;

  const items = Array.from(grid.querySelectorAll('.item'));

  const applyQuery = (query) => {
    const q = (query || '').trim().toLowerCase();
    if (!q){
      items.forEach(it => it.classList.remove('qs-hidden'));
      return;
    }
    items.forEach(it => {
      const title = (it.querySelector('h3')?.textContent || '').toLowerCase();
      const descEl = it.querySelector('.item__desc');
      const descShort = (descEl?.getAttribute('data-short') || descEl?.textContent || '').toLowerCase();
      const descFull = (descEl?.getAttribute('data-full') || '').toLowerCase();
      const hay = (title + ' ' + descShort + ' ' + descFull);
      it.classList.toggle('qs-hidden', !hay.includes(q));
    });
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value || '';
    applyQuery(q);

    const target = document.getElementById('catalogo');
    if (target){
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (location.hash !== '#catalogo'){
      location.hash = '#catalogo';
    }
  });

  // Optional: clear search when input is cleared
  input.addEventListener('input', () => {
    if (input.value.trim() === '') applyQuery('');
  });
})();


// ===== INLINE HERO WIZARD (Step 1 -> Step 2 list -> Step 3 ticket) =====
(function(){
  const form = document.querySelector('.hero__search-panel');
  const wizard = document.getElementById('heroWizard');

  const locInput = document.querySelector('.hero__search-panel input[name="ubicacion"]');
  const startInput = document.querySelector('.hero__search-panel input[name="inicio"]');
  const endInput = document.querySelector('.hero__search-panel input[name="fin"]');
  const deliveryInputs = Array.from(document.querySelectorAll('.hero__search-panel input[name="entrega"]'));

  const grid = document.getElementById('catalogoGrid');
  if (!form || !wizard || !grid) return;

  const waNumber = '573005651621';

  const state = {
    location: '',
    start: '',
    end: '',
    delivery: 'obra',
    equipmentName: '',
    equipmentCat: ''
  };

  const getDelivery = () => {
    const checked = deliveryInputs.find(r => r.checked);
    return checked ? checked.value : 'obra';
  };

  const syncState = () => {
    state.location = (locInput?.value || '').trim();
    state.start = (startInput?.value || '').trim();
    state.end = (endInput?.value || '').trim();
    state.delivery = getDelivery();
  };

  const formatDate = (val) => val ? val : '—';
  const deliveryTxt = () => state.delivery === 'obra' ? 'Entrega en obra' : 'Recoger en bodega';

  const makeId = () => {
    const base = Date.now().toString(36).toUpperCase();
    return 'CMQ-' + base.slice(-7);
  };

  // Build category label map from chips (if present)
  const chipButtons = Array.from(document.querySelectorAll('.filters .chip[data-filter]'));
  const catLabel = {};
  chipButtons.forEach(btn => {
    const key = (btn.getAttribute('data-filter') || '').trim();
    if (!key || key === 'all') return;
    catLabel[key] = (btn.textContent || key).trim();
  });

  const items = Array.from(grid.querySelectorAll('.item'));

  const getItemDesc = (item) => {
    const descEl = item.querySelector('.item__desc');
    return (descEl?.getAttribute('data-short') || descEl?.textContent || '').trim();
  };

  const renderSummary = () => `
    <div class="hero-wizard__summary">
      <div class="hero-wizard__pill"><span class="hero-wizard__pillLabel">Ubicación</span><span class="hero-wizard__pillValue">${state.location || '—'}</span></div>
      <div class="hero-wizard__pill"><span class="hero-wizard__pillLabel">Inicio</span><span class="hero-wizard__pillValue">${formatDate(state.start)}</span></div>
      <div class="hero-wizard__pill"><span class="hero-wizard__pillLabel">Entrega</span><span class="hero-wizard__pillValue">${formatDate(state.end)}</span></div>
      <div class="hero-wizard__pill"><span class="hero-wizard__pillLabel">Tipo</span><span class="hero-wizard__pillValue">${deliveryTxt()}</span></div>
    </div>
  `;

  const setStep = (step) => {
    form.classList.remove('is-step2','is-step3');
    if (step === 2) form.classList.add('is-step2');
    if (step === 3) form.classList.add('is-step3');
  };

  const renderStep2 = (query='') => {
    const q = (query || '').trim().toLowerCase();

    // group items by category
    const groups = new Map();
    items.forEach(item => {
      const cat = (item.getAttribute('data-cat') || 'otros').trim();
      const name = (item.querySelector('h3')?.textContent || '').trim();
      const descShort = getItemDesc(item).toLowerCase();
      const descFull = (item.querySelector('.item__desc')?.getAttribute('data-full') || '').toLowerCase();
      const hay = (name + ' ' + descShort + ' ' + descFull).toLowerCase();
      if (q && !hay.includes(q)) return;

      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(item);
    });

    const orderedCats = Array.from(groups.keys()).sort((a,b) => (catLabel[a]||a).localeCompare(catLabel[b]||b));

    const listHtml = orderedCats.length ? orderedCats.map(cat => {
      const arr = groups.get(cat) || [];
      const title = catLabel[cat] || cat;
      return `
        <div class="hw-cat">
          <div class="hw-cat__head">
            <p class="hw-cat__name">${title}</p>
            <span class="hw-cat__count">${arr.length}</span>
          </div>
          ${arr.map(item => {
            const name = (item.querySelector('h3')?.textContent || 'Equipo').trim();
            const desc = getItemDesc(item);
            const enc = encodeURIComponent(name);
            return `
              <div class="hw-item">
                <div class="hw-item__main">
                  <p class="hw-item__title">${name.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
                  <p class="hw-item__desc">${desc.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
                </div>
                <button class="hw-item__btn" type="button" data-pick="${enc}">Elegir</button>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }).join('') : `
      <div class="hw-cat">
        <div class="hw-cat__head">
          <p class="hw-cat__name">Sin resultados</p>
          <span class="hw-cat__count">0</span>
        </div>
        <div class="hw-item">
          <div class="hw-item__main">
            <p class="hw-item__title">No encontramos coincidencias.</p>
            <p class="hw-item__desc">Prueba con otra palabra (ej: “mezcladora”, “motobomba”, “vibrador”).</p>
          </div>
        </div>
      </div>
    `;

    wizard.innerHTML = `
      <div class="hero-wizard__card">
        <div class="hero-wizard__top">
          <div>
            <p class="hero-wizard__title">Paso 2 · Selecciona un equipo</p>
            <p class="hero-wizard__subtitle">Elige el equipo para generar el ticket</p>
          </div>
          <div class="hero-wizard__actions">
            <button class="btn btn--ghost" type="button" id="hwBack1">Volver</button>
          </div>
        </div>

        ${renderSummary()}

        <div class="hero-wizard__search" role="search" aria-label="Buscar equipo">
          <span class="hero-wizard__searchIcon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" stroke-width="2"/>
              <path d="M16.5 16.5L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <input id="hwSearch" type="search" placeholder="Buscar equipo y soluciones" autocomplete="off" value="${(query||'').replace(/"/g,'&quot;')}" />
        </div>

        <div class="hero-wizard__list" id="hwList">
          ${listHtml}
        </div>

        <p class="hero-wizard__note">Tip: puedes buscar por nombre del equipo o por lo que necesitas hacer en obra.</p>
      </div>
    `;

    // handlers
    wizard.querySelector('#hwBack1')?.addEventListener('click', () => {
      wizard.innerHTML = '';
      setStep(1);
      // bring back original inputs
    });

    const searchInput = wizard.querySelector('#hwSearch');
    searchInput?.addEventListener('input', () => renderStep2(searchInput.value));

    wizard.querySelectorAll('[data-pick]').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = decodeURIComponent(btn.getAttribute('data-pick') || '');
        const item = items.find(it => (it.querySelector('h3')?.textContent || '').trim() === name);
        if (item) renderStep3(item);
      });
    });
  };

  const renderStep3 = (item) => {
    state.equipmentName = (item.querySelector('h3')?.textContent || 'Equipo').trim();
    state.equipmentCat = (item.getAttribute('data-cat') || '').trim();
    const ticketId = makeId();

    const rows = [
      { label: 'Equipo', value: state.equipmentName },
      { label: 'Categoría', value: catLabel[state.equipmentCat] || (state.equipmentCat || '—') },
      { label: 'Ubicación', value: state.location || '—' },
      { label: 'Tipo', value: deliveryTxt() },
      { label: 'Inicio', value: formatDate(state.start) },
      { label: 'Entrega', value: formatDate(state.end) },
      { label: 'Ticket', value: ticketId }
    ];

    const msgLines = [
      'Hola, quiero conocer disponibilidad para este equipo:',
      `• Equipo: ${state.equipmentName}`,
      state.location ? `• Ubicación: ${state.location}` : '',
      state.start ? `• Fecha inicio: ${state.start}` : '',
      state.end ? `• Fecha entrega: ${state.end}` : '',
      `• Entrega: ${deliveryTxt()}`,
      `• Ticket: ${ticketId}`
    ].filter(Boolean);

    const href = `https://wa.me/${waNumber}?text=${encodeURIComponent(msgLines.join('\n'))}`;

    wizard.innerHTML = `
      <div class="hero-wizard__card">
        <div class="hero-wizard__top">
          <div>
            <p class="hero-wizard__title">Paso 3 · Ticket generado</p>
            <p class="hero-wizard__subtitle">Confirma disponibilidad por WhatsApp</p>
          </div>
          <div class="hero-wizard__actions">
            <button class="btn btn--ghost" type="button" id="hwBack2">Cambiar equipo</button>
          </div>
        </div>

        ${renderSummary()}

        <div class="hero-wizard__grid">
          ${rows.map(r => `
            <div class="hero-wizard__row">
              <div class="hero-wizard__label">${r.label}</div>
              <div class="hero-wizard__value">${String(r.value).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
            </div>
          `).join('')}
        </div>

        <a class="btn btn--primary hero-wizard__cta" href="${href}" target="_blank" rel="noopener">
          CONOCER DISPONIBILIDAD VIA WHATSAPP
        </a>

        <p class="hero-wizard__note">
          Enviaremos tu solicitud con los datos del equipo, fechas y ubicación para confirmar disponibilidad.
        </p>
      </div>
    `;

    wizard.querySelector('#hwBack2')?.addEventListener('click', () => {
      renderStep2('');
      setStep(2);
    });

    // Focus CTA for pro feel
    const cta = wizard.querySelector('.hero-wizard__cta');
    if (cta) setTimeout(() => cta.focus(), 80);
    setStep(3);
  };

  // Step 1 submit => step 2 list
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    syncState();

    // soft validation: location helps
    if (!state.location){
      locInput?.focus();
      return;
    }

    setStep(2);
    renderStep2('');
    // focus search
    setTimeout(() => wizard.querySelector('#hwSearch')?.focus(), 80);
  });

})();



// ===== CATALOGO READ MORE (with image) =====
(function(){
  const grid = document.getElementById('catalogoGrid');
  if (!grid) return;

  const items = Array.from(grid.querySelectorAll('.item'));

  // ===== Catálogo: filtros por categoría (chips) =====
  const chips = Array.from(document.querySelectorAll('#catalogo .filters .chip[data-filter]'));

  const setActiveChip = (activeBtn) => {
    if (!chips.length) return;
    chips.forEach(btn => {
      const isActive = btn === activeBtn;
      btn.classList.toggle('chip--active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      // Improve keyboard navigation for role="tab"
      btn.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  };

  const collapseItemIfNeeded = (item) => {
    if (!item.classList.contains('is-expanded')) return;
    item.classList.remove('is-expanded');
    const btn = item.querySelector('.item__toggle');
    if (btn) {
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Leer más';
    }
    const details = item.querySelector('.item__details');
    if (details) details.style.maxHeight = '0px';

    const descEl = item.querySelector('.item__desc');
    if (descEl) {
      const shortText = (descEl.getAttribute('data-short') || '').trim();
      if (shortText) descEl.textContent = shortText;
    }
  };

  const applyCatalogFilter = (filterKey) => {
    const key = (filterKey || 'all').trim();
    let visibleCount = 0;

    items.forEach(item => {
      const cat = (item.getAttribute('data-cat') || '').trim();
      const shouldShow = (key === 'all' || key === '' || cat === key);

      if (!shouldShow) collapseItemIfNeeded(item);

      // Use native [hidden] so no CSS changes are required
      item.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });

    // Optional: announce in console for debugging (kept silent for users)
    return visibleCount;
  };

  const initCatalogFilters = () => {
    if (!chips.length) return;

    // Click
    chips.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        const key = (btn.getAttribute('data-filter') || 'all').trim() || 'all';
        setActiveChip(btn);
        applyCatalogFilter(key);
      });

      // Keyboard: left/right to move, enter/space to activate
      btn.addEventListener('keydown', (e) => {
        const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '];
        if (!keys.includes(e.key)) return;

        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
          return;
        }

        e.preventDefault();
        let nextIdx = idx;

        if (e.key === 'ArrowLeft') nextIdx = (idx - 1 + chips.length) % chips.length;
        if (e.key === 'ArrowRight') nextIdx = (idx + 1) % chips.length;
        if (e.key === 'Home') nextIdx = 0;
        if (e.key === 'End') nextIdx = chips.length - 1;

        chips[nextIdx].focus();
      });
    });

    // Initial state: apply active chip (or default to "Todas")
    const active = chips.find(b => b.classList.contains('chip--active')) || chips.find(b => (b.getAttribute('data-filter') || '') === 'all') || chips[0];
    if (active) {
      setActiveChip(active);
      const key = (active.getAttribute('data-filter') || 'all').trim() || 'all';
      applyCatalogFilter(key);
    }
  };


  items.forEach(item => {
    const btn = item.querySelector('.item__toggle');
    const descEl = item.querySelector('.item__desc');
    if (!btn || !descEl) return;

    // Image fallback
    const img = item.querySelector('.item__img');
    if (img){
      img.addEventListener('error', () => {
        img.style.display = 'none';
        const wrap = item.querySelector('.item__thumb');
        if (wrap) wrap.classList.add('is-missing');
      }, { once: true });
    }

    // Create details area once
    let details = item.querySelector('.item__details');
    if (!details){
      details = document.createElement('div');
      details.className = 'item__details';
      const p = document.createElement('p');
      p.className = 'item__full';
      details.appendChild(p);
      // Insert after the toggle button (before the pill if exists)
      const pill = item.querySelector('.pill');
      if (pill){
        item.insertBefore(details, pill);
      } else {
        item.appendChild(details);
      }
    }

    const fullText = (descEl.getAttribute('data-full') || '').trim();
    details.querySelector('.item__full').textContent = fullText || descEl.textContent.trim();

    // Accessibility
    btn.setAttribute('aria-expanded', 'false');

    const close = () => {
      item.classList.remove('is-expanded');
      btn.setAttribute('aria-expanded', 'false');
      btn.textContent = 'Leer más';
      details.style.maxHeight = '0px';
    };

    const open = () => {
      item.classList.add('is-expanded');
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = 'Ver menos';
      // set max-height to animate
      details.style.maxHeight = details.scrollHeight + 'px';
    };

    btn.addEventListener('click', () => {
      const expanded = item.classList.contains('is-expanded');
      if (expanded) close();
      else open();
    });

    // Keep animation correct on window resize
    window.addEventListener('resize', () => {
      if (item.classList.contains('is-expanded')){
        details.style.maxHeight = details.scrollHeight + 'px';
      }
    });
  });


  // Init category filters (chips)
  initCatalogFilters();
})();

// ===== MISION / VISION / RAZON (CAROUSEL) =====
(function initMVCarousel(){
  const carousel = document.querySelector('[data-mv-carousel]');
  if (!carousel) return;

  const track = carousel.querySelector('.mv-carousel__track');
  const slides = Array.from(track.querySelectorAll('.mv-card'));
  const prevBtn = carousel.querySelector('.mv-carousel__arrow--prev');
  const nextBtn = carousel.querySelector('.mv-carousel__arrow--next');
  const dotsWrap = carousel.parentElement?.querySelector('[data-mv-dots]');
  const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll('.mv-dot')) : [];

  if (!track || slides.length === 0 || !prevBtn || !nextBtn) return;

  let index = 0;

  const clickFx = (btn) => {
    if (!btn) return;
    // Reinicia animación
    btn.classList.remove('is-clicked');
    void btn.offsetWidth;
    btn.classList.add('is-clicked');
    window.setTimeout(() => btn.classList.remove('is-clicked'), 360);
  };


  const setActive = (i) => {
    index = (i + slides.length) % slides.length; // wrap
    track.style.transform = `translateX(-${index * 100}%)`;

    if (dots.length){
      dots.forEach((d, n) => {
        const active = n === index;
        d.classList.toggle('is-active', active);
        d.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }
  };

  prevBtn.addEventListener('click', () => { clickFx(prevBtn); setActive(index - 1); });
  nextBtn.addEventListener('click', () => { clickFx(nextBtn); setActive(index + 1); });

  if (dots.length){
    dots.forEach((dot, i) => dot.addEventListener('click', () => setActive(i)));
  }

  // Keyboard support
  carousel.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft'){ e.preventDefault(); clickFx(prevBtn); setActive(index - 1); }
    if (e.key === 'ArrowRight'){ e.preventDefault(); clickFx(nextBtn); setActive(index + 1); }
  });

  // Basic touch swipe
  let startX = 0;
  let deltaX = 0;

  const onStart = (x) => { startX = x; deltaX = 0; };
  const onMove = (x) => { deltaX = x - startX; };
  const onEnd = () => {
    if (Math.abs(deltaX) > 50){
      setActive(index + (deltaX < 0 ? 1 : -1));
    }
    startX = 0; deltaX = 0;
  };

  track.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), {passive:true});
  track.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), {passive:true});
  track.addEventListener('touchend', onEnd);

  setActive(0);
})();
