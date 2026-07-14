// main.js — app shell: navigation, level map rendering, progress display, level mounting.
import * as progress from './progress.js';
import { animateCount, animateCountTargets } from './ui-utils.js';
import { openIntro, initIntro } from './intro.js';
import { sfx, isMuted, toggleMuted } from './sound.js';
import { burstConfetti } from './confetti.js';
import { init as initBgConstellation, start as startBgConstellation, stop as stopBgConstellation } from './bg-constellation.js';
import { downloadShareCard } from './share-card.js';

const TOTAL_LEVELS = 13; // core levels (non-bonus)

const levelMeta = [
  // World 1: AI Foundations
  { num: 1, id: 'level-1', title: 'The AI Revolution', desc: 'From rule-based systems to autonomous agents — a timeline of breakthroughs.', world: 'ai' },
  { num: 2, id: 'level-2', title: 'How Machines Learn', desc: 'Supervised, unsupervised, reinforcement learning — features, training & inference.', world: 'ai' },
  { num: 3, id: 'level-3', title: 'Neural Networks & Deep Learning', desc: 'Perceptrons, layers, backpropagation, CNNs, RNNs, and the deep learning revolution.', world: 'ai' },
  { num: 4, id: 'level-4', title: 'Transformers & LLMs', desc: 'Self-attention, positional encoding, GPT, scaling laws & emergent abilities.', world: 'ai' },
  { num: 5, id: 'level-5', title: 'Embeddings & Vector Space', desc: 'How text becomes numbers — cosine similarity, vector DBs & nearest neighbors.', world: 'ai' },
  { num: 6, id: 'level-6', title: 'RAG: Retrieval-Augmented Generation', desc: 'Chunking, embedding, retrieval, reranking & the full RAG pipeline.', world: 'ai' },
  { num: 7, id: 'level-7', title: 'Graph RAG & Knowledge Graphs', desc: 'Entities, relationships, multi-hop reasoning & hybrid vector+graph retrieval.', world: 'ai' },
  { num: 8, id: 'level-8', title: 'Prompt Engineering & AI Agents', desc: 'System prompts, chain-of-thought, function calling, ReAct & multi-agent systems.', world: 'ai' },
  // Bridge
  { num: 9, id: 'level-9', title: 'From Notebook to Production', desc: 'The gap between prototype and production — why platforms matter.', world: 'bridge' },
  // World 2: Microsoft Foundry
  { num: 10, id: 'level-10', title: 'Microsoft Foundry: The Platform', desc: 'Projects, AI Services, model catalog, connections & the Foundry playground.', world: 'foundry' },
  { num: 11, id: 'level-11', title: 'Building Agents in Foundry', desc: 'Agent Service, tools, knowledge, code-first vs declarative agents.', world: 'foundry' },
  { num: 12, id: 'level-12', title: 'Evaluate, Trace & Optimize', desc: 'Tracing, built-in evaluators, batch eval, continuous eval & prompt optimization.', world: 'foundry' },
  { num: 13, id: 'level-13', title: 'Deploy, Scale & Monitor', desc: 'azd, Bicep, RBAC, managed endpoints, CI/CD & production monitoring.', world: 'foundry' },
  // Bonus levels
  { num: 14, id: 'level-14', title: 'Live AI Playground', desc: 'Interactive prompt, RAG & agent sandbox — simulated or with your own API key.', bonus: true },
  { num: 15, id: 'level-15', title: 'Architecture Patterns', desc: 'Visual decision trees: RAG vs GraphRAG vs Agents vs Fine-tuning.', bonus: true },
  { num: 16, id: 'level-16', title: 'Enterprise AI Case Studies', desc: 'How Microsoft, OpenAI, Google & Meta deploy AI at scale.', bonus: true },
];

const levelLoaders = {
  1: () => import('./levels/level1-timeline.js'),
  2: () => import('./levels/level2-ml-fundamentals.js'),
  3: () => import('./levels/level3-neural-networks.js'),
  4: () => import('./levels/level4-transformers.js'),
  5: () => import('./levels/level5-embeddings.js'),
  6: () => import('./levels/level6-rag.js'),
  7: () => import('./levels/level7-graphrag.js'),
  8: () => import('./levels/level8-agents.js'),
  9: () => import('./levels/level9-bridge.js'),
  10: () => import('./levels/level10-foundry.js'),
  11: () => import('./levels/level11-foundry-agents.js'),
  12: () => import('./levels/level12-eval.js'),
  13: () => import('./levels/level13-deploy.js'),
  14: () => import('./levels/level14-playground.js'),
  15: () => import('./levels/level15-patterns.js'),
  16: () => import('./levels/level16-enterprise.js'),
};

