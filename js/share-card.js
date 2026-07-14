// share-card.js — Canvas-rendered shareable score/badge PNG.
import * as progress from './progress.js';

export function downloadShareCard() {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, 800, 420);

  // Border
  ctx.strokeStyle = '#2ee6c8';
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 760, 380);

  // Title
  ctx.font = '700 28px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#2ee6c8';
  ctx.fillText('// FOUNDRY QUEST', 50, 70);

  // Score
  ctx.font = '700 64px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#e9f1f3';
  ctx.fillText(`${progress.totalScore()}`, 50, 160);
  ctx.font = '400 24px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#5b6c74';
  ctx.fillText('TOTAL SCORE', 50, 195);

  // Badges
  const badges = progress.getBadges();
  ctx.font = '600 14px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#93a7b0';
  ctx.fillText(`${badges.length} BADGES EARNED`, 50, 250);

  badges.slice(0, 8).forEach((b, i) => {
    ctx.fillStyle = '#10151b';
    ctx.strokeStyle = '#2ee6c8';
    ctx.lineWidth = 1;
    const x = 50 + (i % 4) * 180;
    const y = 270 + Math.floor(i / 4) * 40;
    ctx.fillRect(x, y, 170, 30);
    ctx.strokeRect(x, y, 170, 30);
    ctx.fillStyle = '#e9f1f3';
    ctx.font = '500 11px "IBM Plex Mono", monospace';
    ctx.fillText(b.name, x + 10, y + 20);
  });

  // Download
  const link = document.createElement('a');
  link.download = 'foundry-quest-score.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}
