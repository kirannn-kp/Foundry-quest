// level13-deploy.js — Deploy, Scale & Monitor

const sections = [
  { title: 'Azure Developer CLI (azd)', desc: 'The CLI for deploying AI apps: `azd init` → scaffold. `azd provision` → create Azure resources (Bicep IaC). `azd deploy` → push code. `azd up` → provision + deploy in one command. Templates for common patterns (RAG app, agent, API).' },
  { title: 'Infrastructure as Code (Bicep)', desc: 'Define all Azure resources declaratively in .bicep files: AI Services, search indexes, app services, networking. Repeatable, version-controlled, reviewable. No clicking in portals — everything is code.' },
  { title: 'RBAC & Managed Identity', desc: 'Role-Based Access Control: assign minimum permissions. Managed Identity: your app authenticates to Azure services without secrets. Roles: Cognitive Services User, Search Index Data Reader, Storage Blob Reader. Zero secrets in code or config.' },
  { title: 'Managed Endpoints', desc: 'Deploy models as managed online endpoints: auto-scaling, load balancing, health checks, blue/green deployment. A/B testing: route 10% traffic to new model version, measure quality, then promote or rollback.' },
  { title: 'CI/CD Pipeline', desc: 'GitHub Actions or Azure DevOps: on PR → run evaluations → gate deployment. On merge to main → deploy to staging → run integration tests → promote to production. Automated quality gates prevent shipping regressions.' },
  { title: 'Monitoring & Alerting', desc: 'Azure Monitor + Application Insights: track latency, error rates, token usage, cost. Custom metrics: evaluation scores over time, retrieval quality. Alerts: "groundedness dropped below 4.0" → page on-call.' },
  { title: 'Cost Management', desc: 'Token budgets per team/feature. PTU reservations for predictable costs. Serverless for dev. Cost attribution tags on resources. Monitor spend dashboards. Set hard limits to prevent runaway costs from agent loops.' },
  { title: 'Production Patterns', desc: 'Circuit breaker: fallback to simpler model if primary fails. Retry with exponential backoff. Request queuing for burst traffic. Caching frequent queries. Semantic caching (cache by meaning, not exact match). Rate limiting per user/tenant.' }
];

const quiz = [
  { q: '`azd up` does:', opts: ['Only deploys code', 'Provisions all Azure infrastructure (from Bicep) AND deploys your application code in one command', 'Only creates the resource group', 'Deletes resources'], correct: 1 },
  { q: 'Managed Identity eliminates the need for:', opts: ['Azure subscriptions', 'API keys and secrets in code — the app authenticates to services automatically via its identity', 'RBAC roles', 'Monitoring'], correct: 1 },
  { q: 'Blue/green deployment with managed endpoints lets you:', opts: ['Deploy twice as fast', 'Route a percentage of traffic to a new version, measure quality, then promote or rollback safely', 'Use two different models simultaneously forever', 'Reduce costs by 50%'], correct: 1 },
  { q: 'A CI/CD quality gate for AI applications should include:', opts: ['Only unit tests', 'Automated evaluation runs that block deployment if quality metrics (groundedness, relevance) regress', 'Manual approval only', 'Only security scans'], correct: 1 },
  { q: 'Semantic caching differs from traditional caching by:', opts: ['Being slower', 'Caching by meaning similarity — "What\'s the weather?" and "How\'s the weather today?" return the same cached result', 'Using more memory', 'Not working with LLMs'], correct: 1 }
];

export function mount(container, api) {
  let quizScore = 0, answered = 0;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Deploy, Scale & Monitor</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Taking your AI application from code to production — reliably, securely, at scale.</p>
    ${sections.map(s => `
      <div class="accordion-item"><div class="accordion-head"><span>${s.title}</span><span class="chev">▾</span></div>
        <div class="accordion-body"><p>${s.desc}</p></div></div>
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
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="d-quiz"></div>`;
  container.appendChild(quizCard);

  const qc = quizCard.querySelector('#d-quiz');
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
          if (quizScore >= 80) api.badge('deploy-captain', 'Deploy Captain');
          api.complete(quizScore, { heading: 'Deployment Mastered!', detail: 'You\'ve completed the full AI → Foundry journey!', badge: quizScore >= 80 ? { name: 'Deploy Captain' } : null });
        }, 800);
      }
    });
  });
}
