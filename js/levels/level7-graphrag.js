// level7-graphrag.js — Graph RAG & Knowledge Graphs

const concepts = [
  { title: 'What is a Knowledge Graph?', desc: 'A structured representation of real-world entities and their relationships. Nodes = entities (people, concepts, products). Edges = relationships (works_at, is_a, related_to). Unlike vector search, relationships are EXPLICIT, not just implied by proximity.' },
  { title: 'Triples: The Atomic Unit', desc: 'Every fact is a triple: (Subject, Predicate, Object). "Einstein → worked_at → Princeton". "GPT-4 → is_a → LLM". "RAG → uses → Vector_Database". The entire knowledge graph is just millions of these triples.' },
  { title: 'Why Graphs + AI?', desc: 'Vector search finds "similar" content. But it can\'t answer multi-hop questions: "What projects did the manager of the person who wrote this code also work on?" That requires traversing relationships — the graph\'s superpower.' },
  { title: 'Multi-Hop Reasoning', desc: 'Single-hop: "Who manages Alice?" → Bob. Multi-hop: "What department does Alice\'s manager\'s director belong to?" → requires 3 hops across the graph. LLMs + graphs can plan and execute these traversals.' },
  { title: 'Entity Extraction & Linking', desc: 'Building a KG from text: 1) Extract entities (NER). 2) Resolve duplicates (entity linking — "MS", "Microsoft", "MSFT" → same node). 3) Extract relationships between entities. LLMs now do this better than traditional NLP.' },
  { title: 'GraphRAG (Microsoft)', desc: 'Microsoft\'s GraphRAG: 1) Extract entities & relationships from documents into a graph. 2) Detect communities (clusters of related entities). 3) Generate community summaries. 4) At query time: retrieve relevant communities + their summaries + source chunks. Excels at global/summarization questions.' },
  { title: 'Hybrid: Vector + Graph', desc: 'The best of both worlds: Use vector search for semantic similarity (find relevant chunks), then use graph traversal for structured reasoning (follow relationships, multi-hop). Azure AI Search supports both in a single index.' },
  { title: 'When to Use Graph RAG', desc: 'Use Graph RAG when: data is highly interconnected, questions require multi-hop reasoning, you need global summarization across many documents, or you need explainable retrieval paths. Use standard RAG when: questions are single-hop lookups from specific documents.' }
];

const quiz = [
  { q: 'What can a knowledge graph answer that pure vector search cannot?', opts: ['Questions about similar documents', 'Multi-hop relationship questions requiring traversal across connected entities', 'Questions about document formatting', 'Statistical aggregations'], correct: 1 },
  { q: 'A "triple" in a knowledge graph is:', opts: ['Three related documents', 'A (Subject, Predicate, Object) fact like "Einstein → worked_at → Princeton"', 'A 3-dimensional vector', 'Three search results'], correct: 1 },
  { q: 'Microsoft\'s GraphRAG builds community summaries because:', opts: ['It\'s faster than regular summaries', 'They enable answering global/thematic questions that span many documents — something chunked RAG struggles with', 'Communities look nice in visualizations', 'It reduces storage costs'], correct: 1 },
  { q: 'Entity linking solves the problem of:', opts: ['Slow graph traversal', 'The same real-world entity appearing with different names ("MS", "Microsoft", "MSFT") in different documents', 'Missing embeddings', 'Too many relationships'], correct: 1 },
  { q: 'When should you choose standard RAG over GraphRAG?', opts: ['Always — standard RAG is better', 'When questions are simple lookups from specific documents and data isn\'t highly interconnected', 'Never — GraphRAG is always superior', 'When you don\'t have an LLM'], correct: 1 }
];

export function mount(container, api) {
  let explored = new Set();
  let quizScore = 0, answered = 0;

  // Graph visualization
  const vizCard = document.createElement('div');
  vizCard.className = 'card';
  vizCard.innerHTML = `
    <h3>Knowledge Graph Structure</h3>
    <p style="color:var(--text-1);margin-bottom:12px;">A mini knowledge graph showing entities and typed relationships.</p>
    <div class="graph-wrap" style="padding:12px;">
      <svg class="graph-svg" viewBox="0 0 500 280">
        <!-- Nodes -->
        <g class="g-node"><circle cx="250" cy="60" r="22"/><text x="250" y="65" text-anchor="middle" font-size="10">GPT-4</text></g>
        <g class="g-node"><circle cx="100" cy="140" r="22"/><text x="100" y="145" text-anchor="middle" font-size="10">OpenAI</text></g>
        <g class="g-node"><circle cx="400" cy="140" r="22"/><text x="400" y="145" text-anchor="middle" font-size="10">LLM</text></g>
        <g class="g-node"><circle cx="150" cy="240" r="22"/><text x="150" y="245" text-anchor="middle" font-size="10">Microsoft</text></g>
        <g class="g-node"><circle cx="350" cy="240" r="22"/><text x="350" y="245" text-anchor="middle" font-size="10">Foundry</text></g>
        <g class="g-node"><circle cx="250" cy="180" r="22"/><text x="250" y="185" text-anchor="middle" font-size="9">Transformer</text></g>
        <!-- Edges -->
        <g class="g-edge"><line x1="228" y1="68" x2="122" y2="132"/><text x="155" y="90" font-size="9">created_by</text></g>
        <g class="g-edge"><line x1="272" y1="68" x2="378" y2="132"/><text x="340" y="90" font-size="9">is_a</text></g>
        <g class="g-edge"><line x1="100" y1="162" x2="150" y2="220"/><text x="105" y="195" font-size="9">partner</text></g>
        <g class="g-edge"><line x1="150" y1="240" x2="328" y2="240"/><text x="250" y="232" font-size="9">builds</text></g>
        <g class="g-edge"><line x1="250" y1="82" x2="250" y2="158"/><text x="265" y="125" font-size="9">uses</text></g>
        <g class="g-edge"><line x1="272" y1="180" x2="378" y2="152"/><text x="340" y="170" font-size="9">powers</text></g>
      </svg>
    </div>
  `;
  container.appendChild(vizCard);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Graph RAG Concepts</h3>
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
  quizCard.innerHTML = `<h3>Knowledge Check</h3><div id="gr-quiz"></div>`;
  container.appendChild(quizCard);

  const observer = new MutationObserver(() => {
    if (!quizCard.hidden && !quizCard.querySelector('.quiz-q')) {
      const qc = quizCard.querySelector('#gr-quiz');
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
              if (quizScore >= 80) api.badge('graph-explorer', 'Graph Explorer');
              api.complete(quizScore, { heading: 'Graph RAG Mastered!', badge: quizScore >= 80 ? { name: 'Graph Explorer' } : null });
            }, 800);
          }
        });
      });
    }
  });
  observer.observe(quizCard, { attributes: true });
}
