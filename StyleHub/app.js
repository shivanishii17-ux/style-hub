/* ═════════════════════════════════════════════
   STYLE HUB — JavaScript
   - Hamburger / mobile menu toggle
   - Search clear button
   - Horizontal scroll rows
   - Bottom nav active state
   - Wishlist toggle
   - Scroll-in animations (IntersectionObserver)
   - Camera button ripple / visual search mock
═════════════════════════════════════════════ */

/* ── DOM Ready ── */
document.addEventListener('DOMContentLoaded', () => {
  initSplashScreen();
  initHamburger();
  initSearch();
  initWishlist();
  initBottomNav();
  initScrollAnimations();
  initProductCardClicks();
});

/* ════════════════════════════════════════════
   SPLASH SCREEN — Cinematic
════════════════════════════════════════════ */
function initSplashScreen() {
  const splash = document.getElementById('splash-screen');
  if (!splash) return;

  // Skip splash if navigating back/forward
  if (performance.getEntriesByType('navigation')[0]?.type === 'back_forward' || sessionStorage.getItem('sh_visited')) {
    splash.remove();
    return;
  }
  sessionStorage.setItem('sh_visited', '1');

  document.body.classList.add('no-scroll');
  initSplashParticles();

  setTimeout(() => {
    document.querySelectorAll('.bubble-letter').forEach(el => {
      el.style.animationDelay = '0s';
      el.classList.add('popped');
    });
  }, 2100);

  // 2 seconds then go to auth or homepage
  setTimeout(() => {
    splash.remove();
    document.body.classList.remove('no-scroll');
    if (!localStorage.getItem('sh_user')) {
      showAuthScreen();
    }
  }, 2000);
}

function initSplashParticles() {
  const canvas = document.getElementById('splash-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // Create floating dust particles
  const particles = Array.from({ length: 70 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.6 + 0.3,
    vx: (Math.random() - 0.5) * 0.35,
    vy: -(Math.random() * 0.5 + 0.15),
    alpha: Math.random() * 0.5 + 0.1,
    hue: Math.random() > 0.5 ? 52 : 45   // yellow / golden
  }));

  let running = true;
  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 80%, 75%, ${p.alpha})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.0008;
      // Reset when faded or off-screen
      if (p.alpha <= 0 || p.y < -10) {
        p.x = Math.random() * canvas.width;
        p.y = canvas.height + 5;
        p.alpha = Math.random() * 0.5 + 0.1;
      }
    });
    requestAnimationFrame(draw);
  }
  draw();

  // Stop canvas when splash is gone
  setTimeout(() => { running = false; }, 5100);
}


/* ══════════════════════════════════════════
   HAMBURGER / MOBILE MENU
══════════════════════════════════════════ */
function initHamburger() {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    btn.classList.toggle('open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));

    // Inject mobile search bar into menu once
    if (isOpen && !menu.querySelector('.search-bar')) {
      const mSearchWrap = document.createElement('div');
      mSearchWrap.style.cssText = 'padding:0 0 8px;display:flex;gap:8px;align-items:center;';
      mSearchWrap.innerHTML = `
        <div class="search-bar" style="flex:1;display:flex;align-items:center;gap:10px;background:#f4f2ff;border:1.5px solid #ddd6ff;border-radius:999px;padding:0 16px;height:44px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Search fashion…" style="flex:1;border:none;background:transparent;font-size:.875rem;outline:none;font-family:inherit;color:#111118;" />
        </div>`;
      menu.insertBefore(mSearchWrap, menu.firstChild);
    }
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove('open');
      btn.classList.remove('open');
    }
  });
}

