// level9-bridge.js — From Notebook to Production: The Gap

const gaps = [
  { title: 'The Notebook Comfort Zone', icon: '📓', desc: 'In a notebook: single user, no auth, no versioning, manual execution, results disappear on restart. You paste your API key, run cells, see output. It works! ...for you, right now, on your machine.' },
  { title: 'Prompt & Model Versioning', icon: '📋', desc: 'Which prompt version gave the best results? Which model version? Can you reproduce last week\'s outputs? In production: prompt registries, A/B testing, version control, rollback capabilities.' },
  { title: 'Evaluation at Scale', icon: '📊', desc: 'You tested 5 examples manually. But will it work on 10,000 diverse inputs? Automated evaluation pipelines: run batches, measure groundedness/relevance/coherence, detect regressions before users see them.' },
  { title: 'Safety & Guardrails', icon: '🛡️', desc: 'Content filtering, PII detection, jailbreak resistance, output validation, rate limiting. In a notebook you trust yourself. In production, you face adversarial users, edge cases, and compliance requirements.' },
  { title: 'Authentication & RBAC', icon: '🔐', desc: 'Who can access which models? Which data sources? Role-Based Access Control, managed identities (no API keys in code), audit logs. Enterprise security is non-negotiable.' },
  { title: 'Tracing & Observability', icon: '🔍', desc: 'When an agent fails in production: which tool call went wrong? What was the retrieval quality? How long did each step take? OpenTelemetry traces, structured logging, alerting on anomalies.' },
  { title: 'Scaling & Cost Management', icon: '📈', desc: 'Auto-scaling for traffic spikes, provisioned throughput for latency guarantees, token budgets, cost attribution per team/feature. A notebook doesn\'t have a bill — production does.' },
  { title: 'CI/CD & Deployment', icon: '🚀', desc: 'Infrastructure as Code, blue/green deployments, staging environments, automated testing gates, rollback on failure. The LLMOps lifecycle: develop → evaluate → deploy → monitor → iterate.' }
];

const quiz = [
  { q: 'The biggest risk of moving a notebook prototype directly to production is:', opts: ['It will be too slow', 'No evaluation, safety, auth, versioning, or monitoring — failures will be invisible and potentially dangerous', 'The code won\'t run', 'Users won\'t like the UI'], correct: 1 },
  { q: 'Why is automated evaluation critical for production AI?', opts: ['It\'s cheaper than manual testing', 'Manual testing of 5 examples doesn\'t catch regressions across thousands of diverse inputs — you need systematic measurement', 'Regulators require it', 'It makes the model smarter'], correct: 1 },
  { q: 'What does "observability" mean for AI systems?', opts: ['Making the UI pretty', 'Being able to trace exactly what happened in any request — retrieval, reasoning, tool calls, latency — to debug failures', 'Watching users in real-time', 'Open-sourcing the model'], correct: 1 },
  { q: 'Microsoft Foundry addresses the notebook-to-production gap by providing:', opts: ['A better notebook', 'An integrated platform for model management, evaluation, tracing, safety, deployment, and monitoring', 'A faster GPU', 'A different programming language'], correct: 1 },
  { q: '"LLMOps" is the lifecycle of:', opts: ['Training larger models', 'Develop → Evaluate → Deploy → Monitor → Iterate for production AI applications', 'Managing GPU clusters', 'Writing better prompts'], correct: 1 }
];

export function mount(container, api) {
  let quizScore = 0, answered = 0;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>The Production Gap</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">What changes when you go from "it works in my notebook" to "it serves 10,000 users reliably"?</p>
    <div class="concept-grid">
      ${gaps.map(g => `
        <div class="concept-card">
          <h4>${g.icon} ${g.title}</h4>
          <p>${g.desc}</p>
        </div>
      `).join('')}
    </div>
  `;
  container.appendChild(card);

  const bridgeCard = document.createElement('div');
  bridgeCard.className = 'card';
  bridgeCard.innerHTML = `
    <h3>Enter: Microsoft Foundry</h3>
    <p style="color:var(--text-1);">Microsoft Foundry (formerly Azure AI Studio / Azure AI Foundry) is the unified platform that bridges this gap. It provides:</p>
    <ul style="color:var(--text-1);line-height:1.8;padding-left:20px;margin-top:12px;">
      <li><strong style="color:var(--accent)">Model Catalog</strong> — GPT-4o, Llama, Phi, Mistral + deploy with one click</li>
      <li><strong style="color:var(--accent)">Agent Service</strong> — Build, test, deploy agents with tools & knowledge</li>
      <li><strong style="color:var(--accent)">Evaluation</strong> — Built-in + custom evaluators, batch runs, continuous monitoring</li>
      <li><strong style="color:var(--accent)">Tracing</strong> — OpenTelemetry-based request tracing for every agent step</li>
      <li><strong style="color:var(--accent)">Safety</strong> — Content filters, PII detection, jailbreak protection</li>
      <li><strong style="color:var(--accent)">Deployment</strong> — azd CLI, Bicep IaC, RBAC, managed endpoints</li>
    </ul>
    <p style="color:var(--text-2);margin-top:14px;font-size:0.88rem;">The next levels dive deep into each of these capabilities.</p>
  `;
  container.appendChild(bridgeCard);

  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="b-quiz"></div>`;
  container.appendChild(quizCard);

  const qc = quizCard.querySelector('#b-quiz');
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
          if (quizScore >= 80) api.badge('bridge-builder', 'Bridge Builder');
          api.complete(quizScore, { heading: 'Bridge Crossed!', detail: 'You understand why production AI needs a platform.', badge: quizScore >= 80 ? { name: 'Bridge Builder' } : null });
        }, 800);
      }
    });
  });
}
