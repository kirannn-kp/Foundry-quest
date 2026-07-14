// level1-timeline.js — The AI Revolution: interactive timeline from rule-based to agents.

const timelineData = [
  { year: '1950s', title: 'The Birth of AI', text: 'Alan Turing proposes the Turing Test (1950). The Dartmouth Conference (1956) coins "Artificial Intelligence." Early optimism: machines will think like humans within a generation.' },
  { year: '1960s–70s', title: 'Expert Systems & Symbolic AI', text: 'Rule-based systems encode human expertise as IF-THEN rules (MYCIN for medical diagnosis, DENDRAL for chemistry). Knowledge is manually programmed — brittle, expensive, doesn\'t scale.' },
  { year: '1980s', title: 'The First AI Winter', text: 'Expert systems fail to deliver on promises. DARPA cuts funding. The "knowledge bottleneck" — you can\'t manually encode all human knowledge. AI enters its first major winter.' },
  { year: '1990s', title: 'Machine Learning Rises', text: 'Statistical approaches replace hand-coded rules. SVMs, decision trees, and random forests learn patterns FROM data. IBM Deep Blue beats Kasparov (1997). The shift: from programming rules to learning from examples.' },
  { year: '2006–2012', title: 'Deep Learning Breakthrough', text: 'Hinton\'s deep belief networks (2006). GPUs enable training deep neural networks. AlexNet wins ImageNet (2012) by a landslide — CNNs revolutionize computer vision. The deep learning era begins.' },
  { year: '2017', title: 'The Transformer', text: 'Google publishes "Attention Is All You Need." The Transformer architecture replaces RNNs — parallel processing, long-range dependencies, scalable. This single paper changes everything that follows.' },
  { year: '2018–2020', title: 'Pre-trained Language Models', text: 'BERT (2018) proves bidirectional pre-training works. GPT-2 (2019) shows language models can generate coherent text. GPT-3 (2020) demonstrates "few-shot" learning — no fine-tuning needed, just examples in the prompt.' },
  { year: '2022', title: 'ChatGPT & the LLM Revolution', text: 'ChatGPT launches (Nov 2022) — 100M users in 2 months. RLHF makes models helpful and safe. The world realizes: LLMs aren\'t just research tools, they\'re products. Every company pivots to AI.' },
  { year: '2023', title: 'RAG, Agents & Multimodal', text: 'Retrieval-Augmented Generation solves hallucination with external knowledge. GPT-4V adds vision. Function calling enables AI agents that use tools. AutoGPT, LangChain, and agent frameworks explode.' },
  { year: '2024–2025', title: 'Production AI & Platforms', text: 'The focus shifts from "can we build it?" to "can we deploy it safely at scale?" Microsoft Foundry, evaluation frameworks, tracing, responsible AI guardrails. Multi-agent systems tackle complex workflows. AI becomes infrastructure.' }
];

const quizQuestions = [
  { q: 'What fundamental shift happened in the 1990s that differentiated ML from expert systems?', opts: ['Machines got faster processors', 'Systems learned patterns from data instead of manually coded rules', 'AI was renamed to Machine Learning', 'Researchers gave up on intelligence'], correct: 1, hint: 'Think about the knowledge bottleneck problem.' },
  { q: 'Which 2017 paper introduced the architecture that powers all modern LLMs?', opts: ['"Deep Residual Learning" (ResNet)', '"Attention Is All You Need" (Transformer)', '"Generative Adversarial Networks"', '"BERT: Pre-training of Deep Bidirectional Transformers"'], correct: 1, hint: 'It introduced self-attention as the core mechanism.' },
  { q: 'What does RAG solve that pure LLMs struggle with?', opts: ['Slow inference speed', 'Hallucination — by grounding responses in retrieved external knowledge', 'High training costs', 'Limited context windows'], correct: 1, hint: 'LLMs generate plausible but sometimes false information.' },
  { q: 'What is the "production gap" that platforms like Microsoft Foundry address?', opts: ['The gap between CPU and GPU performance', 'The gap between a notebook prototype and a deployed, monitored, safe AI system at scale', 'The gap between open-source and proprietary models', 'The time gap between model training and inference'], correct: 1, hint: 'Think about what happens AFTER you get a model working in a notebook.' },
  { q: 'In what order did these emerge? (earliest to latest)', opts: ['Expert Systems → Deep Learning → Transformers → RAG', 'Deep Learning → Expert Systems → RAG → Transformers', 'Transformers → Expert Systems → Deep Learning → RAG', 'RAG → Transformers → Deep Learning → Expert Systems'], correct: 0, hint: 'Follow the timeline: 1960s → 2012 → 2017 → 2023.' }
];

