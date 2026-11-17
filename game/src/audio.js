// Tiny WebAudio sound kit for Lumen Lanterns. Every sound is synthesised
// with oscillators, so the game ships no audio files and makes no requests.
// The context is created lazily on the first user gesture; muted state is
// kept in memory only.

let context = null;
let muted = false;

function ensureContext() {
  if (context) {
    if (context.state === 'suspended') context.resume();
    return context;
  }
  const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;
  context = new AudioContextClass();
  return context;
}

function tone(freq, start, duration, type, volume) {
  const ctx = ensureContext();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(
    volume,
    ctx.currentTime + start + 0.02,
  );
  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    ctx.currentTime + start + duration,
  );
  osc.connect(gain).connect(ctx.destination);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + duration + 0.05);
}

export function unlockAudio() {
  ensureContext();
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function playRotate() {
  tone(340, 0, 0.09, 'triangle', 0.12);
  tone(510, 0.03, 0.08, 'triangle', 0.08);
}

export function playLantern(newlyLit) {
  const base = 660 + Math.min(newlyLit, 4) * 90;
  tone(base, 0, 0.22, 'sine', 0.16);
  tone(base * 1.5, 0.08, 0.28, 'sine', 0.12);
}

export function playWin() {
  [523, 659, 784, 1047].forEach((freq, i) => {
    tone(freq, i * 0.11, 0.3, 'triangle', 0.14);
  });
}

export function playLose() {
  tone(220, 0, 0.35, 'sawtooth', 0.07);
  tone(165, 0.18, 0.45, 'sawtooth', 0.06);
}

export function playClick() {
  tone(760, 0, 0.06, 'sine', 0.1);
}
