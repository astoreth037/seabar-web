/* ========================================
   SEA BAR — script.js
   ======================================== */

/* ---- NAV: Scroll shadow + mobile burger ---- */
const nav       = document.getElementById('nav');
const burger    = document.getElementById('burger');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

burger.addEventListener('click', () => {
  burger.classList.toggle('active');
  navLinks.classList.toggle('open');
  document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
});

// Close nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    burger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Close nav when clicking outside
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('open') &&
      !navLinks.contains(e.target) &&
      !burger.contains(e.target)) {
    burger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ---- SCROLL REVEAL ---- */
const revealElements = document.querySelectorAll(
  '.benefit-card, .testi-card, .feria-item, .upcoming-item, .galeria__item, .stat, .influencer-card, .precio, .contacto-card'
);

// Add reveal class
revealElements.forEach((el, i) => {
  el.classList.add('reveal');
  // Stagger siblings inside the same parent
  const siblings = Array.from(el.parentElement.children);
  const idx = siblings.indexOf(el);
  if (idx === 1) el.classList.add('reveal-delay-1');
  if (idx === 2) el.classList.add('reveal-delay-2');
  if (idx === 3) el.classList.add('reveal-delay-3');
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealElements.forEach(el => revealObserver.observe(el));

/* ---- ORDER FORM → WhatsApp ---- */
const orderForm = document.getElementById('orderForm');

if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre   = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const cantidad = document.getElementById('cantidad').value;
    const mensaje  = document.getElementById('mensaje').value.trim();

    // Basic validation
    if (!nombre || !telefono) {
      alert('Por favor, completa tu nombre y celular.');
      return;
    }

    // Build WhatsApp message
    let text = `Hola SEA BAR! 🌿\n\nQuiero hacer un pedido:\n`;
    text += `👤 Nombre: ${nombre}\n`;
    text += `📱 Celular: ${telefono}\n`;
    text += `🛒 Pedido: ${cantidad}\n`;
    if (mensaje) text += `💬 Nota: ${mensaje}\n`;
    text += `\n¡Gracias!`;

    const waURL = `https://wa.me/51994928993?text=${encodeURIComponent(text)}`;
    window.open(waURL, '_blank');

    // Reset form
    orderForm.reset();

    // Show success feedback
    const btn = orderForm.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = '✅ ¡Pedido enviado!';
    btn.style.background = '#25D366';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 3000);
  });
}

/* ---- SMOOTH ACTIVE NAV LINK (highlight on scroll) ---- */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav__links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        a.style.color = '';
        a.style.fontWeight = '';
        if (a.getAttribute('href') === `#${id}`) {
          a.style.color = 'var(--green-mid)';
        }
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

/* ---- HERO PARALLAX (subtle) ---- */
const heroBg = document.querySelector('.hero__bg-shape');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `translateY(${y * 0.15}px)`;
  }, { passive: true });
}

/* ---- GALERIA: Filter by category (optional UX enhancement) ---- */
const galItems = document.querySelectorAll('.galeria__item[data-cat]');

// If you want category filtering in the future, expose a filter function:
// filterGaleria('producto') — filters items by data-cat attribute
window.filterGaleria = function(cat) {
  galItems.forEach(item => {
    if (cat === 'all' || item.dataset.cat === cat) {
      item.style.opacity = '1';
      item.style.transform = '';
    } else {
      item.style.opacity = '0.3';
      item.style.transform = 'scale(0.95)';
    }
  });
};

/* ---- FLOATING WA BUTTON: hide on first load, show after scroll ---- */
const floatWa = document.querySelector('.float-wa');
if (floatWa) {
  floatWa.style.opacity = '0';
  floatWa.style.transform = 'scale(0.8)';
  floatWa.style.transition = 'opacity 0.4s ease, transform 0.4s ease, background 0.3s ease';
  setTimeout(() => {
    floatWa.style.opacity = '1';
    floatWa.style.transform = 'scale(1)';
  }, 2000);
}

/* ---- UTILITY: Detect mobile ---- */
const isMobile = () => window.innerWidth <= 768;

/* ---- KEYBOARD ACCESSIBILITY: Close mobile nav with ESC ---- */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    burger.classList.remove('active');
    navLinks.classList.remove('open');
    document.body.style.overflow = '';
  }
});

/* ---- CONSOLE EASTER EGG ---- */
console.log('%c🌊 SEA BAR', 'font-size:2rem;font-weight:bold;color:#1F4D3A;');
console.log('%cEnergía del mar peruano 🌿', 'font-size:1rem;color:#3E7F66;');
