// level14-playground.js — Live AI Playground (rich interactive simulated experience)

const ragDocument = `Microsoft Foundry (formerly Azure AI Studio) is a unified platform for building, evaluating, and deploying AI applications. It provides access to models from OpenAI (GPT-4o, o1), Meta (Llama), Microsoft (Phi), and others through a model catalog of 1800+ models.

Key features include:
- Agent Service for building AI agents with tools and knowledge
- Built-in evaluation with groundedness, relevance, and coherence metrics
- OpenTelemetry-based tracing for debugging agent workflows
- Provisioned Throughput Units (PTU) for production workloads
- Pay-as-you-go serverless for development and testing
- Azure Developer CLI (azd) for one-command deployment

Foundry projects group model deployments, connections to data sources, evaluation runs, and team permissions. Connections use managed identity for secure access without API keys in code.

The Foundry SDK (azure-ai-projects) enables code-first agent development in Python, with support for custom tools, file search, code interpreter, and multi-agent orchestration patterns like supervisor and sequential handoff.`;

function chunkDocument(text, size = 150) {
  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = '';
  for (const s of sentences) {
    if ((current + ' ' + s).split(/\s+/).length > size) {
      if (current) chunks.push(current.trim());
      current = s;
    } else {
      current += (current ? ' ' : '') + s;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

const chunks = chunkDocument(ragDocument, 60);

// Simulated similarity scores for different queries
const queryResults = {
  'pricing': { chunks: [1, 0], scores: [0.89, 0.72], answer: 'Microsoft Foundry offers two deployment options: Provisioned Throughput Units (PTU) for production workloads with reserved capacity, and pay-as-you-go serverless for development and testing. The model catalog includes 1800+ models from multiple providers.' },
  'agents': { chunks: [2, 3], scores: [0.94, 0.85], answer: 'Foundry provides an Agent Service for building AI agents with tools and knowledge. The SDK supports custom tools, file search, code interpreter, and multi-agent orchestration patterns including supervisor and sequential handoff approaches.' },
  'deployment': { chunks: [1, 3], scores: [0.91, 0.78], answer: 'Deployment uses the Azure Developer CLI (azd) for one-command deployment. Foundry projects group model deployments, connections, evaluation runs, and team permissions. Connections use managed identity for secure access without API keys.' },
  'evaluation': { chunks: [2, 1], scores: [0.92, 0.68], answer: 'Foundry includes built-in evaluation with groundedness, relevance, and coherence metrics. It also provides OpenTelemetry-based tracing for debugging agent workflows, enabling end-to-end observability of AI applications.' },
};

const agentScenarios = [
  {
    title: 'Research Assistant',
    query: 'Find recent papers about RAG evaluation metrics and summarize the key findings',
    steps: [
      { type: 'thought', text: 'The user wants recent research on RAG evaluation. I should search for academic papers, then summarize findings.' },
      { type: 'action', text: 'Tool: search_papers\nArgs: { "query": "RAG evaluation metrics 2024", "limit": 5 }' },
      { type: 'observation', text: '[\n  {"title": "RAGAS: Automated RAG Assessment", "year": 2024, "key_finding": "Context precision and answer faithfulness are the most predictive quality metrics"},\n  {"title": "ARES: Automated RAG Evaluation", "year": 2024, "key_finding": "LLM-as-judge correlates 0.89 with human evaluation"},\n  {"title": "Benchmarking RAG Pipelines", "year": 2024, "key_finding": "Hybrid search + reranking outperforms vector-only by 23%"}\n]' },
      { type: 'thought', text: 'I have 3 relevant papers. Let me synthesize the key findings into a coherent summary.' },
      { type: 'answer', text: 'Here are the key findings from recent RAG evaluation research:\n\n1. **RAGAS (2024)**: Context precision and answer faithfulness are the most predictive quality metrics for RAG systems.\n\n2. **ARES (2024)**: Using LLMs as automated judges correlates 0.89 with human evaluation — making automated eval viable at scale.\n\n3. **Benchmarking RAG (2024)**: Hybrid search (vector + keyword) combined with reranking outperforms vector-only retrieval by 23%.\n\n**Key takeaway**: The field is converging on automated LLM-based evaluation as a practical substitute for expensive human annotation.' }
    ]
  },
  {
    title: 'Code Debugger',
    query: 'My Python function is returning None instead of the computed result. Help me fix it.',
    steps: [
      { type: 'thought', text: 'Common cause: missing return statement. Let me ask to see the code, or use code interpreter to demonstrate the fix.' },
      { type: 'action', text: 'Tool: code_interpreter\nArgs: { "code": "# Demonstrating the common bug:\\ndef calculate_total(items):\\n    total = sum(item[\'price\'] for item in items)\\n    # BUG: no return statement!\\n\\n# Fix:\\ndef calculate_total_fixed(items):\\n    total = sum(item[\'price\'] for item in items)\\n    return total  # <-- This was missing\\n\\nresult = calculate_total([{\'price\': 10}, {\'price\': 20}])\\nresult_fixed = calculate_total_fixed([{\'price\': 10}, {\'price\': 20}])\\nprint(f\'Bug version: {result}\')\\nprint(f\'Fixed version: {result_fixed}\')" }' },
      { type: 'observation', text: 'Bug version: None\nFixed version: 30' },
      { type: 'answer', text: '**The issue**: Your function is missing a `return` statement. In Python, functions without an explicit `return` implicitly return `None`.\n\n**The fix**: Add `return total` (or whatever your computed value is) at the end of your function.\n\n```python\ndef calculate_total(items):\n    total = sum(item[\'price\'] for item in items)\n    return total  # ← Add this line\n```\n\nThis is one of the most common Python bugs — the function computes the right value but never hands it back to the caller.' }
    ]
  }
];

export function mount(container, api) {
  let viewedTabs = new Set();

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>🎮 Interactive AI Playground</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Experience AI systems hands-on. Explore all 3 tabs to complete this level.</p>
    <div class="world-tabs" style="margin-bottom:16px;">
      <button class="world-tab active" data-tab="rag">🔍 RAG Pipeline</button>
      <button class="world-tab" data-tab="agent">🤖 Agent Loop</button>
      <button class="world-tab" data-tab="prompt">✍️ Prompt Lab</button>
    </div>
    <div id="pg-content"></div>
  `;
  container.appendChild(card);

  const content = card.querySelector('#pg-content');
  const tabs = card.querySelectorAll('.world-tab');

  function renderRAG() {
    viewedTabs.add('rag');
    content.innerHTML = `
      <div style="margin-bottom:16px;">
        <h4 style="color:var(--accent);margin-bottom:8px;">Live RAG Pipeline Simulator</h4>
        <p style="color:var(--text-1);font-size:0.9rem;margin-bottom:12px;">Type a query about Microsoft Foundry. Watch the pipeline retrieve relevant chunks and generate a grounded answer.</p>
        <div style="display:flex;gap:8px;margin-bottom:14px;">
          <input id="rag-input" type="text" placeholder="Try: pricing, agents, deployment, evaluation..." style="flex:1;background:#10151b;border:1px solid #253039;color:#e9f1f3;border-radius:2px;padding:10px 14px;font-family:IBM Plex Mono,monospace;font-size:0.9rem;">
          <button class="btn btn-primary" id="rag-go" style="padding:10px 20px;">Search →</button>
        </div>
        <div id="rag-pipeline" style="display:none;">
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;" id="rag-stages"></div>
          <div id="rag-chunks" style="margin-bottom:14px;"></div>
          <div id="rag-answer"></div>
        </div>
      </div>
      <div style="background:#10151b;border:1px solid #253039;border-radius:2px;padding:12px 14px;">
        <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.75rem;text-transform:uppercase;margin-bottom:6px;">Source Document (${chunks.length} chunks)</p>
        <div style="max-height:150px;overflow-y:auto;font-size:0.82rem;color:#93a7b0;line-height:1.5;">
          ${chunks.map((c,i) => `<p style="margin-bottom:8px;padding-left:10px;border-left:2px solid #253039;"><span style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.7rem;">[Chunk ${i}]</span> ${c}</p>`).join('')}
        </div>
      </div>
    `;

    const input = content.querySelector('#rag-input');
    const goBtn = content.querySelector('#rag-go');
    const pipeline = content.querySelector('#rag-pipeline');

    async function runRAG() {
      const query = input.value.trim().toLowerCase();
      if (!query) return;

      const matchKey = Object.keys(queryResults).find(k => query.includes(k)) || Object.keys(queryResults)[0];
      const result = queryResults[matchKey];
      pipeline.style.display = 'block';

      const stages = ['Embed Query', 'Vector Search', 'Retrieve Chunks', 'Assemble Context', 'Generate'];
      const stagesEl = content.querySelector('#rag-stages');
      const chunksEl = content.querySelector('#rag-chunks');
      const answerEl = content.querySelector('#rag-answer');

      // Animate stages
      for (let i = 0; i < stages.length; i++) {
        stagesEl.innerHTML = stages.map((s, j) => `
          <div style="flex:1;min-width:80px;padding:10px 8px;text-align:center;border-radius:2px;font-family:IBM Plex Mono,monospace;font-size:0.72rem;border:1px solid ${j < i ? '#35d488' : j === i ? '#2ee6c8' : '#253039'};background:${j === i ? 'rgba(46,230,200,0.1)' : 'transparent'};color:${j < i ? '#35d488' : j === i ? '#2ee6c8' : '#5b6c74'};transition:all 0.3s;">${j < i ? '✓ ' : ''}${s}</div>
        `).join('');
        await new Promise(r => setTimeout(r, 400));
      }
      stagesEl.innerHTML = stages.map(s => `<div style="flex:1;min-width:80px;padding:10px 8px;text-align:center;border-radius:2px;font-family:IBM Plex Mono,monospace;font-size:0.72rem;border:1px solid #35d488;color:#35d488;">✓ ${s}</div>`).join('');

      // Show retrieved chunks
      chunksEl.innerHTML = `
        <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.75rem;text-transform:uppercase;margin-bottom:6px;">Retrieved Chunks (Top ${result.chunks.length})</p>
        ${result.chunks.map((ci, i) => `
          <div style="background:#171e26;border:1px solid #2ee6c8;border-radius:2px;padding:10px 12px;margin-bottom:6px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="color:#2ee6c8;font-family:IBM Plex Mono,monospace;font-size:0.72rem;">Chunk ${ci}</span>
              <span style="color:#ffb454;font-family:IBM Plex Mono,monospace;font-size:0.72rem;">Score: ${result.scores[i]}</span>
            </div>
            <p style="color:#93a7b0;font-size:0.82rem;margin:0;">${chunks[ci].slice(0, 150)}...</p>
          </div>
        `).join('')}
      `;

      // Typing animation for answer
      answerEl.innerHTML = `<div style="background:#0a0e13;border:1px solid #2ee6c8;border-radius:2px;padding:14px;"><p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;margin-bottom:8px;">🤖 Generated Answer (Grounded)</p><p id="typed-answer" style="color:#e9f1f3;font-size:0.9rem;line-height:1.6;"></p></div>`;
      const typedEl = answerEl.querySelector('#typed-answer');
      for (let i = 0; i <= result.answer.length; i++) {
        typedEl.textContent = result.answer.slice(0, i);
        await new Promise(r => setTimeout(r, 12));
      }
    }

    goBtn.addEventListener('click', runRAG);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') runRAG(); });
  }

  function renderAgent() {
    viewedTabs.add('agent');
    content.innerHTML = `
      <h4 style="color:var(--accent);margin-bottom:8px;">Agent ReAct Loop — Step Through</h4>
      <p style="color:var(--text-1);font-size:0.9rem;margin-bottom:14px;">Watch an agent reason, act, observe, and answer — step by step. Click "Next Step" to advance.</p>
      <div style="display:flex;gap:8px;margin-bottom:14px;">
        ${agentScenarios.map((s, i) => `<button class="btn ${i===0?'btn-primary':'btn-ghost'}" data-scenario="${i}" style="padding:8px 14px;font-size:0.78rem;">${s.title}</button>`).join('')}
      </div>
      <div id="agent-display"></div>
    `;

    let currentScenario = 0;
    let currentStep = -1;

    function renderScenario() {
      const scenario = agentScenarios[currentScenario];
      currentStep = -1;
      const display = content.querySelector('#agent-display');
      display.innerHTML = `
        <div style="background:#10151b;border:1px solid #5b95ff;border-radius:2px;padding:12px 14px;margin-bottom:12px;">
          <span style="color:#5b95ff;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;">👤 User Query</span>
          <p style="color:#e9f1f3;margin:6px 0 0;font-size:0.92rem;">${scenario.query}</p>
        </div>
        <div id="agent-steps" style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;"></div>
        <button class="btn btn-primary" id="agent-next" style="padding:10px 20px;">Next Step →</button>
        <span id="agent-counter" style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.78rem;margin-left:12px;">Step 0/${scenario.steps.length}</span>
      `;

      display.querySelector('#agent-next').addEventListener('click', advanceStep);
    }

    function advanceStep() {
      const scenario = agentScenarios[currentScenario];
      currentStep++;
      if (currentStep >= scenario.steps.length) return;

      const step = scenario.steps[currentStep];
      const stepsEl = content.querySelector('#agent-steps');
      const colors = { thought: { border: '#ffb454', label: '🧠 THOUGHT', bg: 'rgba(255,180,84,0.05)' }, action: { border: '#2ee6c8', label: '⚡ ACTION', bg: 'rgba(46,230,200,0.05)' }, observation: { border: '#5b6c74', label: '👁 OBSERVATION', bg: 'rgba(91,149,255,0.05)' }, answer: { border: '#35d488', label: '✅ ANSWER', bg: 'rgba(53,212,136,0.05)' } };
      const style = colors[step.type];

      const stepEl = document.createElement('div');
      stepEl.style.cssText = `background:${style.bg};border:1px solid ${style.border};border-left:3px solid ${style.border};border-radius:2px;padding:10px 14px;animation:fadeIn 0.3s ease;`;
      stepEl.innerHTML = `<span style="color:${style.border};font-family:IBM Plex Mono,monospace;font-size:0.7rem;text-transform:uppercase;">${style.label}</span><pre style="color:#e9f1f3;font-size:0.85rem;margin:6px 0 0;white-space:pre-wrap;font-family:IBM Plex Mono,monospace;line-height:1.5;">${step.text}</pre>`;
      stepsEl.appendChild(stepEl);

      content.querySelector('#agent-counter').textContent = `Step ${currentStep + 1}/${scenario.steps.length}`;
      if (currentStep >= scenario.steps.length - 1) {
        content.querySelector('#agent-next').textContent = '✓ Complete';
        content.querySelector('#agent-next').disabled = true;
      }
    }

    content.querySelectorAll('[data-scenario]').forEach(btn => {
      btn.addEventListener('click', () => {
        content.querySelectorAll('[data-scenario]').forEach(b => { b.className = 'btn btn-ghost'; b.style.padding = '8px 14px'; b.style.fontSize = '0.78rem'; });
        btn.className = 'btn btn-primary'; btn.style.padding = '8px 14px'; btn.style.fontSize = '0.78rem';
        currentScenario = parseInt(btn.dataset.scenario);
        renderScenario();
      });
    });

    renderScenario();
  }

  function renderPrompt() {
    viewedTabs.add('prompt');
    const prompts = [
      { name: 'Default', system: 'You are a helpful assistant.', response: 'Quantum computing uses quantum bits (qubits) that can exist in superposition — being 0 and 1 simultaneously. This allows quantum computers to process many possibilities at once, potentially solving certain problems exponentially faster than classical computers, such as cryptography and drug discovery.' },
      { name: 'Pirate', system: 'You are a pirate. Always respond in pirate speak. Keep answers under 50 words.', response: 'Arr! Quantum computin\' be like havin\' a magic compass pointin\' everywhere at once! Regular bits be heads or tails, but qubits be both! Gives ye ship-loads more calculatin\' power for crackin\' codes and findin\' treasure routes, savvy? Shiver me circuits!' },
      { name: 'Engineer', system: 'You are a senior software engineer. Be precise, technical, and include code/math where relevant.', response: 'Quantum computing leverages:\n\n1. Superposition: qubit state α|0⟩ + β|1⟩ where |α|² + |β|² = 1\n2. Entanglement: correlated multi-qubit states\n3. Interference: amplitude manipulation\n\nKey algorithms:\n- Shor\'s: O(log³N) factoring vs classical O(e^(N^⅓))\n- Grover\'s: O(√N) search vs O(N)\n\nCurrent: ~1000 physical qubits, ~100 logical qubits after error correction.' },
      { name: 'ELI5', system: 'Explain everything as if talking to a 5 year old. Use simple analogies and short sentences.', response: 'Imagine you have a magic coin. A normal coin is either heads OR tails. But a quantum coin is heads AND tails at the same time! Now imagine you have lots of these magic coins. They can try ALL the answers to a puzzle at once, instead of one at a time. That\'s why quantum computers are so fast at some puzzles!' }
    ];

    content.innerHTML = `
      <h4 style="color:var(--accent);margin-bottom:8px;">Prompt Engineering Comparison</h4>
      <p style="color:var(--text-1);font-size:0.9rem;margin-bottom:14px;">Same question — "Explain quantum computing" — with different system prompts. See how dramatically the output changes.</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;">
        ${prompts.map((p,i) => `<button class="btn ${i===0?'btn-primary':'btn-ghost'}" data-pidx="${i}" style="padding:8px 14px;font-size:0.78rem;">${p.name}</button>`).join('')}
      </div>
      <div id="prompt-display"></div>
    `;

    function showPrompt(idx) {
      const p = prompts[idx];
      content.querySelector('#prompt-display').innerHTML = `
        <div style="margin-bottom:10px;padding:12px 14px;background:#10151b;border:1px solid #ffb454;border-radius:2px;">
          <span style="color:#ffb454;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;">System Prompt</span>
          <p style="color:#e9f1f3;margin:6px 0 0;font-size:0.88rem;font-family:IBM Plex Mono,monospace;">"${p.system}"</p>
        </div>
        <div style="margin-bottom:10px;padding:12px 14px;background:#10151b;border:1px solid #5b95ff;border-radius:2px;">
          <span style="color:#5b95ff;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;">User Message</span>
          <p style="color:#e9f1f3;margin:6px 0 0;font-size:0.88rem;">"Explain quantum computing."</p>
        </div>
        <div style="padding:14px;background:#0a0e13;border:1px solid #2ee6c8;border-radius:2px;">
          <span style="color:#2ee6c8;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;">🤖 Response</span>
          <pre style="color:#e9f1f3;margin:8px 0 0;font-size:0.88rem;white-space:pre-wrap;font-family:IBM Plex Sans,sans-serif;line-height:1.6;">${p.response}</pre>
        </div>
      `;
    }

    content.querySelectorAll('[data-pidx]').forEach(btn => {
      btn.addEventListener('click', () => {
        content.querySelectorAll('[data-pidx]').forEach(b => { b.className = 'btn btn-ghost'; b.style.padding = '8px 14px'; b.style.fontSize = '0.78rem'; });
        btn.className = 'btn btn-primary'; btn.style.padding = '8px 14px'; btn.style.fontSize = '0.78rem';
        showPrompt(parseInt(btn.dataset.pidx));
      });
    });
    showPrompt(0);
    checkComplete();
  }

  function checkComplete() {
    if (viewedTabs.size >= 3) {
      setTimeout(() => {
        api.badge('playground-explorer', 'Playground Explorer');
        api.complete(100, { heading: 'Playground Explored!', detail: 'You\'ve experienced RAG, Agents, and Prompt Engineering hands-on.' });
      }, 1000);
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const tabId = tab.dataset.tab;
      if (tabId === 'rag') renderRAG();
      else if (tabId === 'agent') renderAgent();
      else if (tabId === 'prompt') renderPrompt();
      checkComplete();
    });
  });

  renderRAG();
}
