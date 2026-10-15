document.getElementById('y').textContent = new Date().getFullYear();
const header = document.querySelector('header'), wa = document.getElementById('wa');
const onScroll = () => {
  header.classList.toggle('scrolled', scrollY > 10);
  wa.classList.toggle('show', scrollY > innerHeight * .7);
};
addEventListener('scroll', onScroll, {passive:true}); onScroll();
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
}), {threshold:.1, rootMargin:'0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Stagger cards that sit side by side in a grid
document.querySelectorAll('.work, .budget').forEach(g =>
  [...g.children].forEach((c, i) => c.style.transitionDelay = (i % 3) * 90 + 'ms'));

const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const glow = document.querySelector('.glow');
const bar = document.querySelector('.progress');
const hero = document.querySelector('.hero .wrap');

// Cursor light eases toward the pointer; on touch it drifts slowly on its own
let tx = innerWidth * .7, ty = innerHeight * .3, x = tx, y = ty;
if (fine) {
  addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; glow.classList.add('on'); }, {passive:true});
  document.addEventListener('pointerleave', () => glow.classList.remove('on'));
} else {
  glow.classList.add('on');
}
const tick = t => {
  if (!fine) { tx = innerWidth * (.5 + .3 * Math.sin(t / 5200)); ty = innerHeight * (.4 + .25 * Math.cos(t / 6100)); }
  x += (tx - x) * .08; y += (ty - y) * .08;
  glow.style.transform = `translate3d(${x}px,${y}px,0)`;
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  if (scrollY < innerHeight) {
    hero.style.transform = `translate3d(0,${scrollY * .18}px,0)`;
    hero.style.opacity = 1 - scrollY / (innerHeight * 1.1);
  }
  requestAnimationFrame(tick);
};
if (!still) requestAnimationFrame(tick); else glow.classList.add('on');

// Last word of the hero title cycles through what a good site does
const words = [...document.querySelectorAll('.rotator > span')];
if (!still && words.length > 1) {
  let cur = 0;
  setInterval(() => {
    if (document.hidden) return;
    const prev = words[cur];
    cur = (cur + 1) % words.length;
    prev.classList.replace('on', 'out');
    words[cur].classList.remove('out');
    words[cur].classList.add('on');
    setTimeout(() => prev.classList.remove('out'), 900);
  }, 2200);
}

// Problem rows: light up the row nearest the middle of the screen as you scroll
const qa = document.querySelector('.qa');
if (qa) {
  const rows = [...qa.querySelectorAll('.q')];
  let ticking = false;
  const light = row => rows.forEach(r => r.classList.toggle('on', r === row));
  const update = () => {
    ticking = false;
    const r = qa.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const mid = innerHeight / 2;
    let best = rows[0], dist = Infinity;
    for (const row of rows) {
      const b = row.getBoundingClientRect(), d = Math.abs(b.top + b.height / 2 - mid);
      if (d < dist) { dist = d; best = row; }
    }
    light(best);
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, {passive:true});
  qa.classList.add('live');
  update();
}

// Statement: map scroll through the tall section to a 0..1 reveal, eased like a spring
const statement = document.querySelector('.statement');
if (statement && !still) {
  const words = [...statement.querySelectorAll('.w')];
  const START = .08, END = .92, step = (END - START) / words.length;
  let smooth = 0, raf = 0, active = false;
  const frame = () => {
    const r = statement.getBoundingClientRect();
    const target = Math.min(Math.max(-r.top / (r.height - innerHeight), 0), 1);
    smooth += (target - smooth) * .16;
    words.forEach((w, i) => w.style.setProperty('--p', Math.min(Math.max((smooth - START) / step - i, 0), 1).toFixed(3)));
    raf = active || Math.abs(target - smooth) > .001 ? requestAnimationFrame(frame) : 0;
  };
  new IntersectionObserver(([e]) => { active = e.isIntersecting; if (active && !raf) raf = requestAnimationFrame(frame); }).observe(statement);
}

// Budget wireframe: blocks glide between three site layouts
const morph = document.querySelector('.morph');
if (morph) {
  // [left, top, width, height] in % of the stage, plus the block's look
  const L = [
    [ // clinic: hero photo + text, three service cards
      [0,0,100,8,'nav'],[0,14,48,46,'img'],[54,17,42,7,'strong'],[54,29,44,4,'line'],[54,36,34,4,'line'],
      [54,47,22,8,'btn'],[0,68,31.3,32,'card'],[34.3,68,31.3,32,'card'],[68.7,68,31.3,32,'card'],[78,47,18,8,'ghost',0]],
    [ // news portal: featured story + headline list
      [0,0,100,8,'nav'],[0,14,63,50,'img'],[0,69,58,6,'strong'],[0,79,63,4,'line'],[0,86,44,4,'line'],
      [68,14,32,19,'card'],[68,37,32,19,'card'],[68,60,32,19,'card'],[68,83,32,17,'card'],[30,86,0,4,'line',0]],
    [ // startup: centered pitch, two buttons, big product shot
      [0,0,100,8,'nav'],[12,58,76,42,'img'],[18,15,64,8,'strong'],[26,27,48,4,'line'],[33,34,34,4,'line'],
      [27,44,21,8,'btn'],[50,79,0,0,'card',0],[50,79,0,0,'card',0],[50,79,0,0,'card',0],[52,44,21,8,'ghost']],
  ];
  const blocks = [...morph.querySelectorAll('.mstage .b')];
  const btns = [...morph.querySelectorAll('.mdots button')];
  const frame = morph.querySelector('.mframe');
  let cur = 0, timer = 0, seen = false;
  const show = n => {
    cur = (n + L.length) % L.length;
    L[cur].forEach(([x, y, w, h, k, o = 1], i) => {
      const b = blocks[i];
      Object.assign(b.style, { left: x + '%', top: y + '%', width: w + '%', height: h + '%', opacity: o, transitionDelay: i * 35 + 'ms' });
      b.className = 'b k-' + k;
    });
    btns.forEach((btn, i) => btn.setAttribute('aria-pressed', i === cur));
  };
  const auto = () => { clearInterval(timer); if (!still && seen) timer = setInterval(() => !document.hidden && show(cur + 1), 3600); };
  btns.forEach((btn, i) => btn.addEventListener('click', () => { show(i); auto(); }));
  frame.addEventListener('click', () => { show(cur + 1); auto(); });
  if (fine && !still) {
    frame.addEventListener('pointermove', e => {
      const r = frame.getBoundingClientRect();
      frame.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 10 + 'deg');
      frame.style.setProperty('--rx', ((e.clientY - r.top) / r.height - .5) * -10 + 'deg');
    }, {passive:true});
    frame.addEventListener('pointerleave', () => { frame.style.setProperty('--rx', '0deg'); frame.style.setProperty('--ry', '0deg'); });
  }
  new IntersectionObserver(([e]) => { if (e.isIntersecting !== seen) { seen = e.isIntersecting; auto(); } }, {threshold:.3}).observe(morph);
  show(0);
}

// Per-card highlight position
if (fine) document.querySelectorAll('.card').forEach(c =>
  c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', e.clientX - r.left + 'px');
    c.style.setProperty('--my', e.clientY - r.top + 'px');
  }, {passive:true}));
