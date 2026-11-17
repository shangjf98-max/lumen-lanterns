// Input for Lumen Lanterns: pointer clicks on the board and the keyboard
// controls. Pointer input converts a click to a grid cell; keyboard input
// moves a focus cell and rotates it. Both funnel into the same game calls,
// so mouse and keyboard play are the same game.

import { BOARD } from './config.js';
import {
  rotateMirror,
  undoMove,
  restartLevel,
  PHASES,
} from './game.js';
import { unlockAudio, toggleMute } from './audio.js';

export function cellFromPoint(layout, rect, clientX, clientY) {
  const x = Math.floor((clientX - rect.left - BOARD.padding) / layout.cell);
  const y = Math.floor((clientY - rect.top - BOARD.padding) / layout.cell);
  return { x, y };
}

export function bindBoardPointer(canvas, game, getLayout) {
  canvas.addEventListener('pointerdown', (event) => {
    unlockAudio();
    const layout = getLayout();
    const rect = canvas.getBoundingClientRect();
    const scaleX = layout.width / rect.width;
    const scaleY = layout.height / rect.height;
    const cell = {
      x: Math.floor(
        ((event.clientX - rect.left) * scaleX - BOARD.padding) / layout.cell,
      ),
      y: Math.floor(
        ((event.clientY - rect.top) * scaleY - BOARD.padding) / layout.cell,
      ),
    };
    game.focus = cell;
    rotateMirror(game, cell.x, cell.y);
  });
}

export function bindKeyboard(game, callbacks) {
  document.addEventListener('keydown', (event) => {
    if (event.key === 'm' || event.key === 'M') {
      const nowMuted = toggleMute();
      if (callbacks.onMute) callbacks.onMute(nowMuted);
      return;
    }
    if (game.phase !== PHASES.PLAYING) return;
    if (!game.focus) {
      game.focus = { x: 0, y: 0 };
    }
    const level = game.level;
    if (event.key === 'ArrowLeft') {
      game.focus.x = Math.max(0, game.focus.x - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowRight') {
      game.focus.x = Math.min(level.cols - 1, game.focus.x + 1);
      event.preventDefault();
    } else if (event.key === 'ArrowUp') {
      game.focus.y = Math.max(0, game.focus.y - 1);
      event.preventDefault();
    } else if (event.key === 'ArrowDown') {
      game.focus.y = Math.min(level.rows - 1, game.focus.y + 1);
      event.preventDefault();
    } else if (event.key === ' ' || event.key === 'Enter') {
      unlockAudio();
      rotateMirror(game, game.focus.x, game.focus.y);
      event.preventDefault();
    } else if (event.key === 'u' || event.key === 'U') {
      undoMove(game);
    } else if (event.key === 'r' || event.key === 'R') {
      restartLevel(game);
    }
    if (callbacks.onChange) callbacks.onChange(game);
  });
}
