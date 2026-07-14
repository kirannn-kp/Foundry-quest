// level6-rag.js — RAG: Retrieval-Augmented Generation

const pipeline = [
  { icon: '📄', label: 'Document\nIngestion', desc: 'Load documents (PDFs, web pages, databases) into the system. This is your knowledge base — the source of truth the LLM will reference.' },
  { icon: '✂️', label: 'Chunking', desc: 'Split documents into smaller pieces (chunks). Too large = irrelevant content dilutes the answer. Too small = loses context. Typical: 500-1000 tokens with overlap. Strategies: fixed-size, semantic, recursive.' },
  { icon: '🔢', label: 'Embedding', desc: 'Convert each chunk into a vector using an embedding model. Store vectors in a vector database (Azure AI Search, Pinecone, Chroma). This enables semantic search over your knowledge base.' },
  { icon: '🔍', label: 'Retrieval', desc: 'When a user asks a question: embed the query → find top-K most similar chunks via ANN search. Optional: hybrid search (vector + keyword), reranking with a cross-encoder for better precision.' },
  { icon: '📋', label: 'Context\nAssembly', desc: 'Assemble retrieved chunks into a prompt: System message + retrieved context + user question. The LLM now has relevant information to answer from — not just its training data.' },
  { icon: '🤖', label: 'Generation', desc: 'The LLM generates an answer grounded in the retrieved context. It can cite sources, admit when information isn\'t available, and avoid hallucination because it has real data to reference.' }
];

const concepts = [
  { title: 'Why RAG?', desc: 'LLMs have knowledge cutoffs (training data is stale), hallucinate facts, and can\'t access private/enterprise data. RAG solves all three by giving the LLM access to current, verified, domain-specific information at inference time.' },
  { title: 'Chunking Strategies', desc: 'Fixed-size: simple but may split mid-sentence. Recursive: split by paragraph → sentence → character. Semantic: use embeddings to find natural break points. Document-aware: respect headers, tables, code blocks.' },
  { title: 'Hybrid Search', desc: 'Combine vector search (semantic similarity) with keyword search (BM25/TF-IDF). Vector finds meaning; keywords find exact terms. Fusion (RRF - Reciprocal Rank Fusion) merges both ranked lists.' },
  { title: 'Reranking', desc: 'Initial retrieval (bi-encoder) is fast but approximate. A cross-encoder reranker scores each (query, chunk) pair more accurately but is slower. Use it on top-20 results to pick the best top-5.' },
  { title: 'Evaluation Metrics', desc: 'Retrieval: Precision@K, Recall@K, MRR, NDCG. Generation: Groundedness (is the answer supported by context?), Relevance (does it answer the question?), Coherence, Faithfulness.' },
  { title: 'Common Failures', desc: 'Wrong chunks retrieved (embedding quality issue), answer not grounded in context (model ignoring retrieved info), context window overflow (too many chunks), stale index (documents changed but embeddings didn\'t).' }
];

const quiz = [
  { q: 'What is the primary problem RAG solves?', opts: ['Making models run faster', 'Grounding LLM responses in current, factual, domain-specific knowledge to reduce hallucination', 'Reducing model size', 'Replacing the need for LLMs entirely'], correct: 1 },
  { q: 'Why is chunk size important?', opts: ['Larger chunks are always better', 'Smaller chunks are always better', 'Too large = irrelevant noise; too small = lost context. The sweet spot depends on the use case.', 'Chunk size doesn\'t affect quality'], correct: 2 },
  { q: 'Hybrid search combines:', opts: ['Two different LLMs', 'Vector (semantic) search + keyword (BM25) search for better recall', 'Searching two databases simultaneously', 'Embedding + fine-tuning'], correct: 1 },
  { q: 'What does a reranker do in the RAG pipeline?', opts: ['Replaces the vector database', 'Re-scores retrieved chunks more accurately (cross-encoder) to surface the most relevant ones', 'Generates the final answer', 'Chunks the documents'], correct: 1 },
  { q: '"Groundedness" as an evaluation metric measures:', opts: ['How fast the response is generated', 'Whether the generated answer is supported by the retrieved context (not making things up)', 'How many documents were retrieved', 'The embedding quality'], correct: 1 }
];

export function mount(container, api) {
  let quizScore = 0, answered = 0;

  // Pipeline visualization
  const pipeCard = document.createElement('div');
  pipeCard.className = 'card';
  pipeCard.innerHTML = `
    <h3>The RAG Pipeline</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Click each stage to see how documents become grounded AI answers.</p>
    <div class="pipeline" id="rag-pipeline">
      ${pipeline.map((s, i) => `
        ${i > 0 ? '<span class="pipeline-arrow">→</span>' : ''}
        <div class="pipeline-stage" data-idx="${i}">
          <div class="ps-icon">${s.icon}</div>
          <div class="ps-label">${s.label}</div>
        </div>
      `).join('')}
    </div>
    <div class="pipeline-caption" id="pipeline-caption" style="margin-top:14px;padding:12px;background:var(--bg-2);border:1px solid var(--border);border-radius:var(--radius-sm);">
      <p style="color:var(--text-2)">Click a stage above to see details.</p>
    </div>
  `;
  container.appendChild(pipeCard);

  const stages = pipeCard.querySelectorAll('.pipeline-stage');
  stages.forEach(stage => {
    stage.addEventListener('click', () => {
      stages.forEach(s => s.classList.remove('active'));
      stage.classList.add('active');
      const idx = parseInt(stage.dataset.idx);
      pipeCard.querySelector('#pipeline-caption').innerHTML = `<p style="color:var(--text-0);font-weight:600;">${pipeline[idx].label.replace('\n', ' ')}</p><p style="color:var(--text-1);margin-top:6px;">${pipeline[idx].desc}</p>`;
    });
  });

  // Deep-dive concepts
  const conceptCard = document.createElement('div');
  conceptCard.className = 'card';
  conceptCard.innerHTML = `
    <h3>RAG Deep Dive</h3>
    ${concepts.map((c, i) => `
      <div class="accordion-item" data-idx="${i}">
        <div class="accordion-head"><span>${c.title}</span><span class="chev">▾</span></div>
        <div class="accordion-body"><p>${c.desc}</p></div>
      </div>
    `).join('')}
  `;
  container.appendChild(conceptCard);

  conceptCard.querySelectorAll('.accordion-item').forEach(item => {
    item.querySelector('.accordion-head').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      conceptCard.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Quiz
  const quizCard = document.createElement('div');
  quizCard.className = 'card';
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="rag-quiz"></div>`;
  container.appendChild(quizCard);

  const qc = quizCard.querySelector('#rag-quiz');
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
          if (quizScore >= 80) api.badge('rag-engineer', 'RAG Engineer');
          api.complete(quizScore, { heading: 'RAG Pipeline Mastered!', badge: quizScore >= 80 ? { name: 'RAG Engineer' } : null });
        }, 800);
      }
    });
  });
}