/* ══════════════════════════════════════════
   SEARCH BAR — Active with dropdown results
══════════════════════════════════════════ */
function initSearch() {
  const input = document.getElementById('search-input');
  const clear = document.getElementById('search-clear');
  if (!input || !clear) return;

  // Build search index from product cards
  function buildIndex() {
    return Array.from(document.querySelectorAll('.product-card')).map(card => ({
      name: card.querySelector('.prod-name')?.textContent.trim() || '',
      brand: card.querySelector('.prod-brand')?.textContent.trim() || '',
      occasion: card.querySelector('.style-occasion')?.textContent.trim() || '',
      palette: card.querySelector('.palette-label')?.textContent.trim() || '',
      img: card.querySelector('img')?.src || '',
      el: card
    }));
  }

  // Create dropdown
  const dropdown = document.createElement('div');
  dropdown.id = 'search-dropdown';
  dropdown.style.cssText = `
    position:absolute;top:calc(100% + 8px);left:0;right:0;
    background:#fff;border:1.5px solid #ddd6ff;border-radius:16px;
    box-shadow:0 12px 40px rgba(108,59,255,0.15);z-index:999;
    max-height:360px;overflow-y:auto;display:none;
    font-family:'Inter',sans-serif;
  `;
  const searchWrap = document.getElementById('search-wrap');
  searchWrap.style.position = 'relative';
  searchWrap.appendChild(dropdown);

  function renderResults(query) {
    const q = query.toLowerCase().trim();
    dropdown.innerHTML = '';
    if (!q) { dropdown.style.display = 'none'; return; }

    const index = buildIndex();
    const results = index.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.occasion.toLowerCase().includes(q) ||
      p.palette.toLowerCase().includes(q)
    );

    if (!results.length) {
      dropdown.style.display = 'block';
      dropdown.innerHTML = `<div style="padding:20px;text-align:center;color:#9CA3AF;font-size:.85rem;">No results for "${query}" — try "saree", "denim", "wedding"</div>`;
      return;
    }

    dropdown.style.display = 'block';

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'padding:10px 16px 6px;font-size:.72rem;font-weight:700;color:#6C3BFF;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #f0ebff;';
    header.textContent = `${results.length} result${results.length > 1 ? 's' : ''} found`;
    dropdown.appendChild(header);

    results.forEach(p => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 16px;cursor:pointer;transition:background .15s;border-bottom:1px solid #f9f7ff;';
      item.innerHTML = `
        <img src="${p.img}" style="width:44px;height:56px;object-fit:cover;border-radius:8px;flex-shrink:0;" />
        <div style="flex:1;min-width:0;">
          <div style="font-size:.85rem;font-weight:600;color:#111827;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</div>
          <div style="font-size:.72rem;color:#6C3BFF;font-weight:600;margin:2px 0;">${p.brand}</div>
          <div style="font-size:.7rem;color:#6B7280;">${p.occasion} · ${p.palette}</div>
        </div>
        <span style="font-size:.7rem;background:#f0ebff;color:#6C3BFF;padding:3px 8px;border-radius:999px;font-weight:600;flex-shrink:0;">View</span>
      `;
      item.addEventListener('mouseenter', () => item.style.background = '#f9f7ff');
      item.addEventListener('mouseleave', () => item.style.background = '');
      item.addEventListener('click', () => {
        dropdown.style.display = 'none';
        input.value = p.name;
        clear.classList.add('visible');
        showProductModal(p.el);
      });
      dropdown.appendChild(item);
    });
  }

  input.addEventListener('input', () => {
    clear.classList.toggle('visible', input.value.length > 0);
    renderResults(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      renderResults(input.value);
      if (!dropdown.querySelector('[style*="cursor:pointer"]')) {
        showToast(`🔍 No exact match — try browsing categories below`);
      }
    }
    if (e.key === 'Escape') { dropdown.style.display = 'none'; }
  });

  clear.addEventListener('click', () => {
    input.value = '';
    clear.classList.remove('visible');
    dropdown.style.display = 'none';
    input.focus();
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!searchWrap.contains(e.target)) dropdown.style.display = 'none';
  });
}

/* ══════════════════════════════════════════
   SCROLL ROWS (horizontal)
══════════════════════════════════════════ */
function scrollRow(scrollId, direction) {
  const el = document.getElementById(scrollId);
  if (!el) return;
  el.scrollBy({ left: direction * 340, behavior: 'smooth' });
}

/* ══════════════════════════════════════════
   WISHLIST TOGGLE
══════════════════════════════════════════ */
function getWishlist() {
  return JSON.parse(localStorage.getItem('sh_wishlist') || '[]');
}

function saveWishlist(list) {
  localStorage.setItem('sh_wishlist', JSON.stringify(list));
  updateWishlistBadge();
}

