// intro.js — "What is Microsoft Foundry?" walkthrough overlay.

const slides = [
  {
    title: 'What is Microsoft Foundry?',
    caption: 'Microsoft Foundry (formerly Azure AI Studio) is a unified platform for building, evaluating, and deploying AI applications — from simple prompts to complex multi-agent systems.',
    visual: 'platform'
  },
  {
    title: 'The AI Stack',
    caption: 'Modern AI applications are built in layers: Models at the bottom (GPT-4o, Llama, Phi), then retrieval systems (RAG), then orchestration (Agents), then evaluation & safety, and finally deployment & monitoring at the top.',
    visual: 'stack'
  },
  {
    title: 'Why a Platform?',
    caption: 'Moving from a notebook prototype to a production AI app requires model management, prompt versioning, evaluation pipelines, tracing, RBAC, scaling, and monitoring. Foundry handles all of this in one place.',
    visual: 'gap'
  },
  {
    title: 'Your Learning Journey',
    caption: 'Foundry Quest takes you from AI fundamentals (embeddings, RAG, agents) all the way to deploying production-grade AI systems on Microsoft Foundry. Each level builds on the last — no prior AI experience needed.',
    visual: 'journey'
  }
];

let currentSlide = 0;
let onFinishCb = null;

function renderVisual(container, type) {
  const colors = { accent: '#2ee6c8', accent2: '#ffb454', accent3: '#5b95ff', bg: '#05070a', border: '#253039' };
  
  if (type === 'platform') {
    container.innerHTML = `<svg viewBox="0 0 400 300" style="width:100%;height:100%">
      <rect x="80" y="120" width="240" height="60" rx="4" fill="none" stroke="${colors.accent}" stroke-width="2"/>
      <text x="200" y="155" text-anchor="middle" fill="${colors.accent}" font-family="IBM Plex Mono" font-size="14" font-weight="700">MICROSOFT FOUNDRY</text>
      <g opacity="0.7">
        <rect x="90" y="60" width="65" height="40" rx="3" fill="none" stroke="${colors.accent2}" stroke-width="1.5"/>
        <text x="122" y="84" text-anchor="middle" fill="${colors.accent2}" font-family="IBM Plex Mono" font-size="9">MODELS</text>
        <rect x="167" y="60" width="65" height="40" rx="3" fill="none" stroke="${colors.accent3}" stroke-width="1.5"/>
        <text x="200" y="84" text-anchor="middle" fill="${colors.accent3}" font-family="IBM Plex Mono" font-size="9">AGENTS</text>
        <rect x="245" y="60" width="65" height="40" rx="3" fill="none" stroke="${colors.accent}" stroke-width="1.5"/>
        <text x="277" y="84" text-anchor="middle" fill="${colors.accent}" font-family="IBM Plex Mono" font-size="9">EVAL</text>
      </g>
      <g opacity="0.7">
        <rect x="110" y="200" width="80" height="35" rx="3" fill="none" stroke="${colors.accent2}" stroke-width="1.5"/>
        <text x="150" y="222" text-anchor="middle" fill="${colors.accent2}" font-family="IBM Plex Mono" font-size="9">DEPLOY</text>
        <rect x="210" y="200" width="80" height="35" rx="3" fill="none" stroke="${colors.accent3}" stroke-width="1.5"/>
        <text x="250" y="222" text-anchor="middle" fill="${colors.accent3}" font-family="IBM Plex Mono" font-size="9">MONITOR</text>
      </g>
      <line x1="122" y1="100" x2="150" y2="120" stroke="${colors.border}" stroke-width="1"/>
      <line x1="200" y1="100" x2="200" y2="120" stroke="${colors.border}" stroke-width="1"/>
      <line x1="277" y1="100" x2="250" y2="120" stroke="${colors.border}" stroke-width="1"/>
      <line x1="150" y1="180" x2="150" y2="200" stroke="${colors.border}" stroke-width="1"/>
      <line x1="250" y1="180" x2="250" y2="200" stroke="${colors.border}" stroke-width="1"/>
    </svg>`;
  } else if (type === 'stack') {
    const layers = ['Monitoring & Ops', 'Evaluation & Safety', 'Agent Orchestration', 'RAG & Retrieval', 'Foundation Models'];
    container.innerHTML = `<svg viewBox="0 0 400 300" style="width:100%;height:100%">
      ${layers.map((l, i) => `
        <rect x="60" y="${40 + i * 50}" width="280" height="40" rx="3" fill="rgba(46,230,200,${0.05 + i * 0.03})" stroke="${colors.accent}" stroke-width="1.5" opacity="${0.5 + i * 0.12}"/>
        <text x="200" y="${65 + i * 50}" text-anchor="middle" fill="${colors.accent}" font-family="IBM Plex Mono" font-size="11" font-weight="600">${l}</text>
      `).join('')}
    </svg>`;
  } else if (type === 'gap') {
    container.innerHTML = `<svg viewBox="0 0 400 300" style="width:100%;height:100%">
      <rect x="40" y="100" width="120" height="100" rx="4" fill="none" stroke="${colors.accent2}" stroke-width="2"/>
      <text x="100" y="145" text-anchor="middle" fill="${colors.accent2}" font-family="IBM Plex Mono" font-size="11" font-weight="600">NOTEBOOK</text>
      <text x="100" y="165" text-anchor="middle" fill="#5b6c74" font-family="IBM Plex Mono" font-size="9">Prototype</text>
      <rect x="240" y="100" width="120" height="100" rx="4" fill="none" stroke="${colors.accent}" stroke-width="2"/>
      <text x="300" y="145" text-anchor="middle" fill="${colors.accent}" font-family="IBM Plex Mono" font-size="11" font-weight="600">PRODUCTION</text>
      <text x="300" y="165" text-anchor="middle" fill="#5b6c74" font-family="IBM Plex Mono" font-size="9">Scale & Safety</text>
      <line x1="160" y1="150" x2="240" y2="150" stroke="${colors.border}" stroke-width="2" stroke-dasharray="6 4"/>
      <text x="200" y="140" text-anchor="middle" fill="${colors.accent3}" font-family="IBM Plex Mono" font-size="10" font-weight="700">THE GAP</text>
      <text x="200" y="220" text-anchor="middle" fill="#5b6c74" font-family="IBM Plex Mono" font-size="9">Versioning • Evaluation • RBAC • Tracing • Scaling</text>
    </svg>`;
  } else {
    container.innerHTML = `<svg viewBox="0 0 400 300" style="width:100%;height:100%">
      <line x1="50" y1="150" x2="350" y2="150" stroke="${colors.border}" stroke-width="2"/>
      ${['AI Basics', 'Embeddings', 'RAG', 'Agents', 'Foundry', 'Deploy'].map((l, i) => `
        <circle cx="${50 + i * 60}" cy="150" r="8" fill="${i < 4 ? colors.accent : colors.accent3}" stroke="none"/>
        <text x="${50 + i * 60}" y="175" text-anchor="middle" fill="${colors.accent}" font-family="IBM Plex Mono" font-size="8" font-weight="600">${l}</text>
      `).join('')}
      <text x="200" y="250" text-anchor="middle" fill="#5b6c74" font-family="IBM Plex Mono" font-size="10">16 levels • 3 worlds • Interactive quizzes & visualizations</text>
    </svg>`;
  }
}

