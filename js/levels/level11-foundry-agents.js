// level11-foundry-agents.js — Building Agents in Foundry (interactive agent builder)

const agentParts = {
  model: {
    label: 'Model',
    options: [
      { name: 'gpt-4o', desc: 'Best overall quality. 128K context. Multimodal.', cost: '$$$$', speed: '●●○○' },
      { name: 'gpt-4o-mini', desc: 'Great quality at 10x lower cost. 128K context.', cost: '$$', speed: '●●●○' },
      { name: 'o1', desc: 'Advanced reasoning. Chain-of-thought built in.', cost: '$$$$$', speed: '●○○○' },
      { name: 'Phi-3.5', desc: 'Small & fast. Good for simple tasks.', cost: '$', speed: '●●●●' },
    ]
  },
  tools: {
    label: 'Tools',
    options: [
      { name: 'Code Interpreter', desc: 'Execute Python in sandbox. Data analysis, charts, math.', icon: '🐍' },
      { name: 'File Search', desc: 'Vector search over uploaded documents. Built-in RAG.', icon: '📄' },
      { name: 'Bing Grounding', desc: 'Real-time web search for current information.', icon: '🌐' },
      { name: 'Custom Function', desc: 'Your own API: DB queries, email, tickets, etc.', icon: '⚡' },
    ]
  },
  knowledge: {
    label: 'Knowledge',
    options: [
      { name: 'Product Docs', desc: '500 pages of product documentation', size: '~2MB' },
      { name: 'API Reference', desc: 'OpenAPI specs + code samples', size: '~800KB' },
      { name: 'Support Tickets', desc: 'Historical resolved tickets (anonymized)', size: '~5MB' },
      { name: 'Company Policies', desc: 'HR, security, compliance documents', size: '~1MB' },
    ]
  },
  pattern: {
    label: 'Orchestration',
    options: [
      { name: 'Single Agent', desc: 'One agent handles everything. Simple but limited.', diagram: '[ User ] → [ Agent ] → [ Tools ]' },
      { name: 'Supervisor', desc: 'Boss agent delegates to specialists.', diagram: '[ User ] → [ Supervisor ] → [ Agent A | Agent B | Agent C ]' },
      { name: 'Sequential', desc: 'Pipeline: each agent processes then hands off.', diagram: '[ User ] → [ Planner ] → [ Executor ] → [ Reviewer ]' },
      { name: 'Swarm', desc: 'Peer agents hand off based on topic.', diagram: '[ User ] ↔ [ Agent A ↔ Agent B ↔ Agent C ]' },
    ]
  }
};

const quiz = [
  { q: 'The Foundry Agent Service manages:', opts: ['Only inference', 'Full orchestration: conversation state, tool execution, file management, and knowledge retrieval', 'Only storage', 'Only deployment'], correct: 1 },
  { q: 'Declarative (YAML) vs code-first agents:', opts: ['Always YAML', 'YAML for simple/prototyping; code-first for complex logic & production', 'Always code', 'Identical results'], correct: 1 },
  { q: 'Code Interpreter lets the agent:', opts: ['Modify its source', 'Run Python in a sandbox — data analysis, charts, math', 'Interpret languages', 'Deploy code'], correct: 1 },
  { q: 'Conversation threads are important because:', opts: ['They\'re faster', 'They maintain persistent state (history, files, results) across messages', 'They reduce costs', 'They\'re required'], correct: 1 },
  { q: 'A supervisor pattern means:', opts: ['All agents run simultaneously', 'One agent delegates to specialists and synthesizes results', 'Agents compete', 'No coordination'], correct: 1 }
];