function updateWishlistBadge() {
  const badge = document.querySelector('.action-btn .badge');
  if (badge) badge.textContent = getWishlist().length;
}

function toggleWishlistItem(name, img, brand, occasion) {
  let list = getWishlist();
  const idx = list.findIndex(i => i.name === name);
  if (idx > -1) {
    list.splice(idx, 1);
    saveWishlist(list);
    return false;
  } else {
    list.push({ name, img, brand, occasion, addedAt: Date.now() });
    saveWishlist(list);
    return true;
  }
}

function isWishlisted(name) {
  return getWishlist().some(i => i.name === name);
}

function initWishlist() {
  const list = getWishlist();
  document.querySelectorAll('.prod-wish').forEach(btn => {
    const card = btn.closest('.product-card');
    const name = card?.querySelector('.prod-name')?.textContent.trim() || '';

    // Restore saved state
    if (isWishlisted(name)) {
      btn.textContent = '♥';
      btn.classList.add('active');
      btn.style.color = '#EF4444';
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const img    = card?.querySelector('img')?.src || '';
      const brand  = card?.querySelector('.prod-brand')?.textContent.trim() || '';
      const occ    = card?.querySelector('.style-occasion')?.textContent.trim() || '';
      const added  = toggleWishlistItem(name, img, brand, occ);
      btn.textContent = added ? '♥' : '♡';
      btn.classList.toggle('active', added);
      btn.style.color = added ? '#EF4444' : '';

      // Heart burst animation
      btn.style.transform = 'scale(1.4)';
      setTimeout(() => btn.style.transform = '', 200);

      showToast(added ? `♥ "${name}" added to Wishlist` : `♡ "${name}" removed from Wishlist`);
    });
  });
  updateWishlistBadge();
}

/* ══════════════════════════════════════════
   BOTTOM NAV — active state
══════════════════════════════════════════ */
function initBottomNav() {
  const items = document.querySelectorAll('.bn-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Special home icon background
      document.querySelectorAll('.bn-home .bn-icon').forEach(ic => {
        ic.style.background = item.id === 'bn-home' ? '' : 'transparent';
        ic.style.boxShadow  = item.id === 'bn-home' ? '' : 'none';
        ic.style.color      = item.id === 'bn-home' ? '' : 'var(--clr-primary)';
      });
    });
  });
}

