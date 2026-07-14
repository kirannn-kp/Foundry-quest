// sound.js — Web Audio SFX helper + mute toggle.

let muted = localStorage.getItem('foundryQuest.muted') === '1';
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function play(freq, duration = 0.12, type = 'sine', gain = 0.18) {
  if (muted) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
  } catch (e) { /* silent fail */ }
}

export const sfx = {
  correct: () => { play(880, 0.1); setTimeout(() => play(1320, 0.15), 80); },
  wrong: () => { play(220, 0.2, 'sawtooth', 0.12); },
  hint: () => play(660, 0.08, 'triangle', 0.1),
  hop: () => play(520, 0.06, 'sine', 0.1),
  badge: () => { play(1047, 0.12); setTimeout(() => play(1319, 0.12), 100); setTimeout(() => play(1568, 0.18), 200); },
  levelComplete: () => { play(523, 0.15); setTimeout(() => play(659, 0.15), 120); setTimeout(() => play(784, 0.15), 240); setTimeout(() => play(1047, 0.25), 360); }
};

export function isMuted() { return muted; }
export function toggleMuted() {
  muted = !muted;
  localStorage.setItem('foundryQuest.muted', muted ? '1' : '0');
}