function render() {
  const slide = slides[currentSlide];
  document.getElementById('intro-title').textContent = slide.title;
  document.getElementById('intro-caption').textContent = slide.caption;
  renderVisual(document.getElementById('intro-visual'), slide.visual);
  
  const dots = document.getElementById('intro-dots');
  dots.innerHTML = slides.map((_, i) => `<span class="intro-dot${i === currentSlide ? ' active' : ''}"></span>`).join('');
  
  document.getElementById('intro-prev').style.visibility = currentSlide === 0 ? 'hidden' : 'visible';
  document.getElementById('intro-next').textContent = currentSlide === slides.length - 1 ? 'Start Quest →' : 'Next →';
}

function close() {
  document.getElementById('intro-overlay').hidden = true;
  if (onFinishCb) onFinishCb();
}

export function openIntro() {
  currentSlide = 0;
  document.getElementById('intro-overlay').hidden = false;
  render();
}

export function initIntro({ onFinish }) {
  onFinishCb = onFinish;
  document.getElementById('intro-skip').addEventListener('click', close);
  document.getElementById('intro-prev').addEventListener('click', () => {
    if (currentSlide > 0) { currentSlide--; render(); }
  });
  document.getElementById('intro-next').addEventListener('click', () => {
    if (currentSlide < slides.length - 1) { currentSlide++; render(); }
    else close();
  });
}
