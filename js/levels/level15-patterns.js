// level15-patterns.js — Architecture Patterns (interactive visual diagrams + decision wizard)

const patterns = [
  {
    id: 'rag',
    title: 'Simple RAG',
    when: 'Single knowledge base, straightforward Q&A, document lookup',
    pros: ['Simple to implement', 'Low latency', 'Easy to debug', 'Works for most use cases'],
    cons: ['Struggles with multi-hop questions', 'Can\'t synthesize across many docs', 'Quality depends on chunking'],
    useCase: 'Customer support bot answering from product docs',
    nodes: [
      { id: 'user', label: 'User', x: 50, y: 150, color: '#5b95ff' },
      { id: 'embed', label: 'Embed\nQuery', x: 160, y: 150, color: '#ffb454' },
      { id: 'vecdb', label: 'Vector\nDB', x: 270, y: 80, color: '#2ee6c8' },
      { id: 'chunks', label: 'Top-K\nChunks', x: 380, y: 80, color: '#2ee6c8' },
      { id: 'llm', label: 'LLM', x: 380, y: 220, color: '#ffb454' },
      { id: 'answer', label: 'Answer', x: 490, y: 150, color: '#35d488' },
    ],
    edges: [
      { from: 'user', to: 'embed' }, { from: 'embed', to: 'vecdb' },
      { from: 'vecdb', to: 'chunks' }, { from: 'chunks', to: 'llm' },
      { from: 'user', to: 'llm', label: 'query' }, { from: 'llm', to: 'answer' }
    ]
  },
  {
    id: 'graphrag',
    title: 'Graph RAG',
    when: 'Highly connected data, multi-hop reasoning, global summarization',
    pros: ['Handles relationship questions', 'Global summaries', 'Explainable paths', 'Multi-hop capable'],
    cons: ['Complex to build', 'Higher latency', 'Entity extraction errors', 'More expensive'],
    useCase: 'Research assistant navigating scientific papers and citations',
    nodes: [
      { id: 'user', label: 'User', x: 50, y: 150, color: '#5b95ff' },
      { id: 'entities', label: 'Entity\nExtract', x: 160, y: 80, color: '#b478ff' },
      { id: 'graph', label: 'Knowledge\nGraph', x: 280, y: 80, color: '#2ee6c8' },
      { id: 'community', label: 'Community\nSummary', x: 400, y: 80, color: '#2ee6c8' },
      { id: 'vector', label: 'Vector\nSearch', x: 160, y: 220, color: '#ffb454' },
      { id: 'llm', label: 'LLM', x: 400, y: 220, color: '#ffb454' },
      { id: 'answer', label: 'Answer', x: 500, y: 150, color: '#35d488' },
    ],
    edges: [
      { from: 'user', to: 'entities' }, { from: 'entities', to: 'graph' },
      { from: 'graph', to: 'community' }, { from: 'user', to: 'vector' },
      { from: 'vector', to: 'llm' }, { from: 'community', to: 'llm' },
      { from: 'llm', to: 'answer' }
    ]
  },
  {
    id: 'agent',
    title: 'Single Agent + Tools',
    when: 'Multi-step tasks, dynamic decisions, external API calls',
    pros: ['Flexible', 'Composes actions', 'Self-correcting', 'Handles diverse tasks'],
    cons: ['Unpredictable behavior', 'Can loop', 'Needs guardrails', 'Higher latency'],
    useCase: 'Assistant that books meetings, sends emails, queries databases',
    nodes: [
      { id: 'user', label: 'User', x: 50, y: 150, color: '#5b95ff' },
      { id: 'agent', label: 'Agent\n(LLM)', x: 200, y: 150, color: '#b478ff' },
      { id: 'tool1', label: 'Search\nAPI', x: 370, y: 60, color: '#ffb454' },
      { id: 'tool2', label: 'Database', x: 370, y: 150, color: '#ffb454' },
      { id: 'tool3', label: 'Email\nAPI', x: 370, y: 240, color: '#ffb454' },
      { id: 'answer', label: 'Result', x: 490, y: 150, color: '#35d488' },
    ],
    edges: [
      { from: 'user', to: 'agent' },
      { from: 'agent', to: 'tool1', label: 'call' }, { from: 'tool1', to: 'agent', label: 'result' },
      { from: 'agent', to: 'tool2', label: 'call' }, { from: 'tool2', to: 'agent', label: 'result' },
      { from: 'agent', to: 'tool3', label: 'call' }, { from: 'tool3', to: 'agent', label: 'result' },
      { from: 'agent', to: 'answer' }
    ]
  },
  {
    id: 'multiagent',
    title: 'Multi-Agent System',
    when: 'Complex workflows, specialized subtasks, parallel processing',
    pros: ['Specialized expertise', 'Parallel execution', 'Easier to test individually', 'Scalable complexity'],
    cons: ['Coordination complexity', 'Higher cost', 'Hard to debug across agents', 'Latency adds up'],
    useCase: 'Software pipeline: planner → coder → reviewer → deployer',
    nodes: [
      { id: 'user', label: 'User', x: 50, y: 150, color: '#5b95ff' },
      { id: 'supervisor', label: 'Supervisor', x: 180, y: 150, color: '#b478ff' },
      { id: 'agent1', label: 'Planner', x: 330, y: 60, color: '#2ee6c8' },
      { id: 'agent2', label: 'Coder', x: 330, y: 150, color: '#2ee6c8' },
      { id: 'agent3', label: 'Reviewer', x: 330, y: 240, color: '#2ee6c8' },
      { id: 'answer', label: 'Output', x: 470, y: 150, color: '#35d488' },
    ],
    edges: [
      { from: 'user', to: 'supervisor' },
      { from: 'supervisor', to: 'agent1' }, { from: 'supervisor', to: 'agent2' }, { from: 'supervisor', to: 'agent3' },
      { from: 'agent1', to: 'supervisor', label: 'plan' },
      { from: 'agent2', to: 'supervisor', label: 'code' },
      { from: 'agent3', to: 'supervisor', label: 'review' },
      { from: 'supervisor', to: 'answer' }
    ]
  },
  {
    id: 'finetune',
    title: 'Fine-tuned Model',
    when: 'Consistent style, domain language, latency-sensitive, cost at scale',
    pros: ['Faster inference', 'Consistent outputs', 'Lower per-request cost', 'No retrieval latency'],
    cons: ['Training data required', 'Can\'t update without retrain', 'Catastrophic forgetting risk', 'Expensive to train'],
    useCase: 'Medical note summarization following strict hospital formatting',
    nodes: [
      { id: 'data', label: 'Training\nData', x: 80, y: 80, color: '#ffb454' },
      { id: 'base', label: 'Base\nModel', x: 80, y: 220, color: '#5b95ff' },
      { id: 'train', label: 'Fine-tune\n(SFT/DPO)', x: 230, y: 150, color: '#b478ff' },
      { id: 'model', label: 'Custom\nModel', x: 380, y: 150, color: '#2ee6c8' },
      { id: 'user', label: 'User', x: 380, y: 60, color: '#5b95ff' },
      { id: 'answer', label: 'Answer', x: 490, y: 100, color: '#35d488' },
    ],
    edges: [
      { from: 'data', to: 'train' }, { from: 'base', to: 'train' },
      { from: 'train', to: 'model' }, { from: 'user', to: 'model' },
      { from: 'model', to: 'answer' }
    ]
  }
];

