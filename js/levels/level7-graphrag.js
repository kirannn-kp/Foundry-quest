// level7-graphrag.js — Graph RAG & Knowledge Graphs (interactive graph traversal)

const concepts = [
  { title: 'What is a Knowledge Graph?', desc: 'Nodes = entities (people, concepts, products). Edges = typed relationships (works_at, is_a, related_to). Unlike vectors, relationships are EXPLICIT — not just implied by proximity.' },
  { title: 'Triples: The Atomic Unit', desc: 'Every fact is a triple: (Subject, Predicate, Object). "Einstein → worked_at → Princeton". The entire knowledge graph is just millions of these triples.' },
  { title: 'Why Graphs + AI?', desc: 'Vector search finds "similar" content but can\'t answer: "What projects did the manager of the person who wrote this code also work on?" That requires traversing relationships.' },
  { title: 'Multi-Hop Reasoning', desc: 'Single-hop: "Who manages Alice?" → Bob. Multi-hop: "What department does Alice\'s manager\'s director belong to?" → requires 3 hops across the graph.' },
  { title: 'Entity Extraction & Linking', desc: 'Building a KG from text: extract entities (NER), resolve duplicates ("MS" = "Microsoft" = "MSFT"), extract relationships. LLMs now do this better than traditional NLP.' },
  { title: 'GraphRAG (Microsoft)', desc: 'Extract entities & relationships → detect communities → generate community summaries → at query time retrieve relevant communities + summaries. Excels at global/summarization questions.' },
  { title: 'Hybrid: Vector + Graph', desc: 'Use vector search for semantic similarity + graph traversal for structured reasoning. Azure AI Search supports both in a single index.' },
  { title: 'When to Use Graph RAG', desc: 'Use when: data is highly interconnected, questions need multi-hop, you need global summarization, or explainable retrieval paths. Use standard RAG for simple lookups.' }
];

// Interactive graph data
const graphNodes = [
  { id: 'foundry', label: 'Foundry', x: 250, y: 150, color: '#5b95ff' },
  { id: 'microsoft', label: 'Microsoft', x: 100, y: 100, color: '#2ee6c8' },
  { id: 'gpt4', label: 'GPT-4', x: 400, y: 80, color: '#ffb454' },
  { id: 'openai', label: 'OpenAI', x: 350, y: 180, color: '#ffb454' },
  { id: 'agents', label: 'Agents', x: 180, y: 250, color: '#b478ff' },
  { id: 'rag', label: 'RAG', x: 320, y: 280, color: '#2ee6c8' },
  { id: 'llm', label: 'LLM', x: 420, y: 250, color: '#ffb454' },
  { id: 'azure', label: 'Azure', x: 80, y: 200, color: '#5b95ff' },
  { id: 'search', label: 'AI Search', x: 200, y: 340, color: '#5b95ff' },
  { id: 'vectors', label: 'Vectors', x: 350, y: 360, color: '#2ee6c8' },
];

const graphEdges = [
  { from: 'microsoft', to: 'foundry', label: 'builds' },
  { from: 'microsoft', to: 'azure', label: 'owns' },
  { from: 'microsoft', to: 'openai', label: 'partners' },
  { from: 'foundry', to: 'agents', label: 'enables' },
  { from: 'foundry', to: 'gpt4', label: 'deploys' },
  { from: 'openai', to: 'gpt4', label: 'created' },
  { from: 'gpt4', to: 'llm', label: 'is_a' },
  { from: 'agents', to: 'rag', label: 'uses' },
  { from: 'rag', to: 'search', label: 'powered_by' },
  { from: 'rag', to: 'vectors', label: 'uses' },
  { from: 'azure', to: 'search', label: 'hosts' },
  { from: 'llm', to: 'rag', label: 'generates_for' },
  { from: 'agents', to: 'llm', label: 'powered_by' },
];

const quiz = [
  { q: 'What can a knowledge graph answer that pure vector search cannot?', opts: ['Questions about similar documents', 'Multi-hop relationship questions requiring traversal across connected entities', 'Questions about formatting', 'Statistical aggregations'], correct: 1 },
  { q: 'A "triple" in a knowledge graph is:', opts: ['Three related documents', '(Subject, Predicate, Object) like "Einstein → worked_at → Princeton"', 'A 3D vector', 'Three search results'], correct: 1 },
  { q: 'Microsoft\'s GraphRAG builds community summaries to:', opts: ['Save storage', 'Answer global/thematic questions spanning many documents — something chunked RAG struggles with', 'Look nice', 'Reduce costs'], correct: 1 },
  { q: 'Entity linking solves:', opts: ['Slow traversal', 'Same entity with different names ("MS" = "Microsoft" = "MSFT") across documents', 'Missing embeddings', 'Too many relationships'], correct: 1 },
  { q: 'When should you choose standard RAG over GraphRAG?', opts: ['Always', 'Simple lookups from specific docs where data isn\'t highly interconnected', 'Never', 'When you have no LLM'], correct: 1 }
];

