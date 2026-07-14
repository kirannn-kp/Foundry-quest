// level5-embeddings.js — Embeddings & Vector Space (with interactive visualization)

const concepts = [
  { title: 'What Are Embeddings?', desc: 'Dense vector representations of data (text, images, audio) in a continuous vector space. "King" → [0.2, -0.4, 0.7, ...] (hundreds of dimensions). Similar meanings → nearby vectors.' },
  { title: 'Why Vectors?', desc: 'Computers can\'t understand "meaning" directly. But they CAN compute distances between numbers. Embeddings convert semantic similarity into geometric proximity — similar things are close in vector space.' },
  { title: 'Cosine Similarity', desc: 'The standard measure: cos(θ) = 1 means identical direction, 0 means orthogonal, -1 means opposite. "cat" and "kitten" → high similarity. "cat" and "javascript" → low similarity.' },
  { title: 'Word2Vec & Analogies', desc: 'King - Man + Woman ≈ Queen. Word2Vec (2013) showed vector arithmetic captures semantic relationships — learned just from predicting neighboring words.' },
  { title: 'Sentence & Document Embeddings', desc: 'Modern models (text-embedding-ada-002, all-MiniLM) embed entire paragraphs into single vectors — enabling semantic search by meaning, not keywords.' },
  { title: 'Vector Databases', desc: 'Pinecone, Weaviate, Azure AI Search, Chroma, Qdrant — store millions of vectors and find nearest neighbors in milliseconds using ANN algorithms like HNSW.' },
  { title: 'ANN Algorithms', desc: 'HNSW builds a navigable graph for O(log n) approximate nearest neighbor search — trading tiny accuracy for massive speed gains in high-dimensional space.' },
  { title: 'Multi-Modal Embeddings', desc: 'CLIP (OpenAI) embeds images AND text into the same vector space. Search images with text queries. Same principle extends to audio, video, code.' }
];

const words = [
  { text: 'cat', x: 0.15, y: 0.25, cluster: 'animal' },
  { text: 'kitten', x: 0.18, y: 0.20, cluster: 'animal' },
  { text: 'dog', x: 0.22, y: 0.30, cluster: 'animal' },
  { text: 'puppy', x: 0.20, y: 0.35, cluster: 'animal' },
  { text: 'wolf', x: 0.28, y: 0.28, cluster: 'animal' },
  { text: 'python', x: 0.70, y: 0.20, cluster: 'tech' },
  { text: 'javascript', x: 0.75, y: 0.25, cluster: 'tech' },
  { text: 'coding', x: 0.68, y: 0.28, cluster: 'tech' },
  { text: 'algorithm', x: 0.72, y: 0.32, cluster: 'tech' },
  { text: 'computer', x: 0.65, y: 0.22, cluster: 'tech' },
  { text: 'pizza', x: 0.40, y: 0.72, cluster: 'food' },
  { text: 'burger', x: 0.45, y: 0.76, cluster: 'food' },
  { text: 'pasta', x: 0.42, y: 0.68, cluster: 'food' },
  { text: 'sushi', x: 0.48, y: 0.70, cluster: 'food' },
  { text: 'king', x: 0.50, y: 0.15, cluster: 'royalty' },
  { text: 'queen', x: 0.55, y: 0.12, cluster: 'royalty' },
  { text: 'prince', x: 0.52, y: 0.20, cluster: 'royalty' },
  { text: 'castle', x: 0.48, y: 0.22, cluster: 'royalty' },
];

const clusterColors = { animal: '#2ee6c8', tech: '#5b95ff', food: '#ffb454', royalty: '#b478ff' };

function computeSim(w1, w2) {
  const dist = Math.sqrt((w1.x - w2.x) ** 2 + (w1.y - w2.y) ** 2);
  return Math.max(0, Math.min(1, 1 - dist * 2.5));
}

