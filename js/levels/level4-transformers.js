// level4-transformers.js — Transformers & Large Language Models

const concepts = [
  { title: 'Self-Attention Mechanism', desc: 'The core innovation. For each token, compute how much it should "attend to" every other token. Creates Query, Key, Value matrices — attention score = softmax(QK^T / √d) × V. This lets the model understand relationships between ANY two tokens regardless of distance.', key: 'Self-attention replaces sequential processing with parallel all-to-all token relationships.' },
  { title: 'Multi-Head Attention', desc: 'Run multiple attention "heads" in parallel, each learning different relationship patterns (one head might learn syntax, another semantics, another coreference). Concatenate and project results.', key: 'Multiple perspectives on the same input — like having several experts analyze text simultaneously.' },
  { title: 'Positional Encoding', desc: 'Since Transformers process all tokens in parallel (no inherent order like RNNs), position information must be explicitly added. Sinusoidal functions or learned embeddings encode "this is the 5th token."', key: 'Without positional encoding, "dog bites man" = "man bites dog" to the model.' },
  { title: 'Encoder-Decoder Architecture', desc: 'Original Transformer: Encoder reads input (bidirectional attention), Decoder generates output (causal/masked attention + cross-attention to encoder). BERT = encoder-only. GPT = decoder-only. T5 = full encoder-decoder.', key: 'GPT\'s decoder-only design won for generation — simpler, scales better, one architecture for everything.' },
  { title: 'Tokenization', desc: 'Text → tokens (subword units). BPE (Byte Pair Encoding) or SentencePiece split text into frequent subwords: "unhappiness" → ["un", "happiness"]. Vocab size ~50K-100K. Each token gets an embedding vector.', key: 'Tokenization determines what the model "sees" — it thinks in tokens, not characters or words.' },
  { title: 'Pre-training & Fine-tuning', desc: 'Pre-training: predict next token on trillions of words (self-supervised). The model learns language, facts, reasoning. Fine-tuning: adapt to specific tasks with smaller labeled datasets. RLHF: align with human preferences.', key: 'Pre-training is where the knowledge lives. Fine-tuning is where the behavior is shaped.' },
  { title: 'Scaling Laws', desc: 'Kaplan et al. (2020): loss decreases as a power law with more compute, data, and parameters. Chinchilla (2022): optimal training = scale data and parameters equally. This is why models keep getting bigger — it predictably works.', key: 'We can predict how good a model will be before training it — just from the budget.' },
  { title: 'Emergent Abilities', desc: 'Capabilities that appear suddenly at certain scale thresholds: chain-of-thought reasoning, few-shot learning, code generation, multilingual transfer. Not present in small models, then suddenly "turn on" in larger ones.', key: 'Nobody designed these abilities — they emerged from scale. This is both exciting and concerning.' }
];

const quiz = [
  { q: 'What problem does self-attention solve that RNNs couldn\'t?', opts: ['Self-attention is faster to implement', 'It captures long-range dependencies without information loss over distance', 'It uses less memory', 'It doesn\'t need training data'], correct: 1 },
  { q: 'GPT is a ___ Transformer while BERT is a ___ Transformer.', opts: ['Encoder-only / Decoder-only', 'Decoder-only / Encoder-only', 'Full encoder-decoder / Full encoder-decoder', 'Decoder-only / Full encoder-decoder'], correct: 1 },
  { q: 'Why does tokenization matter for LLM performance?', opts: ['It only affects speed, not quality', 'It determines what units the model reasons over — poor tokenization = wasted capacity', 'It doesn\'t matter — all tokenizers give the same results', 'It only matters for non-English languages'], correct: 1 },
  { q: 'The Chinchilla scaling law showed that:', opts: ['Bigger models are always better regardless of data', 'You should scale data and model size together — most models were undertrained on data', 'Small models are more efficient', 'Scaling provides no benefit past 10B parameters'], correct: 1 },
  { q: 'RLHF (Reinforcement Learning from Human Feedback) is used to:', opts: ['Pre-train the model on more data', 'Align the model with human preferences for helpfulness and safety', 'Make the model smaller', 'Replace the attention mechanism'], correct: 1 }
];

export function mount(container, api) {
  let explored = new Set();
  let quizScore = 0, answered = 0;

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>The Transformer Architecture & LLMs</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">The architecture behind GPT-4, Claude, Gemini, and every modern LLM. Explore all concepts to unlock the quiz.</p>
    ${concepts.map((c, i) => `
      <div class="accordion-item" data-idx="${i}">
        <div class="accordion-head"><span>${c.title}</span><span class="chev">▾</span></div>
        <div class="accordion-body">
          <p>${c.desc}</p>
          <p style="margin-top:10px;color:var(--accent);font-family:var(--font-mono);font-size:0.85rem;">💡 ${c.key}</p>
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
      if (explored.size === concepts.length) quizCard.hidden = false;
    });
  });

  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.hidden = true;
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="t-quiz"></div>`;
  container.appendChild(quizCard);

  const observer = new MutationObserver(() => {
    if (!quizCard.hidden && !quizCard.querySelector('.quiz-q')) {
      const qc = quizCard.querySelector('#t-quiz');
      qc.innerHTML = quiz.map((q, qi) => `
        <div class="quiz-q" data-qi="${qi}"><p class="qtext">${qi + 1}. ${q.q}</p>
          <div class="quiz-options">${q.opts.map((o, oi) => `<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}">${o}</button>`).join('')}</div>
        </div>`).join('');
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
              if (quizScore >= 80) api.badge('transformer-expert', 'Transformer Expert');
              api.complete(quizScore, { heading: 'Transformers & LLMs Mastered!', badge: quizScore >= 80 ? { name: 'Transformer Expert' } : null });
            }, 800);
          }
        });
      });
    }
  });
  observer.observe(quizCard, { attributes: true });
}