export function mount(container, api) {
  let explored = new Set();
  let quizScore = 0, answered = 0;

  // --- INTERACTIVE KNOWLEDGE GRAPH ---
  const graphCard = document.createElement('div');
  graphCard.className = 'card';
  graphCard.innerHTML = `
    <h3>🕸️ Interactive Knowledge Graph</h3>
    <p style="color:var(--text-1);margin-bottom:8px;">Click a node to highlight it and see all its connections. Click connected nodes to "traverse" — like a multi-hop query!</p>
    <div class="graph-wrap" style="padding:8px;">
      <svg id="kg-svg" class="graph-svg" viewBox="0 0 500 400" style="cursor:pointer;"></svg>
    </div>
    <div id="kg-info" style="margin-top:12px;padding:14px;background:var(--bg-2);border:1px solid var(--border);border-radius:2px;min-height:50px;">
      <span style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.85rem;">👆 Click a node to explore its relationships...</span>
    </div>
    <div id="kg-path" style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;align-items:center;min-height:30px;"></div>
  `;
  container.appendChild(graphCard);

  const kgSvg = graphCard.querySelector('#kg-svg');
  const kgInfo = graphCard.querySelector('#kg-info');
  const kgPath = graphCard.querySelector('#kg-path');
  let activeNode = null;
  let pathHistory = [];

  function renderGraph() {
    const edgesHtml = graphEdges.map(e => {
      const from = graphNodes.find(n => n.id === e.from);
      const to = graphNodes.find(n => n.id === e.to);
      const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
      const highlighted = activeNode && (e.from === activeNode || e.to === activeNode);
      return `
        <g class="g-edge ${highlighted ? 'highlight' : ''}" data-from="${e.from}" data-to="${e.to}">
          <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${highlighted ? '#ffb454' : '#3d5058'}" stroke-width="${highlighted ? 2.5 : 1.5}"/>
          <text x="${mx}" y="${my - 5}" text-anchor="middle" fill="${highlighted ? '#ffb454' : '#5b6c74'}" font-size="8" font-family="IBM Plex Mono,monospace">${e.label}</text>
        </g>
      `;
    }).join('');

    const nodesHtml = graphNodes.map(n => {
      const isActive = n.id === activeNode;
      const isConnected = activeNode && graphEdges.some(e => (e.from === activeNode && e.to === n.id) || (e.to === activeNode && e.from === n.id));
      const dimmed = activeNode && !isActive && !isConnected;
      return `
        <g class="g-node ${isActive ? 'highlight' : ''}" data-id="${n.id}" style="cursor:pointer;opacity:${dimmed ? 0.3 : 1};">
          <circle cx="${n.x}" cy="${n.y}" r="${isActive ? 24 : 20}" fill="${isActive ? n.color : '#171e26'}" stroke="${n.color}" stroke-width="${isActive ? 3 : 2}"
            ${isActive ? `filter="url(#glow)"` : ''}/>
          <text x="${n.x}" y="${n.y + 4}" text-anchor="middle" fill="${isActive ? '#05070a' : '#e9f1f3'}" font-size="${isActive ? 10 : 9}" font-weight="700" font-family="IBM Plex Mono,monospace">${n.label}</text>
        </g>
      `;
    }).join('');

    kgSvg.innerHTML = `
      <defs>
        <filter id="glow"><feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#2ee6c8" flood-opacity="0.7"/></filter>
      </defs>
      ${edgesHtml}
      ${nodesHtml}
    `;
  }

  function selectNode(id) {
    activeNode = id;
    const node = graphNodes.find(n => n.id === id);
    const connections = graphEdges.filter(e => e.from === id || e.to === id);
    const neighbors = connections.map(e => {
      const neighborId = e.from === id ? e.to : e.from;
      const neighbor = graphNodes.find(n => n.id === neighborId);
      const direction = e.from === id ? '→' : '←';
      return { neighbor, label: e.label, direction };
    });

    kgInfo.innerHTML = `
      <div style="margin-bottom:8px;">
        <span style="color:${node.color};font-weight:700;font-family:IBM Plex Mono,monospace;font-size:1rem;">${node.label}</span>
        <span style="color:#5b6c74;margin-left:8px;">${connections.length} connections</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${neighbors.map(n => `
          <span style="background:#171e26;border:1px solid ${n.neighbor.color};border-radius:2px;padding:4px 10px;font-size:0.78rem;font-family:IBM Plex Mono,monospace;cursor:pointer;transition:all 0.15s;" class="hop-chip" data-target="${n.neighbor.id}">
            <span style="color:#5b6c74;">${n.direction}</span>
            <span style="color:#ffb454;">${n.label}</span>
            <span style="color:${n.neighbor.color};font-weight:600;">${n.neighbor.label}</span>
          </span>
        `).join('')}
      </div>
    `;

    // Path tracking
    pathHistory.push(id);
    renderPath();
    renderGraph();

    // Make hop chips clickable
    kgInfo.querySelectorAll('.hop-chip').forEach(chip => {
      chip.addEventListener('click', () => selectNode(chip.dataset.target));
      chip.addEventListener('mouseenter', () => { chip.style.borderColor = '#2ee6c8'; chip.style.transform = 'translateY(-2px)'; });
      chip.addEventListener('mouseleave', () => { chip.style.borderColor = ''; chip.style.transform = ''; });
    });
  }

  function renderPath() {
    if (pathHistory.length <= 1) {
      kgPath.innerHTML = pathHistory.length === 1
        ? `<span style="font-family:IBM Plex Mono,monospace;font-size:0.75rem;color:#5b6c74;">TRAVERSAL PATH:</span>
           <span style="background:#171e26;border:1px dashed #2ee6c8;border-radius:2px;padding:3px 8px;font-size:0.78rem;font-family:IBM Plex Mono,monospace;color:#2ee6c8;">${graphNodes.find(n=>n.id===pathHistory[0]).label}</span>`
        : '';
      return;
    }
    kgPath.innerHTML = `
      <span style="font-family:IBM Plex Mono,monospace;font-size:0.75rem;color:#5b6c74;">TRAVERSAL (${pathHistory.length - 1} hop${pathHistory.length > 2 ? 's' : ''}):</span>
      ${pathHistory.map((id, i) => {
        const n = graphNodes.find(x => x.id === id);
        const arrow = i > 0 ? '<span style="color:#5b6c74;margin:0 2px;">→</span>' : '';
        return `${arrow}<span style="background:#171e26;border:1px solid ${n.color};border-radius:2px;padding:3px 8px;font-size:0.78rem;font-family:IBM Plex Mono,monospace;color:${n.color};">${n.label}</span>`;
      }).join('')}
      <button style="background:transparent;border:1px solid #253039;color:#5b6c74;border-radius:2px;padding:3px 8px;font-size:0.7rem;cursor:pointer;font-family:IBM Plex Mono,monospace;" id="reset-path">Reset</button>
    `;
    kgPath.querySelector('#reset-path').addEventListener('click', () => {
      pathHistory = [];
      activeNode = null;
      kgPath.innerHTML = '';
      kgInfo.innerHTML = `<span style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.85rem;">👆 Click a node to explore its relationships...</span>`;
      renderGraph();
    });
  }

  kgSvg.addEventListener('click', (e) => {
    const nodeEl = e.target.closest('.g-node');
    if (nodeEl) selectNode(nodeEl.dataset.id);
  });

  renderGraph();

  // --- CONCEPTS ---
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h3>Graph RAG Concepts</h3><p style="color:var(--text-1);margin-bottom:12px;">Explore all to unlock the quiz.</p>
    ${concepts.map((c,i) => `<div class="accordion-item" data-idx="${i}"><div class="accordion-head"><span>${c.title}</span><span class="chev">▾</span></div><div class="accordion-body"><p>${c.desc}</p></div></div>`).join('')}`;
  container.appendChild(card);
  card.querySelectorAll('.accordion-item').forEach(item => {
    item.querySelector('.accordion-head').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      card.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) { item.classList.add('open'); explored.add(item.dataset.idx); }
      if (explored.size === concepts.length) quizCard.hidden = false;
    });
  });

  // --- QUIZ ---
  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.hidden = true;
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="gr-quiz"></div>`;
  container.appendChild(quizCard);
  const observer = new MutationObserver(() => {
    if (!quizCard.hidden && !quizCard.querySelector('.quiz-q')) {
      const qc = quizCard.querySelector('#gr-quiz');
      qc.innerHTML = quiz.map((q,qi) => `<div class="quiz-q" data-qi="${qi}"><p class="qtext">${qi+1}. ${q.q}</p><div class="quiz-options">${q.opts.map((o,oi) => `<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}">${o}</button>`).join('')}</div></div>`).join('');
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
          if (answered === quiz.length) setTimeout(() => {
            if (quizScore >= 80) api.badge('graph-explorer', 'Graph Explorer');
            api.complete(quizScore, { heading: 'Graph RAG Mastered!', badge: quizScore >= 80 ? { name: 'Graph Explorer' } : null });
          }, 800);
        });
      });
    }
  });
  observer.observe(quizCard, { attributes: true });
}
