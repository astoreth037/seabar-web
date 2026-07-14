/* ═══════════════════════════════════════
   SEABAR — script.js
   ═══════════════════════════════════════ */

/* ── LOADER ── */
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('loader').classList.add('done'), 1300);
});

/* ══ OCEAN AUDIO (Web Audio API - olas sintéticas + pájaros) ══ */
let audioCtx = null, masterGain = null, audioPlaying = false;

function buildOcean() {
  audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.22, audioCtx.currentTime + 2.5);
  masterGain.connect(audioCtx.destination);

  // Layered noise waves — each is shaped pink noise filtered at different freqs
  [[320, 0, 4.8], [200, 1.2, 6.2], [140, 2.6, 3.9], [90, 0.7, 7.1]].forEach(([freq, delay, dur]) => {
    const buf  = audioCtx.createBuffer(1, audioCtx.sampleRate * dur, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
    for (let i = 0; i < data.length; i++) {
      // Paul Kellet pink noise algorithm
      const white = Math.random() * 2 - 1;
      b0 = 0.99886*b0 + white*0.0555179; b1 = 0.99332*b1 + white*0.0750759;
      b2 = 0.96900*b2 + white*0.1538520; b3 = 0.86650*b3 + white*0.3104856;
      b4 = 0.55000*b4 + white*0.5329522; b5 = -0.7616*b5 - white*0.0168980;
      const pink = (b0+b1+b2+b3+b4+b5+b6+white*0.5362) * 0.11;
      b6 = white * 0.115926;
      const t   = i / audioCtx.sampleRate;
      const env = Math.sin(Math.PI * t / dur);
      data[i]   = env * pink * 0.7;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = freq; filt.Q.value = 0.8;
    const g = audioCtx.createGain(); g.gain.value = 0.35 + Math.random() * 0.25;
    src.connect(filt); filt.connect(g); g.connect(masterGain);
    src.start(audioCtx.currentTime + delay);
  });

  // Deep low rumble (sub bass of ocean)
  const rumble = audioCtx.createOscillator();
  const rumbleG = audioCtx.createGain();
  rumble.type = 'sine'; rumble.frequency.value = 42;
  rumbleG.gain.value = 0.06;
  rumble.connect(rumbleG); rumbleG.connect(masterGain);
  rumble.start();

  // Seagulls
  function bird() {
    if (!audioPlaying) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const g   = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(2600 + Math.random()*600, t);
    osc.frequency.linearRampToValueAtTime(2200 + Math.random()*400, t + 0.18);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.04);
    g.gain.linearRampToValueAtTime(0, t + 0.28);
    osc.connect(g); g.connect(masterGain);
    osc.start(t); osc.stop(t + 0.32);
    // sometimes double chirp
    if (Math.random() > 0.6) {
      setTimeout(bird2, 350 + Math.random()*200);
    }
    setTimeout(bird, 4000 + Math.random()*9000);
  }
  function bird2() {
    if (!audioPlaying || !audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator(), g = audioCtx.createGain();
    osc.type = 'sine'; osc.frequency.value = 2800 + Math.random()*500;
    g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.03,t+0.03); g.gain.linearRampToValueAtTime(0,t+0.2);
    osc.connect(g); g.connect(masterGain); osc.start(t); osc.stop(t+0.25);
  }
  setTimeout(bird, 3500);
  audioPlaying = true;
}

function toggleAudio() {
  const btn = document.getElementById('audio-btn');
  if (!audioCtx) {
    buildOcean();
    btn.innerHTML = '🔊';
    btn.title = 'Silenciar';
  } else if (audioCtx.state === 'suspended') {
    audioCtx.resume();
    audioPlaying = true;
    btn.innerHTML = '🔊';
  } else {
    audioCtx.suspend();
    audioPlaying = false;
    btn.innerHTML = '🔇';
  }
}

/* ══ CURSOR ALGA SVG ══ */
const ALGA_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">
  <path d="M16,42 C16,42 8,34 6,26 C4,18 8,10 16,6 C24,10 28,18 26,26 C24,34 16,42 16,42Z"
    fill="#7FC7A6" opacity="0.9"/>
  <path d="M16,8 C16,8 10,14 10,22 C10,30 14,38 16,42"
    stroke="#1F4D3A" stroke-width="1.5" fill="none" stroke-linecap="round"/>
  <path d="M16,16 C13,14 9,15 8,18" stroke="#3E7F66" stroke-width="1" fill="none" stroke-linecap="round"/>
  <path d="M16,24 C19,22 23,23 24,26" stroke="#3E7F66" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>`;

const ALGA_URL = 'data:image/svg+xml;base64,' + btoa(ALGA_SVG);

// Inject cursor style
const curStyle = document.createElement('style');
curStyle.textContent = `
  body { cursor: url("${ALGA_URL}") 16 44, auto !important; }
  a, button, .bc, .tc, .perk, .ulva-card, .pc, .env-card, .feria-item, .next-item, .cc {
    cursor: url("${ALGA_URL}") 16 44, pointer !important;
  }
  #cur-dot { display:none; }
  #cur-ring {
    position:fixed; pointer-events:none; z-index:9999;
    width:48px; height:48px; border-radius:50%;
    border:2px solid rgba(127,199,166,.5);
    transform:translate(-50%,-50%);
    transition:width .25s,height .25s,opacity .25s;
    top:0;left:0;
  }
  body.hovering #cur-ring { width:64px; height:64px; opacity:.3; border-color:rgba(127,199,166,.8); }
