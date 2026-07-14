// level10-foundry.js — Microsoft Foundry: The Platform

const sections = [
  { title: 'Foundry Projects', desc: 'The top-level container. A project groups together: model deployments, connections (to data sources, APIs), evaluation runs, agent configurations, and team permissions. Think of it as your AI app\'s workspace.' },
  { title: 'AI Services Resource', desc: 'The Azure resource backing your Foundry project. Provides access to OpenAI models (GPT-4o, o1), plus Azure AI services (speech, vision, language). Manages API keys, endpoints, quotas, and billing.' },
  { title: 'Model Catalog', desc: 'Browse 1,800+ models: OpenAI (GPT-4o, o1, GPT-4o-mini), Meta (Llama 3.1), Microsoft (Phi-3.5), Mistral, Cohere, and more. Filter by task, license, size. Deploy with one click — provisioned throughput or serverless (pay-per-token).' },
  { title: 'Connections', desc: 'Link external resources to your project: Azure AI Search (for RAG), Azure Blob Storage (documents), Azure Cosmos DB, custom APIs. Connections use managed identity — no secrets in code.' },
  { title: 'The Foundry Playground', desc: 'Interactive UI to test prompts, system messages, and parameters (temperature, top-p, max tokens). Compare models side-by-side. Add your data (RAG). Test before you code — rapid experimentation without writing a line.' },
  { title: 'Foundry SDK (Python)', desc: 'The azure-ai-projects SDK: create agents, run evaluations, manage traces programmatically. Code-first workflow for CI/CD integration. Works locally, in notebooks, and in production.' },
  { title: 'Provisioned vs Serverless', desc: 'Provisioned Throughput Units (PTU): reserved capacity, predictable latency, fixed cost. Serverless (pay-per-token): scales to zero, pay only for what you use. PTU for production workloads; serverless for dev/test and spiky traffic.' },
  { title: 'Regions & Quotas', desc: 'Models are available in specific Azure regions. Quotas limit tokens-per-minute per model per subscription. Plan capacity: which model, which region, how much throughput? Foundry shows availability and lets you request quota increases.' }
];

const quiz = [
  { q: 'A Foundry "Project" is:', opts: ['A single model deployment', 'A workspace grouping model deployments, connections, evaluations, and agent configs for an AI application', 'A Python file', 'An Azure subscription'], correct: 1 },
  { q: 'The Model Catalog lets you:', opts: ['Only use GPT-4', 'Browse, compare, and deploy 1800+ models from multiple providers (OpenAI, Meta, Microsoft, Mistral, etc.)', 'Train models from scratch', 'Only use open-source models'], correct: 1 },
  { q: 'Connections in Foundry use managed identity because:', opts: ['It\'s faster', 'No secrets/API keys in code — more secure, auto-rotated, auditable', 'It\'s required by law', 'Managed identity is cheaper'], correct: 1 },
  { q: 'When should you use Provisioned Throughput (PTU) vs Serverless?', opts: ['Always use PTU', 'PTU for production with predictable latency needs; Serverless for dev/test and variable traffic', 'Always use Serverless', 'They\'re the same thing'], correct: 1 },
  { q: 'The Foundry Playground is useful for:', opts: ['Writing production code', 'Rapid prompt experimentation, model comparison, and RAG testing — before writing code', 'Deploying to production', 'Managing Azure subscriptions'], correct: 1 }
];

export function mount(container, api) {
  let quizScore = 0, answered = 0;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Microsoft Foundry: Platform Overview</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">The unified platform for building production AI applications.</p>
    ${sections.map((s, i) => `
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
