/* ═══════════════════════════════════════
   SEABAR — script.js
   ═══════════════════════════════════════ */

/* ── LOADER ── */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 1300);
});

/* ── AUDIO (ocean ambience synth) ── */
let audioCtx = null, oceanNodes = [], audioPlaying = false;

function createOcean() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const master = audioCtx.createGain();
  master.gain.setValueAtTime(0, audioCtx.currentTime);
  master.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 2);
  master.connect(audioCtx.destination);

  function makeWave(freq, delay, dur) {
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / audioCtx.sampleRate;
      const env = Math.sin(Math.PI * t / dur);
      data[i] = env * (Math.random() * 2 - 1) * 0.4;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = freq;
    const gain = audioCtx.createGain();
    gain.gain.value = 0.3 + Math.random() * 0.3;
    src.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    src.start(audioCtx.currentTime + delay);
    oceanNodes.push(src);
  }

  // Multiple wave layers at different frequencies
  makeWave(400, 0, 4.2);
  makeWave(280, 1.1, 5.8);
  makeWave(180, 2.3, 3.7);
  makeWave(120, 0.6, 6.5);

  // Birds (occasional high chirps)
  function addBird() {
    if (!audioPlaying) return;
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.frequency.value = 2400 + Math.random() * 800;
    osc.type = 'sine';
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + 0.05);
    g.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.25);
    osc.connect(g); g.connect(master);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
    setTimeout(addBird, 3000 + Math.random() * 8000);
  }
  setTimeout(addBird, 4000);
  audioPlaying = true;
}

function toggleAudio() {
  const btn = document.getElementById('audio-btn');
  if (!audioPlaying) {
    createOcean();
    btn.textContent = '🔊';
    btn.title = 'Silenciar playa';
  } else {
    if (audioCtx) { audioCtx.suspend(); }
    btn.textContent = '🔇';
    btn.title = 'Sonido de playa';
    audioPlaying = false;
  }
}

/* ── CURSOR ── */
const dot  = document.getElementById('cur-dot');
const ring = document.getElementById('cur-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  dot.style.left = mx + 'px'; dot.style.top = my + 'px';
});
(function animRing() {
  rx += (mx - rx) * .1; ry += (my - ry) * .1;
  ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
  requestAnimationFrame(animRing);
})();

const hoverEls = document.querySelectorAll('a, button, .bc, .tc, .perk, .feria-item, .next-item, .cc, .pc, .ulva-card, .env-card');
hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
});
document.addEventListener('mousedown', () => document.body.classList.add('clicking'));
document.addEventListener('mouseup',   () => document.body.classList.remove('clicking'));

/* ── NAV ── */
const nav      = document.getElementById('nav');
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => nav.classList.toggle('up', scrollY > 60), { passive: true });

burger.addEventListener('click', () => {
  const open = navLinks.classList.toggle('open');
  const spans = burger.querySelectorAll('span');
  spans[0].style.transform = open ? 'rotate(45deg) translate(5px,5px)'  : '';
  spans[1].style.opacity   = open ? '0' : '';
  spans[2].style.transform = open ? 'rotate(-45deg) translate(5px,-5px)' : '';
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

/* ── PARALLAX BEACH ── */
const heroBg = document.getElementById('hero-bg');
window.addEventListener('scroll', () => {
  if (heroBg) heroBg.style.transform = `translateY(${scrollY * 0.45}px)`;
}, { passive: true });

/* ── TABS ── */
function switchTab(id) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const panel = document.getElementById('panel-' + id);
  const btn   = document.querySelector(`[data-tab="${id}"]`);
  if (panel) panel.classList.add('active');
  if (btn) { btn.classList.add('active'); btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }
  document.querySelector('.tabs-nav-wrap').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => {
    if (panel) panel.querySelectorAll('.rv:not(.in)').forEach(el => io.observe(el));
  }, 80);
  if (id === 'ulva') setTimeout(runCounters, 300);
}

/* ── REVEAL ── */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
document.querySelectorAll('.rv').forEach(el => io.observe(el));

/* ── COUNTERS ── */
function countUp(el, target, suffix, dur = 1400) {
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p    = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(ease * parseFloat(target)) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target + suffix;
  };
  requestAnimationFrame(step);
}
function runCounters() {
  const c1 = document.getElementById('cnt1');
  const c2 = document.getElementById('cnt2');
  const c3 = document.getElementById('cnt3');
  if (c1 && !c1.dataset.done) { c1.dataset.done = 1; countUp(c1, 3,   'x');  }
  if (c2 && !c2.dataset.done) { c2.dataset.done = 1; countUp(c2, 100, '%'); }
  if (c3 && !c3.dataset.done) { c3.dataset.done = 1; countUp(c3, 0,   '');  }
}
setTimeout(runCounters, 1500);

/* ── ORDER FORM ── */
const WA = 'https://wa.me/51994928993';
document.getElementById('orderForm').addEventListener('submit', e => {
  e.preventDefault();
  const n   = document.getElementById('fn').value.trim();
  const t   = document.getElementById('ft').value.trim();
  const c   = document.getElementById('fc').value;
  const env = document.getElementById('fenv').value;
  const m   = document.getElementById('fm').value.trim();
  if (!n || !t) { alert('Por favor completa tu nombre y celular.'); return; }
  let msg = `Hola SEABAR! 🌿\n\nPedido:\n👤 ${n}\n📱 ${t}\n🛒 ${c}\n📦 ${env}`;
  if (m) msg += `\n💬 ${m}`;
  window.open(`${WA}?text=${encodeURIComponent(msg)}`, '_blank');
  const btn = e.target.querySelector('button[type=submit]');
  const orig = btn.innerHTML;
  btn.textContent = '✅ ¡Enviado!'; btn.style.background = '#25D366';
  setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; e.target.reset(); }, 3500);
});

/* ── HERO PARALLAX (left content) ── */
window.addEventListener('scroll', () => {
  const c = document.querySelector('.hero-left');
  if (c && scrollY < 700) c.style.transform = `translateY(${scrollY * .055}px)`;
}, { passive: true });