/* ══════════════════════════════════════════
   SCROLL ANIMATIONS (IntersectionObserver)
══════════════════════════════════════════ */
function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.category-row, .hero-banner, .product-card, .brands-strip'
  );

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${i * 0.04}s`;
        entry.target.classList.add('animate-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  targets.forEach(t => io.observe(t));
}

/* ══════════════════════════════════════════
   CATEGORY BUTTONS
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  ['kids-cat-btn', 'mens-cat-btn', 'girls-cat-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => showToast('📦 Opening categories…'));
  });
});



/* ══════════════════════════════════════════
   PRODUCT CARD CLICK
══════════════════════════════════════════ */
function initProductCardClicks() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.prod-wish')) return;
      showProductModal(card);
    });
  });
}
function showProductModal(card) {
  const name     = card.querySelector('.prod-name')?.textContent.trim() || '';
  const brand    = card.querySelector('.prod-brand')?.textContent.trim() || '';
  const occasion = card.querySelector('.style-occasion')?.textContent.trim() || '';
  const suit     = card.querySelector('.style-suitability')?.textContent.trim() || '';
  const palette  = card.querySelector('.palette-label')?.textContent.trim() || '';
  const img      = card.querySelector('img')?.src || '';
  const tag      = card.querySelector('.prod-tag')?.textContent.trim() || '';
  const colors   = Array.from(card.querySelectorAll('.color-block')).map(c => c.style.background);

  const tips = {
    'Office / Formal Meeting': 'Pair with leather oxford shoes and a minimal watch for a sharp boardroom look.',
    'Casual Trip / Weekend Adventure': 'Add white sneakers and a crossbody bag to complete the relaxed vibe.',
    'Birthday Party': 'Go for statement earrings and block heels to elevate this festive look.',
    'Beach / Casual Play': 'Pair with sandals and a sun hat — keep accessories minimal and breezy.',
    'Park / Birthday': 'Comfortable sneakers and a small backpack make this outfit park-perfect.',
    'Picnic / Summer Party': 'Add a straw hat and flat sandals for a fresh summer picnic look.',
    'Sports / Travel': 'Pair with running shoes and a cap — functional and stylish on the go.',
    'Day Out / School': 'Clean white sneakers and a small tote bag complete this everyday look.',
    'Evening / Gala': 'Pair with strappy heels, a clutch, and bold jewellery for a stunning evening look.',
    'Brunch / Day Date': 'Add nude heels or loafers and minimal gold jewellery for an effortless brunch look.',
    'Office / Presentation': 'Pair with pointed-toe heels and a structured handbag for authority dressing.',
    'Garden Party / Wedding': 'Floral accessories and block heels make this garden-ready and elegant.',
    'Festivals / Ceremonies': 'Pair with jhumkas, bangles, and kolhapuris for a complete ethnic look.',
    'Casual / Street': 'Add chunky sneakers and a cap for a bold street-style statement.',
    'Traditional Ceremony / Festivals': 'Pair with mojris, a pocket square, and a statement watch for a regal look.',
    'Resort Wear / Evening Social': 'Add loafers and a linen tote — effortlessly luxurious.',
    'Hiking / Casual Friday': 'Pair with cargo boots and a utility vest for a gorpcore-inspired look.',
    'Brunch / Golf Course': 'Add clean white sneakers or loafers and a minimal cap for a preppy finish.',
    'Family Brunch / Recital': 'Pair with mary-jane flats and a small sling bag for a sweet, polished look.',
    'Gala Night / Festive Celeb': 'Add glitter heels and a sparkly clutch to complete the magical look.',
    'Playdate / Outdoor Fun': 'Pair with velcro sneakers and a small backpack — practical and cute.',
    'Beach Trip / Summer Party': 'Add flip-flops, a bucket hat, and a tote bag for the perfect beach day.',
    'School / Weekend Trip': 'Pair with white sneakers and a backpack — clean and effortless.',
    'Birthday Party / Picnic': 'Add ballet flats and a floral hair clip for a sweet, twirl-ready look.',
  };

  const tip = tips[occasion] || 'Style with confidence — fit and attitude make any outfit shine. Add accessories that complement, not compete.';

  let existing = document.getElementById('prod-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'prod-modal';
  modal.style.cssText = `
    position:fixed;inset:0;z-index:9000;display:flex;align-items:center;justify-content:center;
    background:rgba(0,0,0,0.55);backdrop-filter:blur(6px);padding:16px;
    animation:modalBgIn .2s ease;
  `;

  const alreadySaved = isWishlisted(name);

  modal.innerHTML = `
    <style>
      @keyframes modalBgIn{from{opacity:0}to{opacity:1}}
      @keyframes modalCardIn{from{opacity:0;transform:translateY(30px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
    </style>
    <div style="
      background:#fff;border-radius:24px;max-width:480px;width:100%;
      box-shadow:0 32px 80px rgba(0,0,0,0.25);overflow:hidden;
      animation:modalCardIn .3s cubic-bezier(.34,1.56,.64,1);
      max-height:90vh;overflow-y:auto;
    ">
      <div style="position:relative;aspect-ratio:4/3;overflow:hidden;background:#f3f4f6;">
        <img src="${img}" style="width:100%;height:100%;object-fit:cover;" />
        ${tag ? `<span style="position:absolute;top:12px;left:12px;background:#6C3BFF;color:#fff;font-size:.7rem;font-weight:700;padding:4px 12px;border-radius:999px;text-transform:uppercase;letter-spacing:.05em;">${tag}</span>` : ''}
        <button onclick="document.getElementById('prod-modal').remove()" style="
          position:absolute;top:12px;right:12px;width:34px;height:34px;
          background:rgba(255,255,255,.9);border:none;border-radius:50%;cursor:pointer;
          font-size:1.1rem;display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(0,0,0,.15);
        ">✕</button>
      </div>
      <div style="padding:20px 22px 24px;">
        <p style="font-size:.72rem;font-weight:700;color:#6C3BFF;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">${brand}</p>
        <h2 style="font-family:'Outfit',sans-serif;font-size:1.3rem;font-weight:800;color:#111827;margin-bottom:14px;">${name}</h2>
        <div style="background:#f9f7ff;border:1px solid #ede9fe;border-radius:12px;padding:12px 14px;margin-bottom:14px;">
          <p style="font-size:.7rem;font-weight:700;color:#6C3BFF;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">🎨 Color Palette — ${palette}</p>
          <div style="display:flex;gap:8px;align-items:center;">
            ${colors.map(c => `<span style="width:32px;height:32px;border-radius:8px;background:${c};box-shadow:0 2px 6px rgba(0,0,0,.12);display:inline-block;"></span>`).join('')}
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-bottom:14px;flex-wrap:wrap;">
          <div style="flex:1;min-width:120px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:10px 12px;">
            <p style="font-size:.68rem;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px;">📅 Occasion</p>
            <p style="font-size:.82rem;font-weight:600;color:#111827;">${occasion}</p>
          </div>
          <div style="flex:1;min-width:120px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:10px 12px;">
            <p style="font-size:.68rem;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px;">✅ Suitability</p>
            <p style="font-size:.82rem;font-weight:600;color:#111827;">${suit.replace('✅ ','')}</p>
          </div>
        </div>
        <div style="background:linear-gradient(135deg,#6C3BFF15,#C850C015);border:1px solid #ddd6fe;border-radius:12px;padding:14px;">
          <p style="font-size:.7rem;font-weight:700;color:#6C3BFF;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;">💡 Styling Tip</p>
          <p style="font-size:.84rem;color:#374151;line-height:1.6;">${tip}</p>
        </div>
        <button id="modal-wish-btn" style="
          margin-top:16px;width:100%;padding:13px;
          background:${alreadySaved ? '#EF4444' : 'linear-gradient(135deg,#6C3BFF,#C850C0)'};
          color:#fff;font-size:.9rem;font-weight:700;font-family:'Inter',sans-serif;
          border:none;border-radius:999px;cursor:pointer;
          box-shadow:0 6px 20px rgba(108,59,255,.35);transition:background .2s;
        ">${alreadySaved ? '♥ Saved to Wishlist' : '♡ Save to Wishlist'}</button>
      </div>
    </div>
  `;

  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);

  // Wire wishlist button
  document.getElementById('modal-wish-btn').addEventListener('click', () => {
    const added = toggleWishlistItem(name, img, brand, occasion);
    const btn = document.getElementById('modal-wish-btn');
    btn.textContent = added ? '♥ Saved to Wishlist' : '♡ Save to Wishlist';
    btn.style.background = added ? '#EF4444' : 'linear-gradient(135deg,#6C3BFF,#C850C0)';
    // Sync card button
    document.querySelectorAll('.prod-wish').forEach(wb => {
      const n = wb.closest('.product-card')?.querySelector('.prod-name')?.textContent.trim();
      if (n === name) {
        wb.textContent = added ? '♥' : '♡';
        wb.classList.toggle('active', added);
        wb.style.color = added ? '#EF4444' : '';
      }
    });
    showToast(added ? `♥ "${name}" added to Wishlist` : `♡ "${name}" removed from Wishlist`);
  });
}

/* ══════════════════════════════════════════
   SUB CHIPS
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.sub-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      showToast(`🔎 Browsing "${chip.textContent}" category…`);
    });
  });
});

/* ══════════════════════════════════════════
   BRAND PILLS
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.brand-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      showToast(`✨ Viewing ${pill.textContent} collection…`);
    });
  });
});

/* ══════════════════════════════════════════
   TOAST NOTIFICATION
══════════════════════════════════════════ */
let toastTimeout;
function showToast(message) {
  let toast = document.getElementById('sh-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sh-toast';
    toast.style.cssText = `
      position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);
      background:#111118;color:#fff;padding:10px 22px;border-radius:999px;
      font-family:'Inter',sans-serif;font-size:.85rem;font-weight:500;
      white-space:nowrap;z-index:9999;
      box-shadow:0 6px 24px rgba(0,0,0,.2);
      opacity:0;transition:opacity .22s ease,transform .22s ease;
      pointer-events:none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
  }, 2200);
}

