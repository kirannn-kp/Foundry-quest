// level5-embeddings.js — Embeddings & Vector Space

const concepts = [
  { title: 'What Are Embeddings?', desc: 'Dense vector representations of data (text, images, audio) in a continuous vector space. "King" → [0.2, -0.4, 0.7, ...] (hundreds of dimensions). Similar meanings → nearby vectors.' },
  { title: 'Why Vectors?', desc: 'Computers can\'t understand "meaning" directly. But they CAN compute distances between numbers. Embeddings convert semantic similarity into geometric proximity — similar things are close in vector space.' },
  { title: 'Cosine Similarity', desc: 'The standard measure of similarity between embeddings. Measures the angle between two vectors (not magnitude). cos(θ) = 1 means identical direction, 0 means orthogonal, -1 means opposite. "cat" and "kitten" have high cosine similarity.' },
  { title: 'Word2Vec & The Analogy Test', desc: 'King - Man + Woman ≈ Queen. Word2Vec (2013) showed that vector arithmetic captures semantic relationships. The model learns these relationships just from predicting neighboring words — no explicit teaching.' },
  { title: 'Sentence & Document Embeddings', desc: 'Modern embedding models (text-embedding-ada-002, all-MiniLM) embed entire sentences/paragraphs into single vectors. This enables semantic search: find documents by meaning, not just keyword matching.' },
  { title: 'Vector Databases', desc: 'Specialized databases (Pinecone, Weaviate, Azure AI Search, Chroma, Qdrant) that store millions of vectors and find nearest neighbors in milliseconds using ANN (Approximate Nearest Neighbor) algorithms like HNSW.' },
  { title: 'ANN Algorithms', desc: 'Finding exact nearest neighbors in high-dimensional space is O(n) — too slow. ANN algorithms (HNSW, IVF, ScaNN) trade tiny accuracy for massive speed gains. HNSW builds a navigable graph for O(log n) search.' },
  { title: 'Multi-Modal Embeddings', desc: 'CLIP (OpenAI) embeds images AND text into the same vector space. Search images with text queries, or find similar images to a text description. Same principle extends to audio, video, code.' }
];

const quiz = [
  { q: 'If two text chunks have cosine similarity of 0.95, this means:', opts: ['They are exactly the same text', 'Their meanings are very similar (vectors point in nearly the same direction)', 'They share 95% of their words', 'One is a subset of the other'], correct: 1 },
  { q: 'Why do vector databases use Approximate Nearest Neighbor instead of exact search?', opts: ['ANN is more accurate', 'Exact search in high dimensions is too slow at scale — ANN trades tiny accuracy for massive speed', 'ANN uses less storage', 'There\'s no difference'], correct: 1 },
  { q: 'The famous "King - Man + Woman = Queen" demonstrates:', opts: ['That word embeddings capture semantic relationships as vector arithmetic', 'That embeddings are just word counts', 'That you need labeled data for embeddings', 'That embeddings only work for royalty-related words'], correct: 0 },
  { q: 'How does semantic search differ from keyword search?', opts: ['Semantic search is slower', 'Semantic search finds results by meaning similarity, not exact word matches', 'They are the same thing', 'Keyword search uses AI, semantic doesn\'t'], correct: 1 },
  { q: 'CLIP is significant because:', opts: ['It\'s the fastest language model', 'It embeds images and text into the same vector space, enabling cross-modal search', 'It replaced all other embedding models', 'It only works with OpenAI\'s API'], correct: 1 }
];

