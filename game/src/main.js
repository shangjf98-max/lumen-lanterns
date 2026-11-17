// Boot and HUD wiring for Lumen Lanterns. main.js owns the canvas, the
// animation loop, the HUD text and the overlay screens; the game rules live
// in game.js, the drawing in render.js and the input in input.js.

import { LEVELS } from './levels.js';
import { GAME_TITLE } from './config.js';
import {
  createGame,
  startGame,
  startLevel,
  restartLevel,
  undoMove,
  nextLevel,
  PHASES,
} from './game.js';
import { computeLayout, drawBoard } from './render.js';
import { bindBoardPointer, bindKeyboard } from './input.js';
import { applyShot } from './shots.js';
import {
  unlockAudio,
  toggleMute,
  isMuted,
  playClick,
} from './audio.js';

const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const game = createGame();
let layout = computeLayout(game.level, 720, 560);

function fitCanvas() {
  const holder = document.getElementById('board-holder');
  const rect = holder.getBoundingClientRect();
  layout = computeLayout(
    game.level,
    Math.max(320, rect.width),
    Math.max(320, rect.height),
  );
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(layout.width * dpr);
  canvas.height = Math.round(layout.height * dpr);
  canvas.style.width = `${layout.width}px`;
  canvas.style.height = `${layout.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function setOverlay(id) {
  for (const overlay of document.querySelectorAll('.overlay')) {
    overlay.classList.toggle('visible', overlay.id === id);
  }
}

function starText(stars) {
  return '★'.repeat(stars) + '☆'.repeat(3 - stars);
}

function refreshHud() {
  document.getElementById('hud-level').textContent =
    `Level ${game.levelIndex + 1} / ${LEVELS.length}`;
  document.getElementById('hud-level-name').textContent = game.level.name;
  document.getElementById('hud-lanterns').textContent =
    `Lanterns ${game.beam.lit.size} / ${game.level.lanterns.length}`;
  document.getElementById('hud-rotations').textContent =
    `Rotations ${game.rotationsLeft}`;
  document.getElementById('hud-score').textContent = `Score ${game.score}`;
  document.getElementById('hud-hint').textContent = game.level.hint;
  document.getElementById('btn-undo').disabled = game.undoStack.length === 0;
  document.getElementById('btn-sound').textContent = isMuted()
    ? 'Sound: off'
    : 'Sound: on';

  if (game.phase === PHASES.START) {
    setOverlay('overlay-start');
  } else if (game.phase === PHASES.LEVEL_CLEAR) {
    document.getElementById('clear-stars').textContent = starText(game.stars);
    document.getElementById('clear-score').textContent =
      `Level score +${game.levelScore} · Total ${game.score}`;
    document.getElementById('clear-title').textContent =
      game.levelIndex + 1 >= LEVELS.length
        ? 'Final lantern lit!'
        : 'Level complete!';
    document.getElementById('btn-next').textContent =
      game.levelIndex + 1 >= LEVELS.length ? 'See results' : 'Next level';
    setOverlay('overlay-clear');
  } else if (game.phase === PHASES.GAME_OVER) {
    document.getElementById('over-detail').textContent =
      `You lit ${game.beam.lit.size} of ${game.level.lanterns.length} lanterns on "${game.level.name}".`;
    document.getElementById('btn-over-undo').disabled =
      game.undoStack.length === 0;
    setOverlay('overlay-over');
  } else if (game.phase === PHASES.VICTORY) {
    document.getElementById('victory-score').textContent =
      `Final score: ${game.score}`;
    setOverlay('overlay-victory');
  } else {
    setOverlay(null);
  }
}

game.onChange = () => {
  fitCanvas();
  refreshHud();
};

function bindButtons() {
  document.getElementById('btn-play').addEventListener('click', () => {
    unlockAudio();
    playClick();
    startGame(game);
  });
  document.getElementById('btn-how').addEventListener('click', () => {
    playClick();
    setOverlay('overlay-how');
  });
  document.getElementById('btn-how-back').addEventListener('click', () => {
    playClick();
    setOverlay('overlay-start');
  });
  document.getElementById('btn-next').addEventListener('click', () => {
    playClick();
    nextLevel(game);
  });
  document.getElementById('btn-retry').addEventListener('click', () => {
    playClick();
    restartLevel(game);
  });
  document.getElementById('btn-over-undo').addEventListener('click', () => {
    playClick();
    undoMove(game);
  });
  document.getElementById('btn-again').addEventListener('click', () => {
    playClick();
    startGame(game);
  });
  document.getElementById('btn-undo').addEventListener('click', () => {
    unlockAudio();
    undoMove(game);
  });
  document.getElementById('btn-restart').addEventListener('click', () => {
    unlockAudio();
    playClick();
    restartLevel(game);
  });
  document.getElementById('btn-sound').addEventListener('click', () => {
    toggleMute();
    refreshHud();
  });
}

function frame(time) {
  drawBoard(ctx, game, layout, time);
  requestAnimationFrame(frame);
}

document.title = GAME_TITLE;
bindButtons();
bindBoardPointer(canvas, game, () => layout);
bindKeyboard(game, { onMute: () => refreshHud() });
window.addEventListener('resize', fitCanvas);
fitCanvas();
applyShot(game, window.location.search);
refreshHud();
requestAnimationFrame(frame);

// Exposed for play-testing in the browser console and for automated checks:
// the state is read-only here; play through the real inputs instead.
window.__lumen = { game, PHASES };
