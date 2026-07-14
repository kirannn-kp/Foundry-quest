// level3-neural-networks.js — Neural Networks & Deep Learning

const layers = [
  { title: 'The Perceptron (1958)', desc: 'A single artificial neuron: takes inputs, multiplies by weights, adds bias, applies activation function. Can only learn linearly separable patterns (AND, OR but not XOR).', key: 'One neuron = one linear decision boundary.' },
  { title: 'Multi-Layer Perceptrons', desc: 'Stack neurons in layers: input layer → hidden layers → output layer. Each connection has a learnable weight. Hidden layers let the network learn non-linear patterns (like XOR).', key: 'More layers = more complex patterns = "deep" learning.' },
  { title: 'Activation Functions', desc: 'Without activation functions, stacking layers is useless (linear × linear = linear). ReLU (max(0,x)) is the most popular — simple, fast, avoids vanishing gradients. Sigmoid squashes to [0,1], Softmax gives probabilities.', key: 'Activations introduce non-linearity — what makes deep networks powerful.' },
  { title: 'Backpropagation', desc: 'How networks learn: 1) Forward pass: compute prediction. 2) Compute loss (how wrong?). 3) Backward pass: compute gradient of loss w.r.t. each weight using chain rule. 4) Update weights using gradient descent.', key: 'Backprop + gradient descent = the training algorithm for all modern deep learning.' },
  { title: 'CNNs — Convolutional Neural Networks', desc: 'Designed for images. Convolutional filters slide over the image detecting patterns (edges → shapes → objects). Key innovations: weight sharing (same filter everywhere), spatial hierarchy, pooling for downsampling.', key: 'CNNs learn visual features automatically — no manual feature engineering for vision.' },
  { title: 'RNNs & LSTMs', desc: 'Designed for sequences (text, time series). Process one token at a time, maintaining a hidden state. Problem: vanishing gradients over long sequences. LSTMs add gates to remember/forget selectively.', key: 'RNNs were the standard for NLP until Transformers replaced them in 2017.' },
  { title: 'The Deep Learning Recipe', desc: '1) Lots of data. 2) Lots of compute (GPUs/TPUs). 3) The right architecture. 4) Good regularization (dropout, batch norm). 5) Careful hyperparameter tuning. This recipe scaled from AlexNet (2012) to GPT-4 (2023).', key: 'Scaling laws: more data + more compute + bigger model = better performance (predictably).' }
];

const quiz = [
  { q: 'Why can\'t a single perceptron solve XOR?', opts: ['It\'s too slow', 'XOR isn\'t linearly separable — you need at least one hidden layer', 'Perceptrons don\'t have activation functions', 'XOR requires unsupervised learning'], correct: 1 },
  { q: 'What is the purpose of backpropagation?', opts: ['To make predictions faster', 'To compute how much each weight contributed to the error, so weights can be updated', 'To add more layers to the network', 'To regularize the model'], correct: 1 },
  { q: 'Why did Transformers replace RNNs for NLP?', opts: ['Transformers use less memory', 'Transformers process all tokens in parallel (not sequentially) and handle long-range dependencies better', 'RNNs can\'t process text', 'Transformers don\'t need training data'], correct: 1 },
  { q: 'What do CNNs learn in their early layers vs. deep layers?', opts: ['Early: full objects, Deep: edges', 'Early: low-level features (edges, textures), Deep: high-level concepts (faces, objects)', 'All layers learn the same features', 'Early: colors, Deep: shapes only'], correct: 1 },
  { q: 'The "scaling laws" observation means:', opts: ['Bigger models are always worse', 'Performance improves predictably with more data, compute, and parameters', 'You need exponentially more data for each new layer', 'Only small models can be trained efficiently'], correct: 1 }
];

export function mount(container, api) {
  let explored = new Set();
  let quizScore = 0, answered = 0;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Neural Network Building Blocks</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Expand each concept to learn how neural networks work from single neurons to deep architectures.</p>
    ${layers.map((l, i) => `
      <div class="accordion-item" data-idx="${i}">
        <div class="accordion-head"><span>${l.title}</span><span class="chev">▾</span></div>
        <div class="accordion-body">
          <p>${l.desc}</p>
          <p style="margin-top:10px;color:var(--accent);font-family:var(--font-mono);font-size:0.85rem;">💡 ${l.key}</p>
        </div>
      </div>
    `).join('')}
  `;
  container.appendChild(card);

  card.querySelectorAll('.accordion-item').forEach(item => {
    item.querySelector('.accordion-head').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      card.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) { item.classList.add('open'); explored.add(item.dataset.idx); }
      if (explored.size === layers.length) quizCard.hidden = false;
    });
  });

  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.hidden = true;
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="nn-quiz"></div>`;
  container.appendChild(quizCard);

  const observer = new MutationObserver(() => {
    if (!quizCard.hidden && !quizCard.querySelector('.quiz-q')) {
      const qc = quizCard.querySelector('#nn-quiz');
      qc.innerHTML = quiz.map((q, qi) => `
        <div class="quiz-q" data-qi="${qi}">
          <p class="qtext">${qi + 1}. ${q.q}</p>
          <div class="quiz-options">${q.opts.map((o, oi) => `<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}">${o}</button>`).join('')}</div>
        </div>
      `).join('');
      qc.querySelectorAll('.quiz-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const qi = parseInt(btn.dataset.qi), oi = parseInt(btn.dataset.oi);
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
              if (quizScore >= 80) api.badge('nn-architect', 'Neural Architect');
              api.complete(quizScore, { heading: 'Deep Learning Mastered!', badge: quizScore >= 80 ? { name: 'Neural Architect' } : null });
            }, 800);
          }
        });
      });
    }
  });
  observer.observe(quizCard, { attributes: true });
}
