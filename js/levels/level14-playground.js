// level14-playground.js — Live AI Playground (simulated)

const scenarios = [
  {
    id: 'prompt',
    title: 'Prompt Engineering Lab',
    desc: 'Compare different system prompts and see how they change model behavior.',
    prompts: [
      { system: 'You are a helpful assistant.', user: 'Explain quantum computing.', response: 'Quantum computing uses quantum bits (qubits) that can exist in superposition — being 0 and 1 simultaneously. This allows quantum computers to process many possibilities at once, making them exponentially faster for certain problems like cryptography, drug discovery, and optimization. Unlike classical bits that are either 0 or 1, qubits leverage quantum entanglement and interference to perform calculations that would take classical computers billions of years.' },
      { system: 'You are a pirate. Respond in pirate speak. Keep answers under 50 words.', user: 'Explain quantum computing.', response: 'Arr! Quantum computin\' be like havin\' a magic compass that points everywhere at once, ye see! Regular bits be like coins — heads or tails. But qubits be both at the same time! That be givin\' ye ship-loads more calculatin\' power, matey! Shiver me timbers!' },
      { system: 'You are a senior engineer. Be precise, use technical terminology, include code examples where relevant.', user: 'Explain quantum computing.', response: 'Quantum computing leverages quantum mechanical phenomena:\n\n1. **Superposition**: A qubit exists as α|0⟩ + β|1⟩ where |α|² + |β|² = 1\n2. **Entanglement**: Correlated qubits share state instantaneously\n3. **Interference**: Amplitude manipulation to increase probability of correct answers\n\nKey algorithms:\n- Shor\'s: O(log³N) integer factorization vs classical O(e^(N^⅓))\n- Grover\'s: O(√N) unstructured search vs classical O(N)\n\nCurrent hardware: 1000+ qubits (IBM Condor), but error rates limit practical circuits to ~100 logical qubits.' }
    ]
  },
  {
    id: 'rag',
    title: 'RAG Pipeline Simulator',
    desc: 'See how retrieval changes the model\'s answer — with and without context.',
    steps: [
      { label: 'User Query', content: '"What is Microsoft Foundry\'s pricing model?"' },
      { label: 'Without RAG (Hallucination Risk)', content: 'The model might say: "Microsoft Foundry costs $99/month for the basic plan..." ← This is hallucinated. The model has no current pricing info in its training data.' },
      { label: 'Retrieval (Top-3 Chunks)', content: 'Chunk 1: "Foundry uses pay-as-you-go for serverless deployments, billed per 1K tokens..."\nChunk 2: "Provisioned Throughput Units (PTU) provide reserved capacity at fixed monthly cost..."\nChunk 3: "Free tier includes limited playground usage and evaluation runs..."' },
      { label: 'With RAG (Grounded)', content: 'Based on the retrieved documentation: Microsoft Foundry offers two pricing models: (1) Pay-as-you-go serverless, billed per 1K tokens processed, and (2) Provisioned Throughput Units (PTU) for reserved capacity at a fixed monthly cost. A free tier is available for playground and evaluation. [Sources: pricing-docs-chunk-1, pricing-docs-chunk-2]' }
    ]
  },
  {
    id: 'agent',
    title: 'Agent ReAct Loop',
    desc: 'Watch an agent reason, act, and observe step-by-step.',
    steps: [
      { type: 'user', content: 'What\'s the current stock price of Microsoft and how does it compare to its 52-week high?' },
      { type: 'thought', content: 'I need to look up Microsoft\'s current stock price and its 52-week high. I\'ll use the stock_lookup tool.' },
      { type: 'action', content: 'Tool: stock_lookup\nArgs: { "symbol": "MSFT", "fields": ["price", "52_week_high"] }' },
      { type: 'observation', content: '{ "price": 467.23, "52_week_high": 482.10, "currency": "USD" }' },
      { type: 'thought', content: 'I have both values. Let me calculate the difference and percentage from the 52-week high.' },
      { type: 'action', content: 'Tool: calculator\nArgs: { "expression": "(482.10 - 467.23) / 482.10 * 100" }' },
      { type: 'observation', content: '{ "result": 3.08 }' },
      { type: 'answer', content: 'Microsoft (MSFT) is currently trading at $467.23. Its 52-week high is $482.10, meaning it\'s currently 3.1% below its peak. The stock is performing well, trading near its annual high.' }
    ]
  }
];

