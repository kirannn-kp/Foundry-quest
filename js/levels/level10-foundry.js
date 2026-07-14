// level10-foundry.js — Microsoft Foundry: The Platform (interactive explorer)

const platformMap = {
  project: {
    label: 'Foundry Project',
    color: '#2ee6c8',
    desc: 'The top-level workspace. Groups together model deployments, connections, evaluations, agent configs, and team permissions.',
    children: ['models', 'connections', 'agents', 'eval', 'playground'],
    details: [
      'Create via Azure Portal or `azd init`',
      'Linked to an AI Services resource',
      'Supports multiple environments (dev/staging/prod)',
      'Team RBAC at project level'
    ]
  },
  models: {
    label: 'Model Catalog',
    color: '#ffb454',
    desc: '1800+ models from OpenAI, Meta, Microsoft, Mistral, Cohere. Deploy with one click — provisioned or serverless.',
    children: ['gpt4o', 'llama', 'phi'],
    details: [
      'Filter by task, license, size, provider',
      'Compare benchmarks side-by-side',
      'One-click deploy to endpoint',
      'Provisioned (PTU) or Serverless (pay-per-token)'
    ]
  },
  connections: {
    label: 'Connections',
    color: '#5b95ff',
    desc: 'Link external resources: Azure AI Search, Blob Storage, Cosmos DB, custom APIs. Uses managed identity — no secrets in code.',
    children: [],
    details: [
      'Azure AI Search (for RAG)',
      'Azure Blob Storage (documents)',
      'Azure Cosmos DB (structured data)',
      'Custom REST APIs',
      'All use Managed Identity — zero secrets'
    ]
  },
  agents: {
    label: 'Agent Service',
    color: '#b478ff',
    desc: 'Build AI agents with tools and knowledge. Handles orchestration loop, conversation state, and tool execution.',
    children: ['tools', 'knowledge'],
    details: [
      'Declarative (YAML) or Code-first (Python SDK)',
      'Built-in: Code Interpreter, File Search, Bing',
      'Custom function tools',
      'Multi-agent patterns (supervisor, handoff)',
      'Persistent conversation threads'
    ]
  },
  eval: {
    label: 'Evaluation',
    color: '#35d488',
    desc: 'Measure quality systematically. Built-in evaluators + custom. Batch runs, continuous monitoring, prompt optimization.',
    children: [],
    details: [
      'Groundedness, Relevance, Coherence, Fluency',
      'Custom Python evaluators',
      'Batch eval over test datasets',
      'Continuous eval on production traffic',
      'Prompt optimizer (auto-improve prompts)'
    ]
  },
  playground: {
    label: 'Playground',
    color: '#2ee6c8',
    desc: 'Interactive UI to test prompts, compare models, add RAG data. Rapid experimentation without code.',
    children: [],
    details: [
      'Chat interface with system prompt editor',
      'Temperature, top-p, max tokens controls',
      'Side-by-side model comparison',
      'Add your data (RAG) with one click',
      'Export to code (Python/curl)'
    ]
  },
  tools: {
    label: 'Agent Tools',
    color: '#ffb454',
    desc: 'Capabilities the agent can invoke: code execution, file search, web search, custom functions.',
    children: [],
    details: [
      'Code Interpreter — Python sandbox',
      'File Search — built-in vector RAG',
      'Bing Grounding — live web search',
      'Custom Functions — your own APIs',
      'Azure AI Search — enterprise RAG'
    ]
  },
  knowledge: {
    label: 'Knowledge Base',
    color: '#5b95ff',
    desc: 'Upload documents (PDFs, Word, code). Auto-chunked, embedded, and indexed for agent retrieval.',
    children: [],
    details: [
      'Upload PDFs, DOCX, TXT, code files',
      'Auto-chunking & embedding',
      'Vector store for large collections',
      'Document-level access control',
      'Automatic reindexing on updates'
    ]
  },
  gpt4o: { label: 'GPT-4o', color: '#ffb454', desc: 'OpenAI\'s flagship multimodal model. Text + vision + audio.', children: [], details: ['128K context window', 'Multimodal (text + image + audio)', 'Function calling support', 'Structured outputs / JSON mode'] },
  llama: { label: 'Llama 3.1', color: '#ffb454', desc: 'Meta\'s open-weight model. 8B/70B/405B sizes. Fine-tunable.', children: [], details: ['Open weights — fine-tune & self-host', '8B, 70B, 405B parameter variants', '128K context window', 'Competitive with GPT-4 on many benchmarks'] },
  phi: { label: 'Phi-3.5', color: '#ffb454', desc: 'Microsoft\'s small model. Runs on edge/mobile. Great quality for size.', children: [], details: ['3.8B parameters — runs on mobile', 'Vision variant available', 'Outperforms models 10x its size', 'Ideal for latency-sensitive & edge use cases'] },
};

