// ui-utils.js — Shared animated count-up helper for scores.

export function animateCount(el, target, { from = 0, duration = 700 } = {}) {
  const start = performance.now();
  const diff = target - from;
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + diff * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

export function animateCountTargets(container) {
  container.querySelectorAll('.count-target').forEach(el => {
    const target = parseInt(el.dataset.target, 10) || 0;
    animateCount(el, target, { from: 0, duration: 900 });
  });
}
