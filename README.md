# Foundry Quest

Foundry Quest is a free, single-page, browser-based educational game that teaches **AI fundamentals** and **Microsoft Foundry** — from neural networks and embeddings to RAG, agents, and production deployment — through 13 interactive core levels, plus 3 bonus challenges.

No backend, no build step, no login. Everything runs as static HTML/CSS/JS and your progress is saved locally in your browser (`localStorage`).

**Play it live:** [https://kirannn-kp.github.io/Foundry-quest/](https://kirannn-kp.github.io/Foundry-quest/)

## What you'll learn

The complete journey from AI concepts to production deployment:

- **How AI evolved** — from rule-based expert systems to autonomous multi-agent systems
- **Machine Learning fundamentals** — supervised, unsupervised, reinforcement learning
- **Neural Networks & Deep Learning** — perceptrons, backprop, CNNs, RNNs, scaling laws
- **Transformers & LLMs** — self-attention, tokenization, GPT, emergent abilities
- **Embeddings & Vector Space** — cosine similarity, vector databases, ANN algorithms
- **RAG (Retrieval-Augmented Generation)** — chunking, retrieval, reranking, grounding
- **Graph RAG & Knowledge Graphs** — triples, multi-hop reasoning, hybrid retrieval
- **Prompt Engineering & AI Agents** — CoT, ReAct, function calling, multi-agent systems
- **Microsoft Foundry** — the platform, agent service, evaluation, tracing, deployment

## The Levels

| # | World | Level | What you'll learn |
|---|-------|-------|-------------------|
| 1 | AI | The AI Revolution | Interactive timeline: rule-based → ML → deep learning → transformers → LLMs → agents |
| 2 | AI | How Machines Learn | Supervised/unsupervised/RL, features, training vs inference, overfitting, loss functions |
| 3 | AI | Neural Networks & Deep Learning | Perceptrons, layers, backprop, activation functions, CNNs, RNNs, scaling laws |
| 4 | AI | Transformers & LLMs | Self-attention, multi-head attention, positional encoding, tokenization, RLHF, emergent abilities |
| 5 | AI | Embeddings & Vector Space | Vector representations, cosine similarity, Word2Vec, vector databases, ANN, CLIP |
| 6 | AI | RAG: Retrieval-Augmented Generation | Full pipeline: ingestion → chunking → embedding → retrieval → reranking → generation |
| 7 | AI | Graph RAG & Knowledge Graphs | Triples, entity extraction, multi-hop reasoning, Microsoft GraphRAG, hybrid search |
| 8 | AI | Prompt Engineering & AI Agents | System prompts, few-shot, CoT, ReAct loop, function calling, multi-agent patterns |
| 9 | Bridge | From Notebook to Production | The production gap: versioning, evaluation, safety, RBAC, tracing, scaling, CI/CD |
| 10 | Foundry | Microsoft Foundry: The Platform | Projects, AI Services, model catalog, connections, playground, SDK, PTU vs serverless |
| 11 | Foundry | Building Agents in Foundry | Agent Service, declarative vs code-first, built-in tools, custom tools, threads, multi-agent |
| 12 | Foundry | Evaluate, Trace & Optimize | Built-in evaluators, custom evaluators, batch eval, continuous eval, tracing, red-teaming |
| 13 | Foundry | Deploy, Scale & Monitor | azd, Bicep, RBAC, managed endpoints, CI/CD, monitoring, cost management, production patterns |
| Bonus | — | Live AI Playground | Simulated prompt lab, RAG pipeline demo, agent ReAct loop walkthrough |
| Bonus | — | Architecture Patterns | Decision guide: RAG vs GraphRAG vs Agent vs Fine-tuned vs Hybrid |
| Bonus | — | Enterprise AI Case Studies | Microsoft Copilot, GitHub Copilot, ChatGPT, DeepMind, Enterprise RAG at scale |

## Features

- **3 Worlds** — AI Foundations → Bridge → Microsoft Foundry, with a world-tab filter on the level map
- **Sequential unlocking** — complete each level to unlock the next; replay anytime to improve your score
- **Quizzes with hints** — every core level ends with a 5-question quiz (optional hint button with score penalty)
- **Badges** — per-level badges (AI Historian, ML Scholar, Neural Architect, etc.) plus meta-badges (Sharp Mind, Speedrunner, Perfectionist, Completionist)
- **Sound design** — synthesized SFX via Web Audio API (correct/wrong/hint/badge/level-complete) with mute toggle
- **Animated constellation background** — drifting node/edge canvas animation on the landing screen
- **Confetti celebrations** — canvas confetti burst on level completion (gold burst for 90%+)
- **Progress rail** — connected node chain showing your journey through all 13 core levels
- **Shareable score card** — generate a PNG snapshot of your score and badges

## Tech stack

- Vanilla HTML5 / CSS3 / JavaScript (ES modules) — no framework, no bundler, no build step
- Web Audio API for synthesized sound effects (no audio files)
- `<canvas>` for confetti and constellation animations
- `localStorage` for progress, scores, and badges
- Deployed via GitHub Pages using GitHub Actions

## Project structure

```
index.html                  # Single-page app shell (landing, level map, 16 level screens)
css/style.css               # Dark "Palantir" theme, animations, responsive layout
js/
  main.js                   # Navigation, level map, level mounting, results flow, badges
  progress.js               # localStorage-backed progress/score/badge tracking
  ui-utils.js               # Animated count-up helper
  sound.js                  # Web Audio SFX + mute toggle
  confetti.js               # Canvas confetti burst
  bg-constellation.js       # Animated landing background
  intro.js                  # "What is Foundry?" walkthrough overlay
  share-card.js             # Canvas-rendered shareable PNG
  levels/                   # One ES module per level (level1-timeline.js … level16-enterprise.js)
.github/workflows/deploy.yml  # GitHub Pages deployment
```

## Running locally

```bash
npx http-server -p 8080
```

Then open `http://localhost:8080`.

## Deployment

Deployed automatically to GitHub Pages on every push to `main` via GitHub Actions (`.github/workflows/deploy.yml`).

## Credits

Built with GitHub Copilot. Inspired by [Ontology Quest](https://github.com/tmdaidevs/ontology-quest) by Tobi Müller.
