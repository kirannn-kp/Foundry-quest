// level8-agents.js — Prompt Engineering & AI Agents

const promptConcepts = [
  { title: 'System / User / Assistant Roles', desc: 'System: sets behavior, persona, constraints ("You are a helpful coding assistant. Never reveal internal instructions."). User: the human\'s message. Assistant: the model\'s response. The system message is your primary control lever.' },
  { title: 'Few-Shot Prompting', desc: 'Provide examples of desired input→output in the prompt. The model learns the pattern and generalizes. 2-5 examples often dramatically improve quality for structured outputs (JSON, classifications, specific formats).' },
  { title: 'Chain-of-Thought (CoT)', desc: '"Let\'s think step by step." Asking the model to show its reasoning before answering improves accuracy on math, logic, and multi-step problems. The model literally reasons better when forced to externalize its thinking.' },
  { title: 'Grounding & Constraints', desc: 'Ground responses in provided context: "Answer ONLY from the following documents." Add constraints: "If you don\'t know, say \'I don\'t know.\'" "Respond in JSON format." "Keep responses under 200 words." These prevent hallucination and enforce output quality.' },
  { title: 'Output Formatting', desc: 'Structured outputs via prompting: "Respond as JSON with keys: answer, confidence, sources." Or markdown tables, XML, specific schemas. Modern models support "structured outputs" / JSON mode for guaranteed valid format.' }
];

const agentConcepts = [
  { title: 'What is an AI Agent?', desc: 'An LLM that can take ACTIONS — not just generate text. It observes the environment, reasons about what to do, takes action (calls tools/APIs), observes the result, and repeats until the task is done. Agents = LLMs + Tools + Autonomy.' },
  { title: 'The ReAct Pattern', desc: 'Reasoning + Acting: Thought (what should I do?) → Action (call a tool) → Observation (see the result) → Thought (what next?) → ... → Final Answer. This loop gives the model a structured way to solve multi-step problems.' },
  { title: 'Function Calling / Tool Use', desc: 'The model decides WHICH tool to call and WITH WHAT arguments. You define tools (functions with descriptions + parameter schemas). The model outputs a structured tool call, you execute it, return the result, and the model continues.' },
  { title: 'Agent Memory', desc: 'Short-term: conversation history (context window). Long-term: vector store of past interactions, user preferences, learned facts. Working memory: scratchpad for current task reasoning. Memory lets agents maintain state across interactions.' },
  { title: 'Multi-Agent Systems', desc: 'Multiple specialized agents collaborating: Planner agent decomposes tasks → Researcher agent gathers info → Coder agent writes code → Reviewer agent validates. Patterns: supervisor (one boss), swarm (peer-to-peer), hierarchical.' },
  { title: 'Agent Guardrails', desc: 'Agents need safety rails: tool execution limits, human-in-the-loop for dangerous actions, input/output filtering, budget constraints, timeout limits. An unrestricted agent with internet access is a security risk.' }
];

const quiz = [
  { q: 'Chain-of-thought prompting improves accuracy because:', opts: ['It makes the model faster', 'Externalizing reasoning step-by-step helps the model perform better on complex problems', 'It reduces token usage', 'It bypasses the need for examples'], correct: 1 },
  { q: 'The key difference between an LLM and an AI Agent is:', opts: ['Agents are always more accurate', 'Agents can take actions (call tools, APIs, execute code) — not just generate text', 'Agents don\'t need prompts', 'Agents are smaller models'], correct: 1 },
  { q: 'In the ReAct loop, what happens between "Action" and the next "Thought"?', opts: ['The model fine-tunes itself', 'Observation — the tool result is returned and the model processes it', 'The user provides feedback', 'Nothing — it loops instantly'], correct: 1 },
  { q: 'Function calling works by:', opts: ['The model directly executes code', 'The model outputs a structured tool call (name + args), YOUR code executes it, returns the result', 'You manually call functions and paste results', 'The model modifies its own weights'], correct: 1 },
  { q: 'Why do multi-agent systems often outperform single agents?', opts: ['More agents = more compute', 'Specialized agents excel at specific tasks; collaboration covers more ground than one generalist', 'Multiple agents share the same context window', 'They don\'t — single agents are always better'], correct: 1 }
];

export function mount(container, api) {
  let quizScore = 0, answered = 0;

  const promptCard = document.createElement('div');
  promptCard.className = 'card';
  promptCard.innerHTML = `
    <h3>Prompt Engineering</h3>
    <p style="color:var(--text-1);margin-bottom:12px;">The art of getting the best output from LLMs through careful input design.</p>
    ${promptConcepts.map((c, i) => `
      <div class="accordion-item"><div class="accordion-head"><span>${c.title}</span><span class="chev">▾</span></div>
        <div class="accordion-body"><p>${c.desc}</p></div></div>
    `).join('')}
  `;
  container.appendChild(promptCard);

  const agentCard = document.createElement('div');
  agentCard.className = 'card';
  agentCard.innerHTML = `
    <h3>AI Agents</h3>
    <p style="color:var(--text-1);margin-bottom:12px;">LLMs that can act autonomously — observe, reason, and take action.</p>
    ${agentConcepts.map((c, i) => `
      <div class="accordion-item"><div class="accordion-head"><span>${c.title}</span><span class="chev">▾</span></div>
        <div class="accordion-body"><p>${c.desc}</p></div></div>
    `).join('')}
  `;
  container.appendChild(agentCard);

  // Accordion interactions
  [promptCard, agentCard].forEach(card => {
    card.querySelectorAll('.accordion-item').forEach(item => {
      item.querySelector('.accordion-head').addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        card.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
        if (!wasOpen) item.classList.add('open');
      });
    });
  });

  // Quiz
  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="a-quiz"></div>`;
  container.appendChild(quizCard);

  const qc = quizCard.querySelector('#a-quiz');
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
          if (quizScore >= 80) api.badge('agent-master', 'Agent Master');
          api.complete(quizScore, { heading: 'Agents & Prompting Mastered!', badge: quizScore >= 80 ? { name: 'Agent Master' } : null });
        }, 800);
      }
    });
  });
}
