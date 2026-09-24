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
document.querySelectorAll('.qa, .work, .budget').forEach(g =>
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

// Per-card highlight position
if (fine) document.querySelectorAll('.card').forEach(c =>
  c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', e.clientX - r.left + 'px');
    c.style.setProperty('--my', e.clientY - r.top + 'px');
  }, {passive:true}));