/* ══════════════════════════════════════════
   HEADER SCROLL SHADOW
══════════════════════════════════════════ */
/* ── Scroll Effects ── */
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  const scrollY = window.scrollY;
  
  // Header scrolled class
  if (header) {
    header.classList.toggle('scrolled', scrollY > 60);
    header.style.boxShadow = '';
    header.style.background = '';
  }

  // Hero Parallax (Summer Vibe)
  const heroAlpha = document.querySelector('.hero-alphabet-overlay');
  const heroBg = document.querySelector('.hero-summer-bg');
  if (heroAlpha) {
    heroAlpha.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.2}px))`;
  }
  if (heroBg) {
    heroBg.style.transform = `translateY(${scrollY * 0.1}px) scale(${1 + scrollY * 0.0002})`;
  }
}, { passive: true });





/* ══════════════════════════════════════════
   AUTH SCREEN
══════════════════════════════════════════ */
function showAuthScreen() {
  const auth = document.getElementById('auth-screen');
  if (!auth) return;
  document.body.classList.add('no-scroll');
  auth.style.display = 'flex';
  // Trigger transition after paint
  requestAnimationFrame(() => requestAnimationFrame(() => auth.classList.add('auth-visible')));
}

function closeAuthScreen() {
  const auth = document.getElementById('auth-screen');
  if (!auth) return;
  auth.classList.add('auth-fade-out');
  document.body.classList.remove('no-scroll');
  setTimeout(() => auth.remove(), 600);
}

function switchAuthTab(tab) {
  const loginForm  = document.getElementById('form-login');
  const signupForm = document.getElementById('form-signup');
  const tabLogin   = document.getElementById('tab-login');
  const tabSignup  = document.getElementById('tab-signup');

  if (tab === 'login') {
    loginForm.classList.remove('auth-form-hidden');
    signupForm.classList.add('auth-form-hidden');
    tabLogin.classList.add('active');
    tabSignup.classList.remove('active');
  } else {
    signupForm.classList.remove('auth-form-hidden');
    loginForm.classList.add('auth-form-hidden');
    tabSignup.classList.add('active');
    tabLogin.classList.remove('active');
  }
  // Clear errors on tab switch
  document.getElementById('login-error').textContent = '';
  document.getElementById('signup-error').textContent = '';
}

function handleSignup(e) {
  e.preventDefault();
  const name     = document.getElementById('signup-name').value.trim();
  const email    = document.getElementById('signup-email').value.trim().toLowerCase();
  const password = document.getElementById('signup-password').value;
  const errEl    = document.getElementById('signup-error');

  if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }

  // Check if email already registered
  const users = JSON.parse(localStorage.getItem('sh_users') || '[]');
  if (users.find(u => u.email === email)) { errEl.textContent = 'Email already registered. Please login.'; return; }

  // Save new user
  users.push({ name, email, password });
  localStorage.setItem('sh_users', JSON.stringify(users));
  localStorage.setItem('sh_user', JSON.stringify({ name, email }));

  closeAuthScreen();
  showToast(`👋 Welcome, ${name}!`);
}

function handleLogin(e) {
  e.preventDefault();
  const email    = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');

  const users = JSON.parse(localStorage.getItem('sh_users') || '[]');
  const user  = users.find(u => u.email === email && u.password === password);

  if (!user) { errEl.textContent = 'Incorrect email or password.'; return; }

  localStorage.setItem('sh_user', JSON.stringify({ name: user.name, email: user.email }));
  closeAuthScreen();
  showToast(`👋 Welcome back, ${user.name}!`);
}

/* ══════════════════════════════════════════
   STYLE ADVISOR — AI Tips Engine
══════════════════════════════════════════ */
const STYLE_TIPS = [
  '👗 Rule of Three: Combine no more than 3 colours in one outfit. One dominant, one secondary, one accent.',
  '🎨 Wear complementary colours (opposite on the colour wheel) for bold, high-contrast looks — like blue & orange.',
  '✨ Monochromatic dressing (one colour in different shades) always looks intentional and polished.',
  '👟 White sneakers are the universal pairing — they work with dresses, trousers, jeans, and ethnic wear.',
  '🧥 A well-fitted blazer instantly elevates any casual outfit — jeans, a tee, and a blazer = smart casual done right.',
  '💡 Tuck in your shirt on one side (the "French tuck") to add structure without looking too formal.',
  '🌿 Earthy tones — terracotta, sage, sand, rust — are always in season and pair beautifully together.',
  '👔 For formal occasions, match your belt to your shoes for a cohesive, polished look.',
  '🌈 Pastels work best in spring/summer. Pair them with white or nude to keep the look fresh.',
  '🔥 Dopamine dressing: wear a colour that makes you feel confident. Mood-boosting fashion is real.',
  '💎 Accessories should complement, not compete. If your outfit is bold, keep accessories minimal.',
  '🧣 A statement scarf can transform a basic outfit — tie it on your bag, neck, or hair.',
  '👒 Proportion matters: wide-leg trousers pair best with fitted tops; slim trousers with oversized tops.',
  '🌙 Navy is the new black — it\'s more interesting, equally versatile, and flatters every skin tone.',
  '✂️ Fit is everything. A well-tailored average outfit beats an ill-fitting expensive one every time.',
  '🎯 The 60-30-10 rule: 60% dominant colour, 30% secondary, 10% accent. Works for any outfit.',
  '🌸 Floral prints look best when paired with solid colours that match one of the hues in the print.',
  '🏖️ For beach/resort wear, linen and cotton in white, sky blue, or coral are always the right choice.',
];

let tipIndex = 0;

function toggleAdvisor() {
  const panel = document.getElementById('sa-panel');
  const isOpen = panel.classList.toggle('open');
  if (isOpen && !panel.dataset.loaded) {
    panel.dataset.loaded = '1';
    showTip(tipIndex);
  }
}

function showTip(i) {
  const el = document.getElementById('sa-tip');
  if (el) el.textContent = STYLE_TIPS[i];
}

function nextTip() {
  tipIndex = (tipIndex + 1) % STYLE_TIPS.length;
  showTip(tipIndex);
}

function shuffleTip() {
  tipIndex = Math.floor(Math.random() * STYLE_TIPS.length);
  showTip(tipIndex);
}

/* ══════════════════════════════════════════
   USER GREETING BAR
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('sh_user') || 'null');
  if (!user) return;

  const bar = document.createElement('div');
  bar.className = 'user-greeting';
  bar.innerHTML = `<span>👋 Welcome back, <strong>${user.name}</strong>! Ready to style today?</span>
    <button class="user-greeting-logout" onclick="logoutUser()">Logout</button>`;

  const header = document.getElementById('header');
  if (header) header.insertAdjacentElement('afterend', bar);

  // Also wire up womens + accessories cat buttons
  ['womens-cat-btn','acc-cat-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => showToast('📦 Opening categories…'));
  });
});

function logoutUser() {
  localStorage.removeItem('sh_user');
  location.reload();
}

/* ══════════════════════════════════════════
   AI ADVISOR — DRAGGABLE FAB
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const fab = document.getElementById('ai-fab');
  if (!fab) return;

  let dragging = false, startX, startY, origX, origY, moved = false;

  function getPos() {
    const r = fab.getBoundingClientRect();
    return { x: r.left, y: r.top };
  }

  function onDown(e) {
    dragging = true; moved = false;
    const pt = e.touches ? e.touches[0] : e;
    startX = pt.clientX; startY = pt.clientY;
    const pos = getPos();
    origX = pos.x; origY = pos.y;
    fab.style.transition = 'none';
    fab.style.animation = 'none';
    e.preventDefault();
  }

  function onMove(e) {
    if (!dragging) return;
    const pt = e.touches ? e.touches[0] : e;
    const dx = pt.clientX - startX;
    const dy = pt.clientY - startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
    const newX = Math.max(0, Math.min(window.innerWidth - fab.offsetWidth, origX + dx));
    const newY = Math.max(0, Math.min(window.innerHeight - fab.offsetHeight, origY + dy));
    fab.style.left = newX + 'px';
    fab.style.top  = newY + 'px';
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
    e.preventDefault();
  }

  function onUp() {
    if (!dragging) return;
    dragging = false;
    fab.style.transition = '';
    fab.style.animation = '';
    if (!moved) {
      // It was a click — go to advisor page
      window.location.href = 'advisor.html';
    }
  }

  fab.addEventListener('mousedown', onDown);
  fab.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('mousemove', onMove);
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('mouseup', onUp);
  window.addEventListener('touchend', onUp);
});

/* ══════════════════════════════════════════════
   VIEW MORE — Extra images per category
══════════════════════════════════════════════ */
const EXTRA_IMAGES = {
  'kids-scroll': [
    { img: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&q=80', name: 'Rainbow Knit Set', brand: 'Tiny Threads', occasion: 'Casual / Everyday', palette: 'Rainbow Mix' },
    { img: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400&q=80', name: 'Floral Summer Dress', brand: 'Bloom Kids', occasion: 'Park / Birthday', palette: 'Floral Bright' },
    { img: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&q=80', name: 'Denim Play Jacket', brand: 'Mini Denim', occasion: 'School / Weekend', palette: 'Indigo Blue' },
  ],
  'mens-scroll': [
    { img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', name: 'Classic Linen Shirt', brand: 'Linen Co', occasion: 'Casual / Resort', palette: 'Warm Linen' },
    { img: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80', name: 'Smart Blazer Look', brand: 'Sharp Cuts', occasion: 'Office / Meeting', palette: 'Charcoal Sharp' },
    { img: 'https://images.unsplash.com/photo-1534030347209-467a5b0ad3e6?w=400&q=80', name: 'Ethnic Kurta Set', brand: 'Heritage Wear', occasion: 'Festivals / Ceremonies', palette: 'Ethnic Gold' },
  ],
  'girls-scroll': [
    { img: 'https://images.unsplash.com/photo-1502781252888-9143ba7f074e?w=400&q=80', name: 'Pastel Midi Dress', brand: 'Soft Hues', occasion: 'Brunch / Day Date', palette: 'Pastel Soft' },
    { img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80', name: 'Boho Floral Maxi', brand: 'Free Spirit', occasion: 'Garden Party', palette: 'Boho Bloom' },
    { img: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80', name: 'Street Style Set', brand: 'Urban Girl', occasion: 'Casual / Street', palette: 'Urban Pop' },
  ],
  'womens-scroll': [
    { img: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&q=80', name: 'Silk Evening Gown', brand: 'Luxe Atelier', occasion: 'Evening / Gala', palette: 'Silk Gold' },
    { img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80', name: 'Embroidered Saree', brand: 'Ethnic Roots', occasion: 'Festivals / Ceremonies', palette: 'Festive Fire' },
    { img: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&q=80', name: 'Pastel Co-ord', brand: 'Pastel Studio', occasion: 'Brunch / Day Date', palette: 'Blush Mono' },
  ],
  'acc-scroll': [
    { img: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80', name: 'Pearl Drop Earrings', brand: 'Pearl House', occasion: 'Evening / Festive', palette: 'Pearl White' },
    { img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80', name: 'Aviator Sunglasses', brand: 'Sun & Shade', occasion: 'Casual / Outdoor', palette: 'Gold Frame' },
    { img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80', name: 'Mini Sling Bag', brand: 'Bag Studio', occasion: 'Casual / Evening', palette: 'Nude Minimal' },
  ],
};

const CAT_MAP = {
  'kids-scroll': 'Kids',
  'mens-scroll': 'Mens',
  'girls-scroll': 'Girls',
  'womens-scroll': 'Womens',
  'acc-scroll': 'Accessories',
};

document.addEventListener('DOMContentLoaded', () => {
  Object.keys(EXTRA_IMAGES).forEach(scrollId => {
    const scrollEl = document.getElementById(scrollId);
    if (!scrollEl) return;
    const wrap = scrollEl.closest('.product-scroll-wrap');
    if (!wrap) return;

    const btn = document.createElement('button');
    btn.className = 'view-more-btn';
    btn.textContent = 'View More +';
    btn.dataset.expanded = 'false';
    wrap.insertAdjacentElement('afterend', btn);

    btn.addEventListener('click', () => {
      const cat = CAT_MAP[scrollId] || '';
      window.location.href = `collection.html?cat=${encodeURIComponent(cat)}`;
    });
  });
});
