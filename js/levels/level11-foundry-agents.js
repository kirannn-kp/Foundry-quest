// level11-foundry-agents.js — Building Agents in Foundry

const sections = [
  { title: 'Foundry Agent Service', desc: 'A managed service for building AI agents. Handles: conversation state, tool execution, file management, and knowledge retrieval. You define the agent (model + instructions + tools) — Foundry handles the orchestration loop.' },
  { title: 'Declarative vs Code-First', desc: 'Declarative: define agents in YAML (agent.yaml) — model, instructions, tools, knowledge. Quick to prototype, easy to version. Code-first: Python SDK for full control — custom logic, dynamic tool selection, complex workflows. Use declarative for simple agents, code-first for production.' },
  { title: 'Built-in Tools', desc: 'Code Interpreter: runs Python in a sandbox (data analysis, charts, file processing). File Search: vector search over uploaded documents (built-in RAG). Bing Grounding: real-time web search for current information. Azure AI Search: enterprise RAG over your indexed data.' },
  { title: 'Custom Tools (Function Calling)', desc: 'Define your own tools: name, description, JSON schema for parameters. The agent decides when to call them. You implement the execution. Examples: database queries, API calls, sending emails, creating tickets.' },
  { title: 'Knowledge & Files', desc: 'Upload documents to your agent: PDFs, Word, code files. Foundry auto-chunks, embeds, and indexes them. The agent can search this knowledge base during conversations. Supports vector stores for large document collections.' },
  { title: 'Conversation Threads', desc: 'Agents maintain state across messages in a "thread." Thread stores: message history, file attachments, tool call results. Threads persist — users can return to conversations. Server-side state management (not just prompt stuffing).' },
  { title: 'Multi-Agent Patterns', desc: 'Handoff: agent A transfers to agent B when topic changes. Supervisor: one agent delegates to specialists. Sequential: pipeline of agents each processing the output of the previous. Foundry supports these via the Agent Framework SDK.' },
  { title: 'agent.yaml Structure', desc: 'model: gpt-4o\\ninstructions: "You are..."\\ntools:\\n  - code_interpreter\\n  - file_search\\n  - type: function\\n    name: get_weather\\n    description: "..."\\nknowledge:\\n  - path: ./docs/' }
];

const quiz = [
  { q: 'The Foundry Agent Service manages:', opts: ['Only model inference', 'The full orchestration loop: conversation state, tool execution, file management, and knowledge retrieval', 'Only file storage', 'Only deployment'], correct: 1 },
  { q: 'When should you use declarative (YAML) vs code-first agents?', opts: ['Always use YAML', 'YAML for simple agents & prototyping; code-first for complex logic, dynamic tools, and production workflows', 'Always use code-first', 'They produce identical results'], correct: 1 },
  { q: 'The "Code Interpreter" built-in tool lets the agent:', opts: ['Modify its own source code', 'Run Python in a secure sandbox — for data analysis, charts, math, file processing', 'Interpret human language better', 'Deploy code to production'], correct: 1 },
  { q: 'Conversation "threads" in Foundry are important because:', opts: ['They make responses faster', 'They maintain persistent state (history, files, tool results) across messages — enabling multi-turn interactions', 'They reduce costs', 'They\'re required by OpenAI'], correct: 1 },
  { q: 'In a multi-agent "supervisor" pattern:', opts: ['All agents run simultaneously', 'One agent delegates tasks to specialized agents and synthesizes their results', 'Agents compete against each other', 'There is no supervisor — all agents are equal'], correct: 1 }
];

export function mount(container, api) {
  let quizScore = 0, answered = 0;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Building Agents in Foundry</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">From simple chatbots to multi-agent systems — how Foundry makes agent development production-ready.</p>
    ${sections.map(s => `
      <div class="accordion-item"><div class="accordion-head"><span>${s.title}</span><span class="chev">▾</span></div>
        <div class="accordion-body"><p style="white-space:pre-wrap;">${s.desc}</p></div></div>
    `).join('')}
  `;
  container.appendChild(card);

  card.querySelectorAll('.accordion-item').forEach(item => {
    item.querySelector('.accordion-head').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      card.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

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