export function mount(container, api) {
  let quizScore = 0, answered = 0;
  let selectedModel = null;
  let selectedTools = new Set();
  let selectedKnowledge = new Set();
  let selectedPattern = null;

  // --- INTERACTIVE AGENT BUILDER ---
  const builderCard = document.createElement('div');
  builderCard.className = 'card';
  builderCard.innerHTML = `
    <h3>🏗️ Interactive Agent Builder</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Configure an agent by selecting components. Watch the agent.yaml and architecture diagram update live as you make choices.</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <!-- Left: Configuration -->
      <div>
        <!-- Model Selection -->
        <div style="margin-bottom:16px;">
          <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;margin-bottom:8px;">1. Choose Model</p>
          <div style="display:flex;flex-direction:column;gap:6px;" id="model-options">
            ${agentParts.model.options.map(m => `
              <div class="model-opt" data-model="${m.name}" style="background:#10151b;border:1px solid #253039;border-radius:2px;padding:10px 12px;cursor:pointer;transition:all 0.15s;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <span style="color:#e9f1f3;font-weight:600;font-size:0.88rem;">${m.name}</span>
                  <span style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;">Cost: ${m.cost} | Speed: ${m.speed}</span>
                </div>
                <p style="color:#93a7b0;font-size:0.8rem;margin:4px 0 0;">${m.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tool Selection -->
        <div style="margin-bottom:16px;">
          <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;margin-bottom:8px;">2. Add Tools (multi-select)</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;" id="tool-options">
            ${agentParts.tools.options.map(t => `
              <div class="tool-opt" data-tool="${t.name}" style="background:#10151b;border:1px solid #253039;border-radius:2px;padding:8px 12px;cursor:pointer;transition:all 0.15s;flex:1;min-width:140px;">
                <span style="font-size:1.1rem;">${t.icon}</span>
                <span style="color:#e9f1f3;font-size:0.82rem;font-weight:600;margin-left:6px;">${t.name}</span>
                <p style="color:#93a7b0;font-size:0.72rem;margin:4px 0 0;">${t.desc}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Knowledge -->
        <div style="margin-bottom:16px;">
          <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;margin-bottom:8px;">3. Add Knowledge (multi-select)</p>
          <div style="display:flex;flex-wrap:wrap;gap:6px;" id="knowledge-options">
            ${agentParts.knowledge.options.map(k => `
              <div class="know-opt" data-know="${k.name}" style="background:#10151b;border:1px solid #253039;border-radius:2px;padding:8px 12px;cursor:pointer;transition:all 0.15s;">
                <span style="color:#e9f1f3;font-size:0.82rem;font-weight:600;">📁 ${k.name}</span>
                <span style="color:#5b6c74;font-size:0.7rem;margin-left:6px;">${k.size}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Pattern -->
        <div>
          <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;margin-bottom:8px;">4. Orchestration Pattern</p>
          <div style="display:flex;flex-direction:column;gap:6px;" id="pattern-options">
            ${agentParts.pattern.options.map(p => `
              <div class="pattern-opt" data-pattern="${p.name}" style="background:#10151b;border:1px solid #253039;border-radius:2px;padding:10px 12px;cursor:pointer;transition:all 0.15s;">
                <span style="color:#e9f1f3;font-weight:600;font-size:0.85rem;">${p.name}</span>
                <p style="color:#93a7b0;font-size:0.78rem;margin:2px 0 0;">${p.desc}</p>
                <code style="color:#2ee6c8;font-size:0.72rem;background:#05070a;padding:2px 6px;border-radius:2px;display:inline-block;margin-top:4px;">${p.diagram}</code>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- Right: Live YAML + Diagram -->
      <div>
        <div style="position:sticky;top:80px;">
          <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;margin-bottom:8px;">📄 Generated agent.yaml</p>
          <pre id="yaml-output" style="background:#05070a;border:1px solid #253039;border-radius:2px;padding:14px;font-family:IBM Plex Mono,monospace;font-size:0.78rem;color:#93a7b0;line-height:1.6;min-height:200px;overflow-x:auto;white-space:pre;"></pre>
          <p style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.72rem;text-transform:uppercase;margin:14px 0 8px;">🏛️ Architecture</p>
          <div id="arch-diagram" style="background:#05070a;border:1px solid #253039;border-radius:2px;padding:14px;min-height:80px;display:flex;align-items:center;justify-content:center;"></div>
        </div>
      </div>
    </div>
  `;
  container.appendChild(builderCard);

  function updateYaml() {
    const yaml = builderCard.querySelector('#yaml-output');
    const arch = builderCard.querySelector('#arch-diagram');

    let yamlStr = `<span style="color:#5b6c74;"># agent.yaml</span>\n`;
    yamlStr += `<span style="color:#2ee6c8;">model:</span> <span style="color:#ffb454;">${selectedModel || '<choose a model>'}</span>\n`;
    yamlStr += `<span style="color:#2ee6c8;">instructions:</span> <span style="color:#93a7b0;">"You are a helpful AI assistant..."</span>\n`;

    if (selectedTools.size > 0) {
      yamlStr += `<span style="color:#2ee6c8;">tools:</span>\n`;
      for (const t of selectedTools) {
        if (t === 'Custom Function') {
          yamlStr += `  - <span style="color:#5b95ff;">type:</span> function\n    <span style="color:#5b95ff;">name:</span> <span style="color:#ffb454;">custom_tool</span>\n`;
        } else {
          yamlStr += `  - <span style="color:#ffb454;">${t.toLowerCase().replace(/ /g, '_')}</span>\n`;
        }
      }
    }

    if (selectedKnowledge.size > 0) {
      yamlStr += `<span style="color:#2ee6c8;">knowledge:</span>\n`;
      for (const k of selectedKnowledge) {
        yamlStr += `  - <span style="color:#5b95ff;">path:</span> <span style="color:#ffb454;">./data/${k.toLowerCase().replace(/ /g, '-')}/</span>\n`;
      }
    }

    if (selectedPattern) {
      yamlStr += `<span style="color:#2ee6c8;">orchestration:</span> <span style="color:#ffb454;">${selectedPattern.toLowerCase()}</span>\n`;
    }

    yaml.innerHTML = yamlStr;

    // Architecture diagram
    const parts = [];
    if (selectedModel) parts.push(`<span style="background:#ffb454;color:#05070a;padding:4px 10px;border-radius:2px;font-size:0.75rem;font-weight:700;">${selectedModel}</span>`);
    if (selectedTools.size) parts.push(`<span style="background:#b478ff33;border:1px solid #b478ff;padding:4px 10px;border-radius:2px;font-size:0.72rem;color:#b478ff;">${selectedTools.size} tool${selectedTools.size>1?'s':''}</span>`);
    if (selectedKnowledge.size) parts.push(`<span style="background:#5b95ff22;border:1px solid #5b95ff;padding:4px 10px;border-radius:2px;font-size:0.72rem;color:#5b95ff;">${selectedKnowledge.size} knowledge</span>`);
    if (selectedPattern) parts.push(`<span style="background:#2ee6c822;border:1px solid #2ee6c8;padding:4px 10px;border-radius:2px;font-size:0.72rem;color:#2ee6c8;">${selectedPattern}</span>`);

    arch.innerHTML = parts.length
      ? `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><span style="color:#5b6c74;font-size:0.75rem;font-family:IBM Plex Mono,monospace;">[ User ] →</span> ${parts.join(' <span style="color:#5b6c74;">+</span> ')}</div>`
      : `<span style="color:#5b6c74;font-family:IBM Plex Mono,monospace;font-size:0.82rem;">Select components to see architecture...</span>`;
  }

  // Model selection
  builderCard.querySelectorAll('.model-opt').forEach(el => {
    el.addEventListener('click', () => {
      builderCard.querySelectorAll('.model-opt').forEach(e => { e.style.borderColor = '#253039'; e.style.background = '#10151b'; });
      el.style.borderColor = '#ffb454';
      el.style.background = '#ffb45410';
      selectedModel = el.dataset.model;
      updateYaml();
    });
  });

  // Tool multi-select
  builderCard.querySelectorAll('.tool-opt').forEach(el => {
    el.addEventListener('click', () => {
      const tool = el.dataset.tool;
      if (selectedTools.has(tool)) {
        selectedTools.delete(tool);
        el.style.borderColor = '#253039'; el.style.background = '#10151b';
      } else {
        selectedTools.add(tool);
        el.style.borderColor = '#b478ff'; el.style.background = '#b478ff10';
      }
      updateYaml();
    });
  });

  // Knowledge multi-select
  builderCard.querySelectorAll('.know-opt').forEach(el => {
    el.addEventListener('click', () => {
      const know = el.dataset.know;
      if (selectedKnowledge.has(know)) {
        selectedKnowledge.delete(know);
        el.style.borderColor = '#253039'; el.style.background = '#10151b';
      } else {
        selectedKnowledge.add(know);
        el.style.borderColor = '#5b95ff'; el.style.background = '#5b95ff10';
      }
      updateYaml();
    });
  });

  // Pattern selection
  builderCard.querySelectorAll('.pattern-opt').forEach(el => {
    el.addEventListener('click', () => {
      builderCard.querySelectorAll('.pattern-opt').forEach(e => { e.style.borderColor = '#253039'; e.style.background = '#10151b'; });
      el.style.borderColor = '#2ee6c8'; el.style.background = '#2ee6c810';
      selectedPattern = el.dataset.pattern;
      updateYaml();
    });
  });

  updateYaml();

  // --- QUIZ ---
  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="fa-quiz"></div>`;
  container.appendChild(quizCard);

  const qc = quizCard.querySelector('#fa-quiz');
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
          if (quizScore >= 80) api.badge('agent-builder', 'Agent Builder');
          api.complete(quizScore, { heading: 'Foundry Agents Mastered!', badge: quizScore >= 80 ? { name: 'Agent Builder' } : null });
        }, 800);
      }
    });
  });
}