const screens = { landing: document.getElementById('screen-landing'), map: document.getElementById('screen-map') };
for (let i = 1; i <= 16; i++) screens[`level-${i}`] = document.getElementById(`screen-level-${i}`);

function showScreen(name) {
  Object.values(screens).forEach(s => s && s.classList.remove('active'));
  if (screens[name]) screens[name].classList.add('active');
  document.getElementById('topbar-stats').hidden = name === 'landing';
  if (name === 'landing') startBgConstellation(); else stopBgConstellation();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function navTo(name) {
  if (name === 'map') renderMap();
  showScreen(name);
}

// Navigation
document.querySelectorAll('[data-nav]').forEach(el => el.addEventListener('click', () => navTo(el.dataset.nav)));
document.getElementById('btn-start').addEventListener('click', () => navTo('map'));
document.getElementById('btn-map').addEventListener('click', () => navTo('map'));
document.getElementById('btn-intro').addEventListener('click', () => openIntro());
document.getElementById('btn-reset').addEventListener('click', () => {
  if (confirm('Reset all progress, scores, and badges? This cannot be undone.')) {
    progress.resetProgress();
    updateTopbar();
    renderMap();
    showToast('Progress reset.');
  }
});

// Mute toggle
const muteBtn = document.getElementById('btn-mute');
function updateMuteBtn() {
  muteBtn.textContent = isMuted() ? 'Sound: Off' : 'Sound: On';
  muteBtn.setAttribute('aria-pressed', String(isMuted()));
}
muteBtn.addEventListener('click', () => { toggleMuted(); updateMuteBtn(); });
updateMuteBtn();

// World tab filtering
let activeWorld = 'all';
document.getElementById('world-tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.world-tab');
  if (!tab) return;
  activeWorld = tab.dataset.world;
  document.querySelectorAll('.world-tab').forEach(t => t.classList.toggle('active', t === tab));
  renderMap();
});

let lastKnownScore = 0;
function updateTopbar() {
  const scoreEl = document.getElementById('stat-score');
  const newScore = progress.totalScore();
  if (newScore !== lastKnownScore) {
    animateCount(scoreEl, newScore, { from: lastKnownScore, duration: 700 });
    lastKnownScore = newScore;
  } else {
    scoreEl.textContent = newScore;
  }
  document.getElementById('stat-badges').textContent = progress.getBadges().length;
}

function renderMap() {
  const grid = document.getElementById('level-grid');
  grid.innerHTML = '';

  const filtered = levelMeta.filter(meta => {
    if (activeWorld === 'all') return true;
    if (activeWorld === 'bonus') return meta.bonus;
    return meta.world === activeWorld && !meta.bonus;
  });

  filtered.forEach((meta, i) => {
    const unlocked = meta.bonus ? true : progress.isUnlocked(meta.num);
    const completed = progress.isCompleted(meta.num);
    const score = progress.getScore(meta.num);
    const card = document.createElement('div');
    let cardClass = 'level-card';
    if (!unlocked) cardClass += ' locked';
    if (meta.bonus) cardClass += ' bonus-card';
    else if (meta.world === 'bridge') cardClass += ' bridge-card';
    else if (meta.world === 'foundry') cardClass += ' foundry-card';
    card.className = cardClass;
    card.style.animationDelay = `${i * 70}ms`;
    card.innerHTML = `
      ${meta.bonus ? '<span class="lv-num bonus-tag">Bonus</span>' : `<span class="lv-num">${meta.world === 'bridge' ? 'Bridge' : `Level ${meta.num}`}</span>`}
      <h3>${meta.title}</h3>
      <p>${meta.desc}</p>
      <div class="lv-status">
        <span>${meta.bonus ? (completed ? 'Explored' : 'Explore anytime') : (completed ? 'Completed' : (unlocked ? 'Ready to play' : 'Locked'))}</span>
        ${completed && !meta.bonus ? `<span class="lv-score">${score}%</span>` : ''}
      </div>
    `;
    if (unlocked) card.addEventListener('click', () => openLevel(meta.num));
    grid.appendChild(card);
  });

  // Badge shelf
  const badgeShelf = document.getElementById('badge-shelf');
  const badges = progress.getBadges();
  badgeShelf.innerHTML = badges.length
    ? badges.map((b, i) => `<span class="badge-chip badge-pop" style="animation-delay:${i * 60}ms">${b.name}</span>`).join('')
    : '<span style="color:var(--text-2)">No badges yet — complete levels to earn them!</span>';

  renderProgressRail();
  renderAchievementsRow();
  updateTopbar();
}