`;
document.head.appendChild(curStyle);

// Ring follows mouse with lag
const ring = document.getElementById('cur-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
(function animRing(){
  rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
  ring.style.left=rx+'px'; ring.style.top=ry+'px';
  requestAnimationFrame(animRing);
})();
document.querySelectorAll('a,button,.bc,.tc,.perk,.ulva-card,.pc,.env-card,.feria-item,.next-item,.cc').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hovering'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hovering'));
});
document.addEventListener('mousedown',()=>{ ring.style.transform='translate(-50%,-50%) scale(.7)'; });
document.addEventListener('mouseup',  ()=>{ ring.style.transform='translate(-50%,-50%) scale(1)'; });

/* ══ NAV SCROLL ══ */
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const navLnk = document.getElementById('navLinks');
window.addEventListener('scroll',()=>nav.classList.toggle('up',scrollY>60),{passive:true});
burger.addEventListener('click',()=>{
  const o=navLnk.classList.toggle('open');
  const s=burger.querySelectorAll('span');
  s[0].style.transform=o?'rotate(45deg) translate(5px,5px)':'';
  s[1].style.opacity  =o?'0':'';
  s[2].style.transform=o?'rotate(-45deg) translate(5px,-5px)':'';
});
navLnk.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
  navLnk.classList.remove('open');
  burger.querySelectorAll('span').forEach(s=>{s.style.transform='';s.style.opacity='';});
}));

/* ══ PARALLAX BEACH ══ */
const heroBg = document.getElementById('hero-bg');
window.addEventListener('scroll',()=>{
  if(heroBg) heroBg.style.transform=`translateY(${scrollY*0.42}px) scale(1.08)`;
  const c = document.querySelector('.hero-left');
  if(c && scrollY<700) c.style.transform=`translateY(${scrollY*.055}px)`;
},{passive:true});

/* ══ TABS ══ */
function switchTab(id){
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  const panel=document.getElementById('panel-'+id);
  const btn  =document.querySelector(`[data-tab="${id}"]`);
  if(panel) panel.classList.add('active');
  if(btn){ btn.classList.add('active'); btn.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}); }
  document.querySelector('.tabs-nav-wrap').scrollIntoView({behavior:'smooth',block:'start'});
  setTimeout(()=>{ if(panel) panel.querySelectorAll('.rv:not(.in)').forEach(el=>io.observe(el)); },80);
  if(id==='ulva') setTimeout(runCounters,300);
}

/* ══ REVEAL ══ */
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }});
},{threshold:.08,rootMargin:'0px 0px -20px 0px'});
document.querySelectorAll('.rv').forEach(el=>io.observe(el));

/* ══ COUNTERS ══ */
function countUp(el,target,suffix,dur=1400){
  let start=null;
  const step=ts=>{
    if(!start)start=ts;
    const p=Math.min((ts-start)/dur,1);
    const ease=1-Math.pow(1-p,3);
    el.textContent=Math.floor(ease*parseFloat(target))+suffix;
    if(p<1)requestAnimationFrame(step);
    else el.textContent=target+suffix;
  };
  requestAnimationFrame(step);
}
function runCounters(){
  const c1=document.getElementById('cnt1');
  const c2=document.getElementById('cnt2');
  const c3=document.getElementById('cnt3');
  if(c1&&!c1.dataset.done){c1.dataset.done=1;countUp(c1,3,'x');}
  if(c2&&!c2.dataset.done){c2.dataset.done=1;countUp(c2,100,'%');}
  if(c3&&!c3.dataset.done){c3.dataset.done=1;countUp(c3,0,'');}
}
setTimeout(runCounters,1500);

/* ══ ORDER FORM → WHATSAPP ══ */
document.getElementById('orderForm').addEventListener('submit',e=>{
  e.preventDefault();
  const n  =document.getElementById('fn').value.trim();
  const t  =document.getElementById('ft').value.trim();
  const c  =document.getElementById('fc').value;
  const env=document.getElementById('fenv').value;
  const m  =document.getElementById('fm').value.trim();
  if(!n||!t){alert('Por favor completa tu nombre y celular.');return;}
  let msg=`Hola SEABAR! 🌿\n\nPedido:\n👤 ${n}\n📱 ${t}\n🛒 ${c}\n📦 ${env}`;
  if(m) msg+=`\n💬 ${m}`;
  window.open(`https://wa.me/51994928993?text=${encodeURIComponent(msg)}`,'_blank');
  const btn=e.target.querySelector('button[type=submit]');
  const orig=btn.innerHTML;
  btn.textContent='✅ ¡Enviado!'; btn.style.background='#25D366';
  setTimeout(()=>{btn.innerHTML=orig;btn.style.background='';e.target.reset();},3500);
});
