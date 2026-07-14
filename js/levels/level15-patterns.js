// level15-patterns.js — Architecture Patterns Visualized

const patterns = [
  {
    title: 'Simple RAG',
    when: 'Single knowledge base, straightforward Q&A, document lookup',
    components: ['Vector DB', 'Embedding Model', 'LLM', 'Chunked Documents'],
    pros: ['Simple to implement', 'Low latency', 'Easy to debug', 'Works for most use cases'],
    cons: ['Struggles with multi-hop questions', 'Can\'t synthesize across many docs', 'Quality depends on chunking'],
    useCase: 'Customer support bot answering from product docs'
  },
  {
    title: 'Graph RAG',
    when: 'Highly connected data, multi-hop reasoning, global summarization needed',
    components: ['Knowledge Graph', 'Vector DB', 'Entity Extractor', 'Community Detection', 'LLM'],
    pros: ['Handles relationship questions', 'Global summaries', 'Explainable retrieval paths'],
    cons: ['Complex to build & maintain', 'Higher latency', 'Entity extraction errors propagate', 'More expensive'],
    useCase: 'Research assistant navigating scientific papers and their citations'
  },
  {
    title: 'Single Agent + Tools',
    when: 'Multi-step tasks, external API calls, dynamic decision making',
    components: ['LLM (reasoning)', 'Tool definitions', 'Execution layer', 'Memory'],
    pros: ['Flexible — handles diverse tasks', 'Can compose actions', 'Self-correcting via observation'],
    cons: ['Hard to predict behavior', 'Can loop or hallucinate actions', 'Needs guardrails', 'Higher latency'],
    useCase: 'Personal assistant that books meetings, sends emails, queries databases'
  },
  {
    title: 'Multi-Agent System',
    when: 'Complex workflows, specialized subtasks, parallel processing',
    components: ['Supervisor agent', 'Specialist agents', 'Shared memory', 'Orchestration layer'],
    pros: ['Specialized expertise per agent', 'Parallel execution', 'Easier to test individual agents'],
    cons: ['Coordination complexity', 'Higher cost (multiple LLM calls)', 'Debugging across agents is hard'],
    useCase: 'Software engineering pipeline: planner → coder → reviewer → deployer'
  },
  {
    title: 'Fine-tuned Model',
    when: 'Consistent style/format needed, domain-specific language, latency-sensitive, cost-sensitive at scale',
    components: ['Base model', 'Training data', 'Fine-tuning infrastructure', 'Evaluation pipeline'],
    pros: ['Faster inference (no retrieval step)', 'Consistent outputs', 'Lower per-request cost at scale'],
    cons: ['Training data required', 'Can\'t update knowledge without retraining', 'Risk of catastrophic forgetting'],
    useCase: 'Medical note summarization following strict hospital formatting'
  },
  {
    title: 'Hybrid: RAG + Agent + Fine-tuned',
    when: 'Production systems with multiple requirements',
    components: ['Fine-tuned model (base)', 'RAG for current knowledge', 'Agent tools for actions', 'Evaluation layer'],
    pros: ['Best of all worlds', 'Fine-tuned base + RAG for freshness + tools for action'],
    cons: ['Most complex to build and maintain', 'Many failure modes', 'Expensive to operate'],
    useCase: 'Enterprise AI assistant: domain-tuned, searches internal docs, executes workflows'
  }
];

export function mount(container, api) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Architecture Decision Guide</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">Choose the right pattern for your use case. Click each architecture to compare.</p>
    ${patterns.map((p, i) => `
      <div class="accordion-item" data-idx="${i}">
        <div class="accordion-head"><span>${p.title}</span><span class="chev">▾</span></div>
        <div class="accordion-body">
          <p style="color:var(--accent-2);margin-bottom:8px;"><strong>When to use:</strong> ${p.when}</p>
          <p style="margin-bottom:8px;"><strong style="color:var(--accent)">Components:</strong> ${p.components.join(' → ')}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0;">
            <div>
              <p style="color:var(--success);font-weight:600;font-size:0.85rem;margin-bottom:4px;">✓ Pros</p>
              ${p.pros.map(pro => `<p style="color:var(--text-1);font-size:0.85rem;margin:2px 0;">• ${pro}</p>`).join('')}
            </div>
            <div>
              <p style="color:var(--danger);font-weight:600;font-size:0.85rem;margin-bottom:4px;">✗ Cons</p>
              ${p.cons.map(con => `<p style="color:var(--text-1);font-size:0.85rem;margin:2px 0;">• ${con}</p>`).join('')}
            </div>
          </div>
          <p style="color:var(--accent-3);font-size:0.85rem;margin-top:8px;"><strong>Example:</strong> ${p.useCase}</p>
        </div>
      </div>
    `).join('')}
  `;
  container.appendChild(card);

  const viewed = new Set();
  card.querySelectorAll('.accordion-item').forEach(item => {
    item.querySelector('.accordion-head').addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      card.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) {
        item.classList.add('open');
        viewed.add(item.dataset.idx);
        if (viewed.size === patterns.length) {
          api.badge('pattern-analyst', 'Pattern Analyst');
          api.complete(100, { heading: 'All Patterns Explored!', detail: 'You can now choose the right architecture for any AI use case.' });
        }
      }
    });
  });
}