export function mount(container, api) {
  let viewedNodes = new Set();
  let quizScore = 0;
  let answeredCount = 0;

  // Timeline section
  const timelineCard = document.createElement('div');
  timelineCard.className = 'card';
  timelineCard.innerHTML = `
    <h3>The AI Revolution — Interactive Timeline</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Click each era to explore. View all eras to unlock the quiz.</p>
    <div class="timeline">
      <div class="timeline-track">
        ${timelineData.map((item, i) => `
          <div class="timeline-node" data-idx="${i}">
            <span class="dot"></span>
            <span class="tn-year">${item.year}</span>
            <div class="tn-title">${item.title}</div>
            <div class="tn-panel"><p>${item.text}</p></div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  container.appendChild(timelineCard);

  // Quiz section (initially hidden)
  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.hidden = true;
  quizCard.innerHTML = `
    <h3>Knowledge Check</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Answer 5 questions about the AI timeline. Each correct answer is worth 20 points.</p>
    <div id="quiz-container"></div>
  `;
  container.appendChild(quizCard);

  // Timeline interaction
  const nodes = timelineCard.querySelectorAll('.timeline-node');
  nodes.forEach(node => {
    node.addEventListener('click', () => {
      const idx = parseInt(node.dataset.idx);
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');
      node.classList.add('viewed');
      viewedNodes.add(idx);
      if (viewedNodes.size === timelineData.length) {
        quizCard.hidden = false;
        renderQuiz();
      }
    });
  });

  function renderQuiz() {
    const qContainer = quizCard.querySelector('#quiz-container');
    qContainer.innerHTML = quizQuestions.map((q, qi) => `
      <div class="quiz-q" data-qi="${qi}">
        <div class="qtext-row">
          <p class="qtext">${qi + 1}. ${q.q}</p>
          <button class="hint-btn" data-qi="${qi}">Hint</button>
        </div>
        <div class="hint-box" data-qi="${qi}" hidden>${q.hint}</div>
        <div class="quiz-options">
          ${q.opts.map((opt, oi) => `<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}">${opt}</button>`).join('')}
        </div>
      </div>
    `).join('');

    // Hint buttons
    qContainer.querySelectorAll('.hint-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const hintBox = qContainer.querySelector(`.hint-box[data-qi="${btn.dataset.qi}"]`);
        hintBox.hidden = false;
        btn.disabled = true;
      });
    });

    // Answer buttons
    qContainer.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const qi = parseInt(btn.dataset.qi);
        const oi = parseInt(btn.dataset.oi);
        const qDiv = qContainer.querySelector(`.quiz-q[data-qi="${qi}"]`);
        if (qDiv.dataset.answered) return;
        qDiv.dataset.answered = '1';

        const allOpts = qDiv.querySelectorAll('.quiz-opt');
        allOpts.forEach(o => o.classList.add('disabled'));

        if (oi === quizQuestions[qi].correct) {
          btn.classList.add('correct');
          quizScore += 20;
        } else {
          btn.classList.add('wrong');
          allOpts[quizQuestions[qi].correct].classList.add('correct');
        }

        answeredCount++;
        if (answeredCount === quizQuestions.length) {
          setTimeout(() => {
            const badge = quizScore >= 80 ? { name: 'AI Historian' } : null;
            if (badge) api.badge('ai-historian', 'AI Historian');
            api.complete(quizScore, {
              heading: 'Timeline Mastered!',
              detail: `You scored ${quizScore}/100 on the AI Revolution timeline.`,
              badge,
              recap: [
                { title: 'Key Insight', body: 'AI evolved from hand-coded rules → statistical ML → deep learning → transformers → LLMs → agents.' },
                { title: 'The Pattern', body: 'Each era solved the previous era\'s bottleneck: knowledge → data → compute → architecture → alignment → deployment.' }
              ]
            });
          }, 800);
        }
      });
    });
  }
}