export function mount(container, api) {
  let explored = new Set();
  let quizScore = 0, answered = 0;

  // Visual: 2D embedding space
  const vizCard = document.createElement('div');
  vizCard.className = 'card';
  vizCard.innerHTML = `
    <h3>Visualizing Vector Space</h3>
    <p style="color:var(--text-1);margin-bottom:12px;">In reality, embeddings have hundreds of dimensions. Here's a 2D projection showing how semantically similar words cluster together.</p>
    <div class="vec-wrap">
      <svg class="vector-svg" viewBox="0 0 500 300">
        <!-- Clusters -->
        <circle cx="120" cy="80" r="60" fill="rgba(46,230,200,0.05)" stroke="rgba(46,230,200,0.2)" stroke-dasharray="4 3"/>
        <circle cx="380" cy="90" r="55" fill="rgba(91,149,255,0.05)" stroke="rgba(91,149,255,0.2)" stroke-dasharray="4 3"/>
        <circle cx="250" cy="230" r="50" fill="rgba(255,180,84,0.05)" stroke="rgba(255,180,84,0.2)" stroke-dasharray="4 3"/>
        <!-- Animal cluster -->
        <g class="vec-point"><circle cx="100" cy="70" r="5"/><text x="100" y="55">cat</text></g>
        <g class="vec-point"><circle cx="130" cy="60" r="5"/><text x="130" y="45">kitten</text></g>
        <g class="vec-point"><circle cx="140" cy="95" r="5"/><text x="140" y="115">dog</text></g>
        <g class="vec-point"><circle cx="95" cy="100" r="5"/><text x="95" y="120">puppy</text></g>
        <!-- Tech cluster -->
        <g class="vec-point"><circle cx="370" cy="75" r="5" style="stroke:var(--accent-3)"/><text x="370" y="60">python</text></g>
        <g class="vec-point"><circle cx="400" cy="95" r="5" style="stroke:var(--accent-3)"/><text x="400" y="115">javascript</text></g>
        <g class="vec-point"><circle cx="360" cy="105" r="5" style="stroke:var(--accent-3)"/><text x="360" y="125">coding</text></g>
        <!-- Food cluster -->
        <g class="vec-point"><circle cx="230" cy="220" r="5" style="stroke:var(--accent-2)"/><text x="230" y="205">pizza</text></g>
        <g class="vec-point"><circle cx="270" cy="240" r="5" style="stroke:var(--accent-2)"/><text x="270" y="260">burger</text></g>
        <g class="vec-point"><circle cx="250" cy="210" r="5" style="stroke:var(--accent-2)"/><text x="255" y="200">food</text></g>
        <!-- Labels -->
        <text x="120" y="150" text-anchor="middle" fill="var(--text-2)" font-size="9" font-family="var(--font-mono)">ANIMALS</text>
        <text x="380" y="150" text-anchor="middle" fill="var(--text-2)" font-size="9" font-family="var(--font-mono)">PROGRAMMING</text>
        <text x="250" y="280" text-anchor="middle" fill="var(--text-2)" font-size="9" font-family="var(--font-mono)">FOOD</text>
      </svg>
    </div>
    <p style="color:var(--text-2);font-size:0.82rem;margin-top:8px;">Words with similar meanings cluster together. The distance between "cat" and "kitten" is small; the distance between "cat" and "python" is large.</p>
  `;
  container.appendChild(vizCard);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Embedding Concepts</h3>
    ${concepts.map((c, i) => `
      <div class="accordion-item" data-idx="${i}">
        <div class="accordion-head"><span>${c.title}</span><span class="chev">▾</span></div>
        <div class="accordion-body"><p>${c.desc}</p></div>
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
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="e-quiz"></div>`;
  container.appendChild(quizCard);

  const observer = new MutationObserver(() => {
    if (!quizCard.hidden && !quizCard.querySelector('.quiz-q')) {
      const qc = quizCard.querySelector('#e-quiz');
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
              if (quizScore >= 80) api.badge('vector-navigator', 'Vector Navigator');
              api.complete(quizScore, { heading: 'Embeddings Mastered!', badge: quizScore >= 80 ? { name: 'Vector Navigator' } : null });
            }, 800);
          }
        });
      });
    }
  });
  observer.observe(quizCard, { attributes: true });
}
