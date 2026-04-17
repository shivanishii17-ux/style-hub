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
  initHamburger();
  initSearch();
  initWishlist();
  initBottomNav();
  initScrollAnimations();
  initCameraBtn();
  initProductCardClicks();
});

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
   SEARCH BAR
══════════════════════════════════════════ */
function initSearch() {
  const input = document.getElementById('search-input');
  const clear = document.getElementById('search-clear');
  if (!input || !clear) return;

  input.addEventListener('input', () => {
    clear.classList.toggle('visible', input.value.length > 0);
  });

  clear.addEventListener('click', () => {
    input.value = '';
    clear.classList.remove('visible');
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      showToast(`🔍 Searching for "${input.value.trim()}"…`);
    }
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
function initWishlist() {
  document.querySelectorAll('.prod-wish').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const active = btn.classList.toggle('active');
      btn.textContent = active ? '♥' : '♡';
      btn.style.color  = active ? '#EF4444' : '';
      showToast(active ? '♥ Added to Wishlist' : '♡ Removed from Wishlist');
    });
  });
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
  ['kids-cat-btn', 'mens-cat-btn', 'womens-cat-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener('click', () => showToast('📦 Opening categories…'));
  });
});

/* ══════════════════════════════════════════
   CAMERA / VISUAL SEARCH BUTTON
══════════════════════════════════════════ */
function initCameraBtn() {
  const btn = document.getElementById('camera-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    // Ripple
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute;inset:0;border-radius:50%;
      background:rgba(255,255,255,.4);
      animation:rippleAnim .5s ease-out forwards;
      pointer-events:none;
    `;
    btn.style.position = 'relative';
    btn.style.overflow = 'hidden';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    // Mock visual search
    showToast('📷 Visual Search — Upload an image to find similar styles!');
  });

  // Inject ripple keyframe once
  if (!document.getElementById('ripple-style')) {
    const s = document.createElement('style');
    s.id = 'ripple-style';
    s.textContent = `
      @keyframes rippleAnim {
        from { transform: scale(0); opacity: 1; }
        to   { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(s);
  }
}

/* ══════════════════════════════════════════
   PRODUCT CARD CLICK
══════════════════════════════════════════ */
function initProductCardClicks() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.prod-wish')) return;
      const name  = card.querySelector('.prod-name')?.textContent || 'item';
      const price = card.querySelector('.prod-price')?.textContent || '';
      showToast(`🛍️ ${name} — ${price}`);
    });
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
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  if (!header) return;
  if (window.scrollY > 10) {
    header.style.boxShadow = '0 2px 16px rgba(0,0,0,.10)';
  } else {
    header.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)';
  }
}, { passive: true });