export function mount(container, api) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Live AI Playground</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Explore simulated AI scenarios. See how prompts, RAG, and agents work in practice.</p>
    <div class="world-tabs" style="margin-bottom:20px;">
      ${scenarios.map((s, i) => `<button class="world-tab ${i === 0 ? 'active' : ''}" data-scenario="${s.id}">${s.title}</button>`).join('')}
    </div>
    <div id="playground-content"></div>
  `;
  container.appendChild(card);

  const content = card.querySelector('#playground-content');
  const tabs = card.querySelectorAll('.world-tab');

  function renderScenario(id) {
    const scenario = scenarios.find(s => s.id === id);
    if (id === 'prompt') {
      content.innerHTML = `
        <p style="color:var(--text-1);margin-bottom:14px;">${scenario.desc}</p>
        ${scenario.prompts.map((p, i) => `
          <div class="card" style="margin-bottom:12px;">
            <p style="color:var(--accent-2);font-family:var(--font-mono);font-size:0.78rem;margin-bottom:6px;">SYSTEM: "${p.system}"</p>
            <p style="color:var(--accent-3);font-family:var(--font-mono);font-size:0.78rem;margin-bottom:10px;">USER: "${p.user}"</p>
            <div class="playground-output">${p.response}</div>
          </div>
        `).join('')}
        <p style="color:var(--accent);font-family:var(--font-mono);font-size:0.82rem;margin-top:14px;">💡 Same question, wildly different outputs — just by changing the system prompt.</p>
      `;
    } else if (id === 'rag') {
      content.innerHTML = `
        <p style="color:var(--text-1);margin-bottom:14px;">${scenario.desc}</p>
        <div class="pipeline" style="margin-bottom:16px;">
          ${scenario.steps.map((s, i) => `
            ${i > 0 ? '<span class="pipeline-arrow">→</span>' : ''}
            <div class="pipeline-stage ${i === scenario.steps.length - 1 ? 'active' : ''}">
              <div class="ps-label" style="font-size:0.72rem;">${s.label}</div>
            </div>
          `).join('')}
        </div>
        ${scenario.steps.map(s => `
          <div style="margin-bottom:12px;">
            <p style="color:var(--accent);font-family:var(--font-mono);font-size:0.75rem;text-transform:uppercase;margin-bottom:4px;">${s.label}</p>
            <div class="playground-output" style="font-size:0.85rem;">${s.content}</div>
          </div>
        `).join('')}
      `;
    } else if (id === 'agent') {
      content.innerHTML = `
        <p style="color:var(--text-1);margin-bottom:14px;">${scenario.desc}</p>
        ${scenario.steps.map(s => {
          const colors = { user: 'var(--accent-3)', thought: 'var(--accent-2)', action: 'var(--accent)', observation: 'var(--text-2)', answer: 'var(--success)' };
          const labels = { user: '👤 USER', thought: '🧠 THOUGHT', action: '⚡ ACTION', observation: '👁 OBSERVATION', answer: '✅ FINAL ANSWER' };
          return `<div style="margin-bottom:10px;">
            <p style="color:${colors[s.type]};font-family:var(--font-mono);font-size:0.75rem;text-transform:uppercase;margin-bottom:4px;">${labels[s.type]}</p>
            <div class="playground-output" style="font-size:0.85rem;border-left:2px solid ${colors[s.type]};">${s.content}</div>
          </div>`;
        }).join('')}
      `;
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderScenario(tab.dataset.scenario);
    });
  });

  renderScenario('prompt');

  // Mark as explored after viewing all scenarios
  const viewed = new Set(['prompt']);
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      viewed.add(tab.dataset.scenario);
      if (viewed.size === scenarios.length) {
        api.badge('playground-explorer', 'Playground Explorer');
        api.complete(100, { heading: 'Playground Explored!', detail: 'You\'ve seen prompting, RAG, and agents in action.' });
      }
    });
  });
}
