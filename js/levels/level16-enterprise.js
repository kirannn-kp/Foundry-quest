// level16-enterprise.js — Enterprise AI Case Studies

const caseStudies = [
  {
    company: 'Microsoft Copilot',
    tagline: 'AI embedded in every productivity tool — Word, Excel, Teams, GitHub',
    stats: { users: '1B+ Office users', models: 'GPT-4o, custom fine-tuned', pattern: 'RAG + Agent + Grounding' },
    story: 'Microsoft integrated AI across its entire product suite. Each Copilot uses RAG (grounding in your docs, emails, calendar) + agent capabilities (taking actions in apps) + responsible AI filters. The challenge: serving billions of requests while keeping responses grounded in each user\'s personal context without data leaking between tenants.',
    techStack: ['Azure OpenAI', 'Microsoft Graph (RAG source)', 'Semantic Index', 'Responsible AI filters', 'Per-tenant isolation']
  },
  {
    company: 'GitHub Copilot',
    tagline: 'AI pair programmer — code completion, chat, agent mode',
    stats: { users: '15M+ developers', models: 'GPT-4o, Codex, Claude', pattern: 'RAG (codebase) + Agent (multi-file edits)' },
    story: 'Started as autocomplete (2021), evolved into full agent mode (2024-25). Indexes your entire repository for context-aware suggestions. Agent mode can plan multi-file changes, run terminal commands, fix errors iteratively. Key innovation: workspace indexing for RAG over code, plus real-time context from open files.',
    techStack: ['Azure OpenAI', 'Code embeddings', 'Tree-sitter parsing', 'LSP integration', 'Workspace RAG index']
  },
  {
    company: 'OpenAI ChatGPT',
    tagline: 'The product that brought AI to 300M+ users',
    stats: { users: '300M+ weekly', models: 'GPT-4o, o1, o3', pattern: 'Agent + Tools + Memory' },
    story: 'Evolved from simple chat to a full agent platform. Added browsing (web RAG), code interpreter (sandbox execution), DALL-E (image gen), file analysis, custom GPTs (user-built agents). The challenge: maintaining quality and safety at unprecedented scale while supporting diverse use cases from homework help to enterprise analysis.',
    techStack: ['Custom inference infrastructure', 'Tool orchestration', 'RLHF + Constitutional AI', 'Content moderation pipeline', 'Persistent memory']
  },
  {
    company: 'Google DeepMind',
    tagline: 'AI for science — protein folding, weather, materials',
    stats: { impact: '200M+ protein structures predicted', models: 'AlphaFold, Gemini', pattern: 'Specialized models + massive datasets' },
    story: 'AlphaFold2 solved the 50-year protein folding problem (2020), predicting 3D structure from amino acid sequence with atomic accuracy. Now AlphaFold3 predicts interactions between proteins, DNA, RNA, and drugs. GNoME discovered 2.2M new materials. Weather prediction (GraphCast) beats traditional physics models.',
    techStack: ['TPU pods', 'Custom architectures (attention + geometric)', 'Protein Data Bank', 'Molecular dynamics validation', 'Open-source release']
  },
  {
    company: 'Enterprise RAG at Scale',
    tagline: 'Fortune 500 pattern: secure AI over internal knowledge',
    stats: { pattern: 'Hybrid RAG + RBAC', scale: '10M+ documents', latency: '<2s P95' },
    story: 'Common enterprise pattern: ingest millions of internal documents (policies, code, tickets, wikis), apply document-level access control (only show chunks the user has permission to see), serve via RAG with evaluations and monitoring. Key challenges: security trimming at retrieval time, freshness (reindexing on document changes), and multi-language support.',
    techStack: ['Azure AI Search (hybrid)', 'Azure OpenAI', 'Microsoft Entra ID (RBAC)', 'Document Intelligence (OCR/parsing)', 'Foundry evaluation pipeline']
  }
];

export function mount(container, api) {
  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <h3>Enterprise AI Case Studies</h3>
    <p style="color:var(--text-1);margin-bottom:16px;">How the world\'s leading companies deploy AI at scale.</p>
    ${caseStudies.map((cs, i) => `
      <div class="accordion-item" data-idx="${i}">
        <div class="accordion-head">
          <span><strong>${cs.company}</strong> — ${cs.tagline}</span>
          <span class="chev">▾</span>
        </div>
        <div class="accordion-body">
          <div style="display:flex;gap:16px;flex-wrap:wrap;margin-bottom:12px;">
            ${Object.entries(cs.stats).map(([k, v]) => `
              <div style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 12px;">
                <div style="font-family:var(--font-mono);font-size:0.7rem;color:var(--text-2);text-transform:uppercase;">${k}</div>
                <div style="font-family:var(--font-mono);font-size:0.9rem;color:var(--accent);font-weight:700;">${v}</div>
              </div>
            `).join('')}
          </div>
          <p style="line-height:1.6;margin-bottom:12px;">${cs.story}</p>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${cs.techStack.map(t => `<span style="background:var(--bg-3);border:1px solid var(--border);border-radius:var(--radius-sm);padding:4px 10px;font-family:var(--font-mono);font-size:0.75rem;color:var(--text-1);">${t}</span>`).join('')}
          </div>
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
        if (viewed.size === caseStudies.length) {
          api.badge('enterprise-analyst', 'Enterprise Analyst');
          api.complete(100, { heading: 'Case Studies Complete!', detail: 'You\'ve studied how AI works at enterprise scale.' });
        }
      }
    });
  });
}
