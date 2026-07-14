// level2-ml-fundamentals.js — How Machines Learn: supervised, unsupervised, reinforcement.

const concepts = [
  { id: 'supervised', title: 'Supervised Learning', icon: '📊', desc: 'Learn from labeled examples. Given inputs and correct outputs, find the mapping function.', examples: 'Spam detection, image classification, price prediction', keyIdea: 'You need labeled training data — human-annotated examples of input→output pairs.' },
  { id: 'unsupervised', title: 'Unsupervised Learning', icon: '🔍', desc: 'Find hidden patterns in unlabeled data. No correct answers provided — discover structure.', examples: 'Customer segmentation, anomaly detection, dimensionality reduction', keyIdea: 'The algorithm discovers groupings and patterns humans might miss.' },
  { id: 'reinforcement', title: 'Reinforcement Learning', icon: '🎮', desc: 'Learn by trial and error. An agent takes actions in an environment and receives rewards/penalties.', examples: 'Game playing (AlphaGo), robotics, RLHF for LLMs', keyIdea: 'No labeled data needed — just a reward signal. The agent maximizes cumulative reward.' },
  { id: 'features', title: 'Features & Representations', icon: '🧩', desc: 'Features are the measurable properties of data that models use to make predictions.', examples: 'Pixel values for images, word frequencies for text, age/income for customers', keyIdea: 'Feature engineering was the bottleneck — deep learning automates this by learning representations.' },
  { id: 'training', title: 'Training & Inference', icon: '⚙️', desc: 'Training: adjust model parameters to minimize error on training data. Inference: use the trained model to make predictions on new data.', examples: 'Training: hours/days on GPUs. Inference: milliseconds per prediction.', keyIdea: 'Training is expensive and done once. Inference is cheap and done millions of times.' },
  { id: 'overfitting', title: 'Overfitting & Generalization', icon: '📈', desc: 'Overfitting: memorizing training data instead of learning patterns. The model works perfectly on training data but fails on new data.', examples: 'A model that memorizes exam answers but can\'t solve new problems', keyIdea: 'The goal is generalization — performing well on data the model has never seen.' },
  { id: 'loss', title: 'Loss Functions & Optimization', icon: '📉', desc: 'A loss function measures how wrong the model\'s predictions are. Training = minimizing this loss using gradient descent.', examples: 'MSE for regression, cross-entropy for classification', keyIdea: 'Gradient descent iteratively adjusts parameters in the direction that reduces error.' },
  { id: 'evaluation', title: 'Evaluation Metrics', icon: '✅', desc: 'Accuracy isn\'t enough. Precision (of positives, how many are correct?), Recall (of actual positives, how many were found?), F1 score, AUC-ROC.', examples: 'Medical diagnosis: recall matters more (don\'t miss cancer). Spam filter: precision matters more (don\'t lose good email).', keyIdea: 'The right metric depends on the cost of different types of errors.' }
];

const quiz = [
  { q: 'A model trained to classify emails as spam/not-spam using 10,000 labeled emails is an example of:', opts: ['Unsupervised learning', 'Supervised learning', 'Reinforcement learning', 'Transfer learning'], correct: 1 },
  { q: 'RLHF (used to align ChatGPT) combines which two approaches?', opts: ['Supervised + Unsupervised', 'Supervised + Reinforcement', 'Unsupervised + Reinforcement', 'None — it\'s a new paradigm'], correct: 1 },
  { q: 'Your model gets 99% accuracy on training data but 60% on test data. This is:', opts: ['Underfitting', 'Overfitting', 'Good generalization', 'A feature engineering problem'], correct: 1 },
  { q: 'Why did deep learning reduce the need for manual feature engineering?', opts: ['It uses more data', 'It automatically learns useful representations from raw data', 'It runs faster', 'It doesn\'t — you still need feature engineering'], correct: 1 },
  { q: 'In a medical screening test, which metric matters most to avoid missing actual disease cases?', opts: ['Precision', 'Recall', 'Accuracy', 'F1 Score'], correct: 1 }
];

export function mount(container, api) {
  let explored = new Set();
  let quizScore = 0;
  let answered = 0;

  // Concepts section
  const conceptsCard = document.createElement('div');
  conceptsCard.className = 'card';
  conceptsCard.innerHTML = `
    <h3>Core ML Concepts</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Explore all 8 concepts to unlock the quiz. Click each card to expand.</p>
    <div class="concept-grid" id="concepts-grid">
      ${concepts.map(c => `
        <div class="concept-card accordion-item" data-id="${c.id}">
          <div class="accordion-head">
            <span>${c.icon} ${c.title}</span>
            <span class="chev">▾</span>
          </div>
          <div class="accordion-body">
            <p><strong>${c.desc}</strong></p>
            <p style="margin-top:8px;"><span style="color:var(--accent-2)">Examples:</span> ${c.examples}</p>
            <p style="margin-top:8px;"><span style="color:var(--accent)">Key Insight:</span> ${c.keyIdea}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  container.appendChild(conceptsCard);

  // Accordion interaction
  conceptsCard.querySelectorAll('.accordion-item').forEach(item => {
    item.querySelector('.accordion-head').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      conceptsCard.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) {
        item.classList.add('open');
        explored.add(item.dataset.id);
        if (explored.size === concepts.length) {
          quizCard.hidden = false;
        }
      }
    });
  });

  // Quiz section
  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.hidden = true;
  quizCard.innerHTML = `
    <h3>Knowledge Check</h3>
    <div id="ml-quiz"></div>
  `;
  container.appendChild(quizCard);

  function renderQuiz() {
    const qc = quizCard.querySelector('#ml-quiz');
    qc.innerHTML = quiz.map((q, qi) => `
      <div class="quiz-q" data-qi="${qi}">
        <p class="qtext">${qi + 1}. ${q.q}</p>
        <div class="quiz-options">
          ${q.opts.map((opt, oi) => `<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}">${opt}</button>`).join('')}
        </div>
      </div>
    `).join('');

    qc.querySelectorAll('.quiz-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        const qi = parseInt(btn.dataset.qi);
        const oi = parseInt(btn.dataset.oi);
        const qDiv = qc.querySelector(`.quiz-q[data-qi="${qi}"]`);
        if (qDiv.dataset.answered) return;
        qDiv.dataset.answered = '1';
        const allOpts = qDiv.querySelectorAll('.quiz-opt');
        allOpts.forEach(o => o.classList.add('disabled'));
        if (oi === quiz[qi].correct) { btn.classList.add('correct'); quizScore += 20; }
        else { btn.classList.add('wrong'); allOpts[quiz[qi].correct].classList.add('correct'); }
        answered++;
        if (answered === quiz.length) {
          setTimeout(() => {
            if (quizScore >= 80) api.badge('ml-scholar', 'ML Scholar');
            api.complete(quizScore, {
              heading: 'ML Fundamentals Mastered!',
              detail: `You scored ${quizScore}/100.`,
              badge: quizScore >= 80 ? { name: 'ML Scholar' } : null,
              recap: [
                { title: 'The Big Three', body: 'Supervised (labeled data), Unsupervised (find patterns), Reinforcement (reward signal).' },
                { title: 'Why It Matters', body: 'Understanding these foundations lets you choose the right approach for any AI problem.' }
              ]
            });
          }, 800);
        }
      });
    });
  }

  // Auto-render quiz when shown
  const observer = new MutationObserver(() => {
    if (!quizCard.hidden && !quizCard.querySelector('.quiz-q')) renderQuiz();
  });
  observer.observe(quizCard, { attributes: true });
}