const quiz = [
  { q: 'If two text chunks have cosine similarity of 0.95, this means:', opts: ['They are exactly the same text', 'Their meanings are very similar (vectors point in nearly the same direction)', 'They share 95% of their words', 'One is a subset of the other'], correct: 1 },
  { q: 'Why do vector databases use ANN instead of exact search?', opts: ['ANN is more accurate', 'Exact search in high dimensions is too slow at scale — ANN trades tiny accuracy for massive speed', 'ANN uses less storage', 'No difference'], correct: 1 },
  { q: '"King - Man + Woman = Queen" demonstrates:', opts: ['Embeddings capture semantic relationships as vector arithmetic', 'Embeddings are word counts', 'You need labeled data', 'Only works for royalty'], correct: 0 },
  { q: 'Semantic search differs from keyword search by:', opts: ['Being slower', 'Finding results by meaning similarity, not exact word matches', 'Being the same thing', 'Using regex'], correct: 1 },
  { q: 'CLIP is significant because:', opts: ['Fastest LLM', 'Embeds images and text into the same space, enabling cross-modal search', 'Replaced all models', 'Only works with OpenAI'], correct: 1 }
];

export function mount(container, api) {
  let explored = new Set();
  let quizScore = 0, answered = 0;
  let selectedWord = null;

  // --- INTERACTIVE VECTOR SPACE ---
  const vizCard = document.createElement('div');
  vizCard.className = 'card';
  vizCard.innerHTML = `
    <h3>🔬 Interactive Vector Space Explorer</h3>
    <p style="color:var(--text-1);margin-bottom:12px;">Click any word to select it, then click another to measure their similarity. Watch how words in the same semantic cluster are closer together.</p>
    <div class="vec-wrap" style="position:relative;">
      <svg id="vec-svg" class="vector-svg" viewBox="0 0 500 400" style="cursor:crosshair;">
        <circle cx="${0.19*500}" cy="${0.28*400}" r="65" fill="rgba(46,230,200,0.05)" stroke="rgba(46,230,200,0.12)" stroke-dasharray="4 3"/>
        <circle cx="${0.70*500}" cy="${0.25*400}" r="60" fill="rgba(91,149,255,0.05)" stroke="rgba(91,149,255,0.12)" stroke-dasharray="4 3"/>
        <circle cx="${0.43*500}" cy="${0.72*400}" r="50" fill="rgba(255,180,84,0.05)" stroke="rgba(255,180,84,0.12)" stroke-dasharray="4 3"/>
        <circle cx="${0.51*500}" cy="${0.17*400}" r="45" fill="rgba(180,120,255,0.05)" stroke="rgba(180,120,255,0.12)" stroke-dasharray="4 3"/>
        <text x="${0.19*500}" y="${0.28*400+80}" text-anchor="middle" fill="#5b6c74" font-size="9" font-family="IBM Plex Mono">ANIMALS</text>
        <text x="${0.70*500}" y="${0.25*400+75}" text-anchor="middle" fill="#5b6c74" font-size="9" font-family="IBM Plex Mono">PROGRAMMING</text>
        <text x="${0.43*500}" y="${0.72*400+65}" text-anchor="middle" fill="#5b6c74" font-size="9" font-family="IBM Plex Mono">FOOD</text>
        <text x="${0.51*500}" y="${0.05*400}" text-anchor="middle" fill="#5b6c74" font-size="9" font-family="IBM Plex Mono">ROYALTY</text>
        <line id="sim-line" x1="0" y1="0" x2="0" y2="0" stroke="#ffb454" stroke-width="2" stroke-dasharray="5 3" opacity="0"/>
        ${words.map((w,i) => `
          <g class="vec-point" data-idx="${i}" style="cursor:pointer;">
            <circle cx="${w.x*500}" cy="${w.y*400}" r="6" stroke="${clusterColors[w.cluster]}" fill="#171e26" stroke-width="2" data-idx="${i}"/>
            <text x="${w.x*500}" y="${w.y*400-11}" text-anchor="middle" fill="${clusterColors[w.cluster]}" font-size="10" font-family="IBM Plex Mono" data-idx="${i}">${w.text}</text>
          </g>
        `).join('')}
      </svg>
    </div>
    <div id="sim-readout" style="margin-top:12px;padding:12px 14px;background:var(--bg-2);border:1px solid var(--border);border-radius:2px;font-family:var(--font-mono);font-size:0.88rem;min-height:42px;display:flex;align-items:center;">
      <span style="color:#5b6c74;">👆 Click a word to start measuring similarity...</span>
    </div>
    <div id="sim-history" style="margin-top:10px;display:flex;flex-direction:column;gap:4px;max-height:140px;overflow-y:auto;"></div>
  `;
  container.appendChild(vizCard);

  const svg = vizCard.querySelector('#vec-svg');
  const simLine = vizCard.querySelector('#sim-line');
  const readout = vizCard.querySelector('#sim-readout');
  const historyEl = vizCard.querySelector('#sim-history');

  svg.addEventListener('click', (e) => {
    const target = e.target.closest('.vec-point') || (e.target.dataset.idx !== undefined ? e.target.closest('g') : null);
    if (!target) return;
    const idx = parseInt(target.dataset.idx);
    const word = words[idx];
    if (!word) return;

    if (!selectedWord) {
      selectedWord = { idx, word };
      target.querySelector('circle').setAttribute('fill', clusterColors[word.cluster]);
      target.querySelector('circle').setAttribute('r', '9');
      readout.innerHTML = `<span style="color:${clusterColors[word.cluster]};font-weight:700;">"${word.text}"</span> <span style="color:#5b6c74;margin-left:8px;">→ now click another word to measure distance</span>`;
    } else if (selectedWord.idx === idx) {
      target.querySelector('circle').setAttribute('fill', '#171e26');
      target.querySelector('circle').setAttribute('r', '6');
      selectedWord = null;
      simLine.setAttribute('opacity', '0');
      readout.innerHTML = `<span style="color:#5b6c74;">👆 Click a word to start measuring similarity...</span>`;
    } else {
      const sim = computeSim(selectedWord.word, word);
      const pct = (sim * 100).toFixed(1);
      const color = sim > 0.7 ? '#35d488' : sim > 0.4 ? '#ffb454' : '#ff5c5c';

      simLine.setAttribute('x1', selectedWord.word.x * 500);
      simLine.setAttribute('y1', selectedWord.word.y * 400);
      simLine.setAttribute('x2', word.x * 500);
      simLine.setAttribute('y2', word.y * 400);
      simLine.setAttribute('stroke', color);
      simLine.setAttribute('opacity', '0.85');

      readout.innerHTML = `
        <span style="color:${clusterColors[selectedWord.word.cluster]};font-weight:700;">"${selectedWord.word.text}"</span>
        <span style="color:#5b6c74;margin:0 6px;">↔</span>
        <span style="color:${clusterColors[word.cluster]};font-weight:700;">"${word.text}"</span>
        <span style="color:#5b6c74;margin:0 8px;">=</span>
        <span style="color:${color};font-weight:700;font-size:1.1rem;">${pct}%</span>
        <span style="color:#5b6c74;margin-left:8px;font-size:0.8rem;">${sim > 0.7 ? '✓ Very similar!' : sim > 0.4 ? '~ Somewhat related' : '✗ Different concepts'}</span>
      `;

      historyEl.innerHTML = `<div style="display:flex;justify-content:space-between;padding:5px 10px;background:#171e26;border:1px solid #253039;border-radius:2px;font-size:0.78rem;font-family:IBM Plex Mono,monospace;"><span style="color:#93a7b0;">${selectedWord.word.text} ↔ ${word.text}</span><span style="color:${color};font-weight:700;">${pct}%</span></div>` + historyEl.innerHTML;

      // Reset
      const prevG = svg.querySelectorAll('.vec-point')[selectedWord.idx];
      prevG.querySelector('circle').setAttribute('fill', '#171e26');
      prevG.querySelector('circle').setAttribute('r', '6');
      selectedWord = null;
    }
  });

  // --- ANALOGY CALCULATOR ---
  const analogyCard = document.createElement('div');
  analogyCard.className = 'card';
  analogyCard.innerHTML = `
    <h3>🧮 Vector Arithmetic — Analogy Calculator</h3>
    <p style="color:var(--text-1);margin-bottom:14px;">The famous demonstration: <strong style="color:var(--accent)">King</strong> - <strong style="color:var(--danger)">Man</strong> + <strong style="color:var(--success)">Woman</strong> ≈ <strong style="color:var(--accent-3)">Queen</strong>. Try your own!</p>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:14px;">
      <select id="an-a" style="background:#10151b;border:1px solid #253039;color:#2ee6c8;border-radius:2px;padding:8px 12px;font-family:IBM Plex Mono,monospace;font-size:0.88rem;">
        ${words.map(w => `<option value="${w.text}" ${w.text==='king'?'selected':''}>${w.text}</option>`).join('')}
      </select>
      <span style="color:#ff5c5c;font-weight:700;font-size:1.3rem;">−</span>
      <select id="an-b" style="background:#10151b;border:1px solid #253039;color:#ff5c5c;border-radius:2px;padding:8px 12px;font-family:IBM Plex Mono,monospace;font-size:0.88rem;">
        ${words.map(w => `<option value="${w.text}" ${w.text==='prince'?'selected':''}>${w.text}</option>`).join('')}
      </select>
      <span style="color:#35d488;font-weight:700;font-size:1.3rem;">+</span>
      <select id="an-c" style="background:#10151b;border:1px solid #253039;color:#35d488;border-radius:2px;padding:8px 12px;font-family:IBM Plex Mono,monospace;font-size:0.88rem;">
        ${words.map(w => `<option value="${w.text}" ${w.text==='puppy'?'selected':''}>${w.text}</option>`).join('')}
      </select>
      <span style="color:#5b6c74;font-size:1.3rem;">=</span>
      <button class="btn btn-primary" id="an-btn" style="padding:8px 18px;">Compute →</button>
    </div>
    <div id="an-result" style="padding:14px;background:#10151b;border:1px solid #253039;border-radius:2px;font-family:IBM Plex Mono,monospace;color:#5b6c74;min-height:44px;display:flex;align-items:center;">
      Click "Compute" to find the nearest word to the result vector.
    </div>
  `;
  container.appendChild(analogyCard);

  analogyCard.querySelector('#an-btn').addEventListener('click', () => {
    const a = words.find(w => w.text === analogyCard.querySelector('#an-a').value);
    const b = words.find(w => w.text === analogyCard.querySelector('#an-b').value);
    const c = words.find(w => w.text === analogyCard.querySelector('#an-c').value);
    const tx = a.x - b.x + c.x, ty = a.y - b.y + c.y;
    let best = null, bestDist = Infinity;
    for (const w of words) {
      if (w.text === a.text || w.text === b.text || w.text === c.text) continue;
      const d = Math.sqrt((w.x - tx) ** 2 + (w.y - ty) ** 2);
      if (d < bestDist) { bestDist = d; best = w; }
    }
    const conf = Math.max(0, (1 - bestDist * 3) * 100).toFixed(0);
    analogyCard.querySelector('#an-result').innerHTML = `
      <span style="color:#2ee6c8;">${a.text}</span><span style="color:#ff5c5c;"> − ${b.text}</span><span style="color:#35d488;"> + ${c.text}</span>
      <span style="color:#93a7b0;margin:0 10px;">≈</span>
      <span style="color:${clusterColors[best.cluster]};font-weight:700;font-size:1.2rem;text-decoration:underline;">${best.text}</span>
      <span style="color:#5b6c74;margin-left:12px;">(${conf}% confidence)</span>
    `;
  });

  // --- CONCEPTS ---
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `<h3>Embedding Concepts Deep Dive</h3><p style="color:var(--text-1);margin-bottom:12px;">Explore all 8 to unlock the quiz.</p>
    ${concepts.map((c, i) => `<div class="accordion-item" data-idx="${i}"><div class="accordion-head"><span>${c.title}</span><span class="chev">▾</span></div><div class="accordion-body"><p>${c.desc}</p></div></div>`).join('')}`;
  container.appendChild(card);
  card.querySelectorAll('.accordion-item').forEach(item => {
    item.querySelector('.accordion-head').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      card.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) { item.classList.add('open'); explored.add(item.dataset.idx); }
      if (explored.size === concepts.length) quizCard.hidden = false;
    });
  });

  // --- QUIZ ---
  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.hidden = true;
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="e-quiz"></div>`;
  container.appendChild(quizCard);
  const observer = new MutationObserver(() => {
    if (!quizCard.hidden && !quizCard.querySelector('.quiz-q')) {
      const qc = quizCard.querySelector('#e-quiz');
      qc.innerHTML = quiz.map((q, qi) => `<div class="quiz-q" data-qi="${qi}"><p class="qtext">${qi+1}. ${q.q}</p><div class="quiz-options">${q.opts.map((o,oi) => `<button class="quiz-opt" data-qi="${qi}" data-oi="${oi}">${o}</button>`).join('')}</div></div>`).join('');
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
          if (answered === quiz.length) setTimeout(() => {
            if (quizScore >= 80) api.badge('vector-navigator', 'Vector Navigator');
            api.complete(quizScore, { heading: 'Embeddings Mastered!', badge: quizScore >= 80 ? { name: 'Vector Navigator' } : null });
          }, 800);
        });
      });
    }
  });
  observer.observe(quizCard, { attributes: true });
}
