// level12-eval.js — Evaluate, Trace & Optimize

const sections = [
  { title: 'Why Evaluation Matters', desc: 'You can\'t improve what you can\'t measure. LLM outputs are non-deterministic — the same prompt can give different answers. Systematic evaluation catches regressions, measures quality, and builds confidence for production deployment.' },
  { title: 'Built-in Evaluators', desc: 'Foundry provides evaluators out of the box: Groundedness (is the answer supported by context?), Relevance (does it answer the question?), Coherence (is it well-structured?), Fluency, Similarity. Each returns a 1-5 score with explanation.' },
  { title: 'Custom Evaluators', desc: 'Build your own: Python functions that score outputs on domain-specific criteria. Examples: "Does the response follow our brand voice?", "Are all code snippets syntactically valid?", "Does it correctly cite sources?" Register them in Foundry for reuse.' },
  { title: 'Batch Evaluation', desc: 'Run your agent against a test dataset (questions + expected answers). Evaluate every response automatically. Get aggregate scores, distributions, failure analysis. Run before every deployment to catch regressions.' },
  { title: 'Continuous Evaluation', desc: 'Monitor production traffic: sample real requests, evaluate responses in near-real-time. Alert on quality drops. Dashboard shows trends over time. Catch issues before users report them.' },
  { title: 'OpenTelemetry Tracing', desc: 'Every agent request generates a trace: spans for each step (retrieval, tool calls, LLM inference, post-processing). See latency breakdown, token usage, error points. Foundry\'s trace viewer shows the full request lifecycle.' },
  { title: 'Prompt Optimization', desc: 'Foundry\'s prompt optimizer: give it your prompt + evaluation dataset + target metric. It iteratively rewrites the prompt to maximize scores. Automated prompt engineering — finds improvements you might miss.' },
  { title: 'Red Teaming & Safety Eval', desc: 'Adversarial testing: can the agent be jailbroken? Does it leak system prompts? Does it generate harmful content? Foundry provides safety evaluators and simulated adversarial datasets for systematic red-teaming.' }
];

const quiz = [
  { q: '"Groundedness" evaluates whether:', opts: ['The response is grammatically correct', 'The generated answer is actually supported by the retrieved context — not hallucinated', 'The model is well-trained', 'The response is long enough'], correct: 1 },
  { q: 'Batch evaluation before deployment is important because:', opts: ['It makes the model faster', 'It systematically catches quality regressions across diverse test cases before users are affected', 'It\'s required by Azure', 'It reduces costs'], correct: 1 },
  { q: 'OpenTelemetry traces in Foundry show:', opts: ['Only the final response', 'The complete request lifecycle: each retrieval, tool call, LLM call with latency, tokens, and errors', 'Only errors', 'Only cost information'], correct: 1 },
  { q: 'Continuous evaluation differs from batch evaluation by:', opts: ['Being less accurate', 'Monitoring real production traffic in near-real-time, catching issues as they happen', 'Only running once', 'Not using evaluators'], correct: 1 },
  { q: 'Foundry\'s prompt optimizer works by:', opts: ['Making the model bigger', 'Iteratively rewriting prompts to maximize evaluation scores on your test dataset', 'Replacing the model', 'Adding more examples manually'], correct: 1 }
];

export function mount(container, api) {
  let quizScore = 0, answered = 0;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Evaluation, Tracing & Optimization</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">The tools that make AI systems trustworthy and improvable.</p>
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
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="ev-quiz"></div>`;
  container.appendChild(quizCard);

  const qc = quizCard.querySelector('#ev-quiz');
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
          if (quizScore >= 80) api.badge('eval-expert', 'Eval Expert');
          api.complete(quizScore, { heading: 'Evaluation Mastered!', badge: quizScore >= 80 ? { name: 'Eval Expert' } : null });
        }, 800);
      }
    });
  });
}