function renderProgressRail() {
  const rail = document.getElementById('progress-rail');
  if (!rail) return;
  const core = levelMeta.filter(m => !m.bonus);
  rail.innerHTML = core.map((m, i) => {
    const completed = progress.isCompleted(m.num);
    const unlocked = progress.isUnlocked(m.num);
    const state = completed ? 'done' : (unlocked ? 'active' : 'locked');
    const seg = i > 0 ? `<span class="rail-seg ${progress.isCompleted(core[i - 1].num) ? 'seg-filled' : ''}"></span>` : '';
    return `${seg}<span class="rail-node ${state}" title="${m.title}">${completed ? '✓' : m.num}</span>`;
  }).join('');
}

function renderAchievementsRow() {
  const row = document.getElementById('achievements-row');
  if (!row) return;
  row.innerHTML = `<button class="btn btn-ghost" id="btn-share-card">Share Score Card</button>`;
  row.querySelector('#btn-share-card').addEventListener('click', () => downloadShareCard());
}

// Level mounting
const mountedLevels = new Set();
const mountedModules = {};
const levelStartTimes = {};
const levelHintsUsed = {};
const ALL_LEVEL_NUMS = levelMeta.map(m => m.num);
const CORE_LEVEL_NUMS = levelMeta.filter(m => !m.bonus).map(m => m.num);

function resetAttempt(num) {
  levelStartTimes[num] = Date.now();
  levelHintsUsed[num] = 0;
}

function attachLevelDelegation(body, num) {
  if (body.dataset.delegated === '1') return;
  body.dataset.delegated = '1';
  body.addEventListener('click', (e) => {
    const quizOpt = e.target.closest('.quiz-opt');
    if (quizOpt) {
      if (quizOpt.classList.contains('correct')) sfx.correct();
      else if (quizOpt.classList.contains('wrong')) sfx.wrong();
      return;
    }
    const hintBtn = e.target.closest('.hint-btn');
    if (hintBtn) { levelHintsUsed[num] = (levelHintsUsed[num] || 0) + 1; sfx.hint(); return; }
  });
}

function computeMetaBadges({ score, elapsedMs, hintsUsed }) {
  const earned = [];
  const tryAward = (id, name) => { if (progress.addBadge(id, name)) earned.push({ name }); };
  if (hintsUsed === 0 && score >= 90) tryAward('sharp-mind', 'Sharp Mind');
  if (elapsedMs !== null && elapsedMs < 60000 && score >= 70) tryAward('speedrunner', 'Speedrunner');
  if (CORE_LEVEL_NUMS.every(n => progress.getScore(n) === 100)) tryAward('perfectionist', 'Perfectionist');
  if (ALL_LEVEL_NUMS.every(n => progress.isCompleted(n))) tryAward('completionist', 'Completionist');
  return earned;
}

function buildApi(num) {
  return {
    complete: (score, meta) => {
      const elapsedMs = levelStartTimes[num] ? Date.now() - levelStartTimes[num] : null;
      const hintsUsed = levelHintsUsed[num] || 0;
      progress.completeLevel(num, score, TOTAL_LEVELS);
      sfx.levelComplete();
      burstConfetti({ gold: score >= 90 });
      const metaBadges = computeMetaBadges({ score, elapsedMs, hintsUsed });
      metaBadges.forEach(b => showToast(`Badge earned: ${b.name}`));
      updateTopbar();
      showToast(`Level ${num} complete! Score: ${Math.round(score)}/100`);
      showResults(num, score, meta || {}, metaBadges);
    },
    badge: (id, name) => {
      const added = progress.addBadge(id, name);
      if (added) { showToast(`Badge earned: ${name}`); sfx.badge(); }
      updateTopbar();
      return added;
    }
  };
}