// Decision tree questions
const decisionTree = [
  { q: 'Does your data change frequently or need to be current?', yes: 1, no: 2 },
  { q: 'Do questions require following relationships between entities?', yes: 'graphrag', no: 'rag' },
  { q: 'Does the task require taking actions (APIs, tools, multi-step)?', yes: 3, no: 4 },
  { q: 'Are there multiple specialized subtasks that different "experts" handle?', yes: 'multiagent', no: 'agent' },
  { q: 'Do you need ultra-consistent formatting/style at high throughput?', yes: 'finetune', no: 'rag' },
];

export function mount(container, api) {
  let viewed = new Set();
  let activePattern = 'rag';
  let animFrame = null;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>🏗️ Architecture Patterns — Visual Explorer</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Click each pattern to see its animated architecture diagram. Explore all 5 to complete.</p>

    <!-- Pattern tabs -->
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;" id="pattern-tabs">
      ${patterns.map(p => `
        <button class="btn ${p.id === 'rag' ? 'btn-primary' : 'btn-ghost'}" data-pid="${p.id}" style="padding:8px 14px;font-size:0.78rem;">${p.title}</button>
      `).join('')}
    </div>

    <!-- Animated diagram -->
    <div style="background:#05070a;border:1px solid #253039;border-radius:2px;padding:16px;margin-bottom:16px;">
      <svg id="pattern-svg" viewBox="0 0 550 300" style="width:100%;height:auto;display:block;"></svg>
    </div>

    <!-- Details panel -->
    <div id="pattern-details" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;"></div>
  `;
  container.appendChild(card);

  function renderPattern(id) {
    activePattern = id;
    viewed.add(id);
    const p = patterns.find(x => x.id === id);

    // Update tabs
    card.querySelectorAll('[data-pid]').forEach(btn => {
      btn.className = btn.dataset.pid === id ? 'btn btn-primary' : 'btn btn-ghost';
      btn.style.padding = '8px 14px'; btn.style.fontSize = '0.78rem';
    });

    const svg = card.querySelector('#pattern-svg');
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }

    // Build the full animation path through all edges
    const totalDur = p.edges.length * 0.8; // seconds per full cycle
    const segDur = 0.8; // duration per edge segment

    // Build keyframe values for the particle traveling through ALL edges
    const pathPoints = [];
    for (const e of p.edges) {
      const from = p.nodes.find(n => n.id === e.from);
      const to = p.nodes.find(n => n.id === e.to);
      pathPoints.push({ x: from.x, y: from.y });
      pathPoints.push({ x: to.x, y: to.y });
    }
    // Remove duplicate consecutive points
    const uniquePath = [pathPoints[0]];
    for (let i = 1; i < pathPoints.length; i++) {
      if (pathPoints[i].x !== pathPoints[i-1].x || pathPoints[i].y !== pathPoints[i-1].y) {
        uniquePath.push(pathPoints[i]);
      }
    }

    const xValues = uniquePath.map(pt => pt.x).join(';');
    const yValues = uniquePath.map(pt => pt.y).join(';');
    const keyTimes = uniquePath.map((_, i) => (i / (uniquePath.length - 1)).toFixed(3)).join(';');
    const animDuration = uniquePath.length * 0.5; // 0.5s per waypoint

    // Edges with sequential glow animation
    const edgesHtml = p.edges.map((e, i) => {
      const from = p.nodes.find(n => n.id === e.from);
      const to = p.nodes.find(n => n.id === e.to);
      const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
      // Each edge lights up in sequence as part of the loop
      const delay = i * (animDuration / p.edges.length);
      const glowDur = animDuration / p.edges.length;
      return `
        <g class="edge-g">
          <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#253039" stroke-width="2"/>
          <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="#2ee6c8" stroke-width="3" opacity="0" class="edge-glow" data-idx="${i}">
            <animate attributeName="opacity" values="0;0.9;0.9;0" keyTimes="0;0.1;0.7;1" dur="${animDuration}s" begin="${delay}s" repeatCount="indefinite"/>
          </line>
          ${e.label ? `<text x="${mx}" y="${my - 8}" text-anchor="middle" fill="#5b6c74" font-size="8" font-family="IBM Plex Mono,monospace">${e.label}</text>` : ''}
        </g>
      `;
    }).join('');

    // Nodes with pulse when particle arrives
    const nodesHtml = p.nodes.map((n, i) => {
      // Find which edge indices touch this node
      const touchEdges = p.edges.map((e, ei) => (e.from === n.id || e.to === n.id) ? ei : -1).filter(x => x >= 0);
      const firstTouch = touchEdges.length > 0 ? touchEdges[0] : 0;
      const pulseDelay = firstTouch * (animDuration / p.edges.length);

      return `
        <g>
          <!-- Outer glow ring -->
          <circle cx="${n.x}" cy="${n.y}" r="30" fill="none" stroke="${n.color}" stroke-width="1.5" opacity="0">
            <animate attributeName="opacity" values="0;0.6;0" dur="${animDuration}s" begin="${pulseDelay}s" repeatCount="indefinite"/>
            <animate attributeName="r" values="26;34;26" dur="${animDuration}s" begin="${pulseDelay}s" repeatCount="indefinite"/>
          </circle>
          <!-- Main node -->
          <circle cx="${n.x}" cy="${n.y}" r="26" fill="#0a0e13" stroke="${n.color}" stroke-width="2.5">
            <animate attributeName="stroke-width" values="2.5;4;2.5" dur="${animDuration}s" begin="${pulseDelay}s" repeatCount="indefinite"/>
          </circle>
          <text x="${n.x}" y="${n.y}" text-anchor="middle" fill="${n.color}" font-size="9" font-weight="600" font-family="IBM Plex Mono,monospace">
            ${n.label.split('\n').map((line, li) => `<tspan x="${n.x}" dy="${li === 0 ? (n.label.includes('\n') ? -4 : 4) : 12}">${line}</tspan>`).join('')}
          </text>
        </g>
      `;
    }).join('');

    svg.innerHTML = `
      <defs>
        <filter id="particleGlow">
          <feGaussianBlur stdDeviation="3" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      ${edgesHtml}
      ${nodesHtml}
      <!-- Traveling data particle through ALL nodes -->
      <circle r="5" fill="#2ee6c8" filter="url(#particleGlow)">
        <animate attributeName="cx" values="${xValues}" keyTimes="${keyTimes}" dur="${animDuration}s" repeatCount="indefinite" calcMode="spline" keySplines="${uniquePath.slice(1).map(() => '0.4 0 0.2 1').join(';')}"/>
        <animate attributeName="cy" values="${yValues}" keyTimes="${keyTimes}" dur="${animDuration}s" repeatCount="indefinite" calcMode="spline" keySplines="${uniquePath.slice(1).map(() => '0.4 0 0.2 1').join(';')}"/>
        <animate attributeName="r" values="${uniquePath.map((_, i) => i % 2 === 0 ? '5' : '7').join(';')}" keyTimes="${keyTimes}" dur="${animDuration}s" repeatCount="indefinite"/>
      </circle>
      <!-- Trail particle (delayed) -->
      <circle r="3" fill="#ffb454" opacity="0.6" filter="url(#particleGlow)">
        <animate attributeName="cx" values="${xValues}" keyTimes="${keyTimes}" dur="${animDuration}s" begin="0.3s" repeatCount="indefinite" calcMode="spline" keySplines="${uniquePath.slice(1).map(() => '0.4 0 0.2 1').join(';')}"/>
        <animate attributeName="cy" values="${yValues}" keyTimes="${keyTimes}" dur="${animDuration}s" begin="0.3s" repeatCount="indefinite" calcMode="spline" keySplines="${uniquePath.slice(1).map(() => '0.4 0 0.2 1').join(';')}"/>
      </circle>
    `;

    // Details
    card.querySelector('#pattern-details').innerHTML = `
      <div>
        <p style="color:#ffb454;font-weight:600;margin-bottom:6px;">When to use:</p>
        <p style="color:#e9f1f3;font-size:0.9rem;line-height:1.5;margin-bottom:14px;">${p.when}</p>
        <p style="color:#5b95ff;font-weight:600;margin-bottom:6px;">Example:</p>
        <p style="color:#e9f1f3;font-size:0.9rem;">${p.useCase}</p>
      </div>
      <div>
        <div style="margin-bottom:12px;">
          <p style="color:#35d488;font-weight:600;margin-bottom:6px;">✓ Pros</p>
          ${p.pros.map(x => `<p style="color:#93a7b0;font-size:0.85rem;margin:3px 0;">• ${x}</p>`).join('')}
        </div>
        <div>
          <p style="color:#ff5c5c;font-weight:600;margin-bottom:6px;">✗ Cons</p>
          ${p.cons.map(x => `<p style="color:#93a7b0;font-size:0.85rem;margin:3px 0;">• ${x}</p>`).join('')}
        </div>
      </div>
    `;

    checkComplete();
  }

  card.querySelectorAll('[data-pid]').forEach(btn => {
    btn.addEventListener('click', () => renderPattern(btn.dataset.pid));
  });

  renderPattern('rag');

  // --- DECISION WIZARD ---
  const wizardCard = document.createElement('div');
  wizardCard.className = 'card';
  wizardCard.innerHTML = `
    <h3>🧭 "Which Pattern Should I Use?" — Decision Wizard</h3>
    <p style="color:var(--text-1);margin-bottom:14px;">Answer Yes/No questions to find the best architecture for your use case.</p>
    <div id="wizard-content"></div>
  `;
  container.appendChild(wizardCard);

  function renderWizardStep(stepIdx) {
    const wc = wizardCard.querySelector('#wizard-content');

    if (typeof stepIdx === 'string') {
      // Result
      const p = patterns.find(x => x.id === stepIdx);
      wc.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.75rem;text-transform:uppercase;margin-bottom:8px;">Recommended Pattern</p>
          <p style="color:${p.nodes[0].color};font-size:1.5rem;font-weight:700;font-family:IBM Plex Mono,monospace;margin-bottom:8px;">${p.title}</p>
          <p style="color:#93a7b0;font-size:0.92rem;margin-bottom:16px;">${p.when}</p>
          <div style="display:flex;gap:8px;justify-content:center;">
            <button class="btn btn-primary" id="wiz-view" style="padding:8px 16px;">View Diagram →</button>
            <button class="btn btn-ghost" id="wiz-restart" style="padding:8px 16px;">Start Over</button>
          </div>
        </div>
      `;
      wc.querySelector('#wiz-view').addEventListener('click', () => renderPattern(stepIdx));
      wc.querySelector('#wiz-restart').addEventListener('click', () => renderWizardStep(0));
      return;
    }

    const step = decisionTree[stepIdx];
    wc.innerHTML = `
      <div style="text-align:center;padding:20px;">
        <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;margin-bottom:12px;">QUESTION ${stepIdx + 1} of ${decisionTree.length}</p>
        <p style="color:#e9f1f3;font-size:1.1rem;font-weight:600;margin-bottom:20px;">${step.q}</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button class="btn btn-primary" id="wiz-yes" style="padding:12px 30px;font-size:0.9rem;">Yes</button>
          <button class="btn btn-ghost" id="wiz-no" style="padding:12px 30px;font-size:0.9rem;border-color:#ff5c5c;color:#ff5c5c;">No</button>
        </div>
        <div style="margin-top:16px;display:flex;gap:4px;justify-content:center;">
          ${decisionTree.map((_, i) => `<span style="width:${i <= stepIdx ? 20 : 8}px;height:4px;border-radius:2px;background:${i < stepIdx ? '#35d488' : i === stepIdx ? '#2ee6c8' : '#253039'};transition:all 0.3s;"></span>`).join('')}
        </div>
      </div>
    `;
    wc.querySelector('#wiz-yes').addEventListener('click', () => renderWizardStep(step.yes));
    wc.querySelector('#wiz-no').addEventListener('click', () => renderWizardStep(step.no));
  }

  renderWizardStep(0);

  function checkComplete() {
    if (viewed.size >= patterns.length) {
      setTimeout(() => {
        api.badge('pattern-analyst', 'Pattern Analyst');
        api.complete(100, { heading: 'All Patterns Explored!', detail: 'You can now choose the right architecture for any AI use case.' });
      }, 500);
    }
  }
}
