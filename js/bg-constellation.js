// bg-constellation.js — Animated drifting node/edge background for the landing screen.

let canvas, ctx, nodes, edges, animId, running = false;

export function init(el) {
  canvas = el;
  if (!canvas) return;
  resize();
  window.addEventListener('resize', resize);
  createNodes();
}

function resize() {
  if (!canvas) return;
  canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
  canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
}

function createNodes() {
  const count = 60;
  nodes = Array.from({ length: count }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.0004,
    vy: (Math.random() - 0.5) * 0.0004,
    r: Math.random() * 2 + 1.5
  }));
}

function draw() {
  if (!ctx || !canvas) return;
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Update positions
  for (const n of nodes) {
    n.x += n.vx;
    n.y += n.vy;
    if (n.x < 0 || n.x > 1) n.vx *= -1;
    if (n.y < 0 || n.y > 1) n.vy *= -1;
  }

  // Draw edges
  const maxDist = 0.15;
  ctx.strokeStyle = 'rgba(46, 230, 200, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        ctx.globalAlpha = 1 - dist / maxDist;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x * w, nodes[i].y * h);
        ctx.lineTo(nodes[j].x * w, nodes[j].y * h);
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  ctx.globalAlpha = 1;
  for (const n of nodes) {
    ctx.fillStyle = 'rgba(46, 230, 200, 0.35)';
    ctx.beginPath();
    ctx.arc(n.x * w, n.y * h, n.r * (window.devicePixelRatio || 1), 0, Math.PI * 2);
    ctx.fill();
  }

  if (running) animId = requestAnimationFrame(draw);
}

export function start() {
  if (running) return;
  running = true;
  ctx = canvas?.getContext('2d');
  if (ctx) draw();
}

export function stop() {
  running = false;
  if (animId) cancelAnimationFrame(animId);
}