async function openLevel(num) {
  const body = document.getElementById(`level-${num}-body`);
  const bar = document.getElementById(`level-${num}-next`);
  showScreen(`level-${num}`);
  if (!mountedLevels.has(num)) {
    body.hidden = false;
    bar.hidden = true;
    bar.innerHTML = '';
    body.innerHTML = '<p style="color:var(--text-2)">Loading…</p>';
    try {
      const mod = await levelLoaders[num]();
      body.innerHTML = '';
      resetAttempt(num);
      attachLevelDelegation(body, num);
      mod.mount(body, buildApi(num));
      mountedLevels.add(num);
      mountedModules[num] = mod;
    } catch (err) {
      console.error('Failed to load level', num, err);
      body.innerHTML = `<p style="color:var(--danger)">Failed to load this level. Please refresh and try again.</p>`;
    }
  }
}

function replay(num) {
  const body = document.getElementById(`level-${num}-body`);
  const bar = document.getElementById(`level-${num}-next`);
  const mod = mountedModules[num];
  if (!mod) return;
  bar.hidden = true;
  bar.innerHTML = '';
  body.hidden = false;
  body.innerHTML = '';
  resetAttempt(num);
  attachLevelDelegation(body, num);
  mod.mount(body, buildApi(num));
}

function showResults(num, score, meta, extraBadges) {
  const body = document.getElementById(`level-${num}-body`);
  const bar = document.getElementById(`level-${num}-next`);
  if (!bar) return;
  body.hidden = true;

  const isLastGraded = num >= TOTAL_LEVELS;
  const nextMeta = levelMeta.find(m => m.num === num + 1 && !m.bonus);
  const heading = meta.heading || 'Level complete';
  const detail = meta.detail || '';

  const allBadges = [...(meta.badge ? [meta.badge] : []), ...(extraBadges || [])];
  const badgeHtml = allBadges.length
    ? `<div class="results-badge-row">${allBadges.map(b => `<span class="badge-chip badge-pop">${b.name} earned!</span>`).join('')}</div>`
    : '';

  const recapHtml = (meta.recap && meta.recap.length)
    ? `<div class="results-recap">${meta.recap.map(r => `<div class="rc-item"><h4>${r.title}</h4><p>${r.body}</p></div>`).join('')}</div>`
    : '';

  let nextButtonsHtml = '';
  if (!isLastGraded && nextMeta) {
    nextButtonsHtml = `<button class="btn btn-primary" id="btn-goto-next">Start: ${nextMeta.title} →</button>`;
  } else if (num === TOTAL_LEVELS) {
    nextButtonsHtml = levelMeta
      .filter(m => m.bonus)
      .map(b => `<button class="btn btn-primary" data-bonus-num="${b.num}">Try: ${b.title} →</button>`)
      .join('');
  }

  bar.hidden = false;
  bar.classList.remove('pop-in');
  bar.innerHTML = `
    <div class="results-panel">
      <span class="tag-label">// Level ${num} — Results</span>
      <div class="results-score-row">
        <div>
          <h3>${heading}</h3>
          <p class="results-detail">${detail}</p>
        </div>
        <div class="results-score"><span class="count-target" data-target="${Math.max(0, Math.min(100, Math.round(score)))}">0</span><span class="results-score-max">/100</span></div>
      </div>
      ${badgeHtml}
      ${recapHtml}
      <div class="results-actions">
        <button class="btn btn-ghost" id="btn-replay">↺ Replay Level</button>
        ${nextButtonsHtml}
        <button class="btn btn-ghost" id="btn-goto-map">Level Map</button>
      </div>
    </div>
  `;
  animateCountTargets(bar);
  void bar.offsetWidth;
  bar.classList.add('pop-in');

  const nextBtn = bar.querySelector('#btn-goto-next');
  if (nextBtn) nextBtn.addEventListener('click', () => openLevel(num + 1));
  const bonusBtns = bar.querySelectorAll('[data-bonus-num]');
  bonusBtns.forEach(btn => btn.addEventListener('click', () => openLevel(Number(btn.dataset.bonusNum))));
  bar.querySelector('#btn-replay').addEventListener('click', () => replay(num));
  bar.querySelector('#btn-goto-map').addEventListener('click', () => navTo('map'));
  bar.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('show');
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// Boot
lastKnownScore = progress.totalScore();
updateTopbar();
initIntro({ onFinish: () => navTo('map') });
initBgConstellation(document.getElementById('landing-bg-canvas'));
if (screens.landing && screens.landing.classList.contains('active')) startBgConstellation();