const quiz = [
  { q: 'A Foundry "Project" groups together:', opts: ['Only models', 'Model deployments, connections, evaluations, agent configs, and team permissions', 'Just code files', 'Only evaluation results'], correct: 1 },
  { q: 'The Model Catalog provides:', opts: ['Only GPT-4', '1800+ models from multiple providers with one-click deployment', 'Only open-source models', 'Only fine-tuned models'], correct: 1 },
  { q: 'Connections use managed identity because:', opts: ['It\'s faster', 'No secrets/API keys in code — secure, auto-rotated, auditable', 'It\'s required by law', 'It\'s cheaper'], correct: 1 },
  { q: 'When should you use PTU vs Serverless?', opts: ['Always PTU', 'PTU for production with predictable latency; Serverless for dev/test', 'Always Serverless', 'They\'re identical'], correct: 1 },
  { q: 'The Playground lets you:', opts: ['Write production code', 'Test prompts, compare models, and add RAG data — before writing any code', 'Deploy to production', 'Manage billing'], correct: 1 }
];

export function mount(container, api) {
  let quizScore = 0, answered = 0;
  let currentNode = 'project';
  let navHistory = [];

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>🗺️ Interactive Foundry Platform Map</h3>
    <p style="color:var(--text-1);margin-bottom:14px;">Explore the platform visually — click nodes to dive deeper, like navigating a knowledge graph of Foundry itself.</p>
    <div id="platform-nav" style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:14px;min-height:30px;"></div>
    <div style="display:flex;gap:16px;flex-wrap:wrap;">
      <div id="platform-graph" style="flex:1;min-width:280px;background:#05070a;border:1px solid #253039;border-radius:2px;padding:16px;min-height:320px;"></div>
      <div id="platform-detail" style="flex:1;min-width:280px;"></div>
    </div>
  `;
  container.appendChild(card);

  const graphEl = card.querySelector('#platform-graph');
  const detailEl = card.querySelector('#platform-detail');
  const navEl = card.querySelector('#platform-nav');

  function renderNode(nodeId) {
    currentNode = nodeId;
    const node = platformMap[nodeId];
    if (!node) return;

    // Navigation breadcrumb
    if (!navHistory.includes(nodeId)) navHistory.push(nodeId);
    navEl.innerHTML = `
      <span style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;">PATH:</span>
      ${navHistory.map((id, i) => {
        const n = platformMap[id];
        return `${i > 0 ? '<span style="color:#5b6c74;">→</span>' : ''}
          <span style="background:#10151b;border:1px solid ${n.color};border-radius:2px;padding:3px 8px;font-size:0.75rem;font-family:IBM Plex Mono,monospace;color:${n.color};cursor:pointer;${id === nodeId ? 'font-weight:700;' : 'opacity:0.7;'}" data-goto="${id}">${n.label}</span>`;
      }).join('')}
      ${navHistory.length > 1 ? '<button id="nav-reset" style="background:transparent;border:1px solid #253039;color:#5b6c74;border-radius:2px;padding:3px 8px;font-size:0.68rem;cursor:pointer;font-family:IBM Plex Mono,monospace;margin-left:8px;">Reset</button>' : ''}
    `;

    navEl.querySelectorAll('[data-goto]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.goto;
        navHistory = navHistory.slice(0, navHistory.indexOf(target) + 1);
        renderNode(target);
      });
    });
    if (navEl.querySelector('#nav-reset')) {
      navEl.querySelector('#nav-reset').addEventListener('click', () => { navHistory = []; renderNode('project'); });
    }

    // Hub-and-spoke graph visualization
    const children = node.children.map(id => platformMap[id]).filter(Boolean);
    const cx = 150, cy = 150, radius = 110;
    const childPositions = children.map((child, i) => {
      const angle = (i / children.length) * Math.PI * 2 - Math.PI / 2;
      return { ...child, id: node.children[i], x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
    });

    graphEl.innerHTML = `
      <svg viewBox="0 0 300 300" style="width:100%;height:auto;">
        <!-- Edges -->
        ${childPositions.map(c => `
          <line x1="${cx}" y1="${cy}" x2="${c.x}" y2="${c.y}" stroke="#253039" stroke-width="1.5"/>
        `).join('')}
        <!-- Center node -->
        <g style="cursor:default;">
          <circle cx="${cx}" cy="${cy}" r="32" fill="${node.color}22" stroke="${node.color}" stroke-width="2.5">
            <animate attributeName="r" values="32;35;32" dur="2s" repeatCount="indefinite"/>
          </circle>
          <text x="${cx}" y="${cy + 4}" text-anchor="middle" fill="${node.color}" font-size="10" font-weight="700" font-family="IBM Plex Mono,monospace">${node.label.length > 12 ? node.label.slice(0, 12) + '..' : node.label}</text>
        </g>
        <!-- Child nodes -->
        ${childPositions.map(c => `
          <g style="cursor:pointer;" class="child-node" data-id="${c.id}">
            <circle cx="${c.x}" cy="${c.y}" r="24" fill="#171e26" stroke="${c.color}" stroke-width="2"/>
            <text x="${c.x}" y="${c.y + 4}" text-anchor="middle" fill="${c.color}" font-size="8" font-weight="600" font-family="IBM Plex Mono,monospace">${c.label.length > 12 ? c.label.slice(0, 10) + '..' : c.label}</text>
          </g>
        `).join('')}
        ${children.length === 0 ? `<text x="${cx}" y="${cy + 60}" text-anchor="middle" fill="#5b6c74" font-size="9" font-family="IBM Plex Mono,monospace">(leaf node — no sub-components)</text>` : ''}
      </svg>
    `;

    // Click children to navigate
    graphEl.querySelectorAll('.child-node').forEach(el => {
      el.addEventListener('click', () => renderNode(el.dataset.id));
      el.addEventListener('mouseenter', () => el.querySelector('circle').setAttribute('stroke-width', '3.5'));
      el.addEventListener('mouseleave', () => el.querySelector('circle').setAttribute('stroke-width', '2'));
    });

    // Detail panel
    detailEl.innerHTML = `
      <div style="border:1px solid ${node.color};border-radius:2px;padding:16px;background:#0a0e13;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="width:12px;height:12px;border-radius:50%;background:${node.color};display:inline-block;"></span>
          <span style="color:${node.color};font-family:IBM Plex Mono,monospace;font-weight:700;font-size:1rem;">${node.label}</span>
        </div>
        <p style="color:#93a7b0;line-height:1.6;margin-bottom:14px;">${node.desc}</p>
        <div style="border-top:1px solid #253039;padding-top:12px;">
          <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;margin-bottom:8px;">Key Details</p>
          ${node.details.map(d => `
            <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:6px;">
              <span style="color:${node.color};font-size:0.8rem;margin-top:2px;">▸</span>
              <span style="color:#e9f1f3;font-size:0.85rem;line-height:1.4;">${d}</span>
            </div>
          `).join('')}
        </div>
        ${children.length > 0 ? `
          <div style="border-top:1px solid #253039;padding-top:12px;margin-top:12px;">
            <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;margin-bottom:8px;">Click to explore →</p>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${children.map((c, i) => `<span class="detail-chip" data-id="${node.children[i]}" style="background:#171e26;border:1px solid ${c.color};border-radius:2px;padding:5px 10px;font-size:0.78rem;font-family:IBM Plex Mono,monospace;color:${c.color};cursor:pointer;transition:all 0.15s;">${c.label}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    detailEl.querySelectorAll('.detail-chip').forEach(chip => {
      chip.addEventListener('click', () => renderNode(chip.dataset.id));
      chip.addEventListener('mouseenter', () => { chip.style.background = chip.style.borderColor + '22'; chip.style.transform = 'translateY(-2px)'; });
      chip.addEventListener('mouseleave', () => { chip.style.background = '#171e26'; chip.style.transform = ''; });
    });
  }

  renderNode('project');

  // --- QUIZ ---
  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="f-quiz"></div>`;
  container.appendChild(quizCard);

  const qc = quizCard.querySelector('#f-quiz');
  qc.innerHTML = quiz.map((q, qi) => `
    <div class="quiz-q" data-qi="${qi}"><p class="qtext">${qi + 1}. ${q.q}</p>
      <div class="quiz-options">${q.opts.map((o, oi) => `<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}">${o}</button>`).join('')}</div></div>`).join('');
  qc.querySelectorAll('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const qi = parseInt(btn.dataset.qi), oi = parseInt(btn.dataset.oi);
      const qDiv = qc.querySelector(`.quiz-q[data-qi="${qi}"]`);
      if (qDiv.dataset.answered) return;
      qDiv.dataset.answered = '1';
      qDiv.querySelectorAll('.quiz-opt').forEach(o => o.classList.add('disabled'));
      if (oi === quiz[qi].correct) { btn.classList.add('correct'); quizScore += 20; }
      else { btn.classList.add('wrong'); qDiv.querySelectorAll('.quiz-opt')[quiz[qi].correct].classList.add('correct'); }
      answered++;
      if (answered === quiz.length) {
        setTimeout(() => {
          if (quizScore >= 80) api.badge('foundry-initiate', 'Foundry Initiate');
          api.complete(quizScore, { heading: 'Foundry Platform Mastered!', badge: quizScore >= 80 ? { name: 'Foundry Initiate' } : null });
        }, 800);
      }
    });
  });
}
