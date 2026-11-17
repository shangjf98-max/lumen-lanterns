// Game state for Lumen Lanterns: the phase machine, mirror rotations,
// undo history, scoring and end-of-level checks. Rendering reads this state;
// input calls these methods. The beam is recomputed after every change.

import { LEVELS } from './levels.js';
import { traceBeam } from './beam.js';
import { otherOrientation, SCORING } from './config.js';
import {
  playRotate,
  playLantern,
  playWin,
  playLose,
} from './audio.js';

export const PHASES = {
  START: 'start',
  PLAYING: 'playing',
  LEVEL_CLEAR: 'level-clear',
  GAME_OVER: 'game-over',
  VICTORY: 'victory',
};

export function createGame() {
  return {
    phase: PHASES.START,
    levelIndex: 0,
    level: LEVELS[0],
    orientations: LEVELS[0].mirrors.map((m) => m.orient),
    rotationsLeft: LEVELS[0].budget,
    rotationsUsed: 0,
    score: 0,
    levelScore: 0,
    stars: 0,
    undoStack: [],
    beam: traceBeam(
      LEVELS[0],
      LEVELS[0].mirrors.map((m) => m.orient),
    ),
    focus: null,
    litBefore: 0,
    onChange: null,
  };
}

export function levelStars(level, rotationsUsed) {
  if (rotationsUsed <= level.par) return 3;
  if (rotationsUsed <= level.par + 2) return 2;
  return 1;
}

export function scoreLevel(level, rotationsUsed) {
  let total = SCORING.levelBase + level.lanterns.length * SCORING.perLantern;
  if (rotationsUsed <= level.par) total += SCORING.parBonus;
  else if (rotationsUsed <= level.par + 2) total += SCORING.nearParBonus;
  return total;
}

function refreshBeam(game) {
  game.beam = traceBeam(game.level, game.orientations);
}

function notify(game) {
  if (typeof game.onChange === 'function') game.onChange(game);
}

export function startLevel(game, levelIndex, keepScore) {
  const level = LEVELS[levelIndex];
  game.levelIndex = levelIndex;
  game.level = level;
  game.orientations = level.mirrors.map((m) => m.orient);
  game.rotationsLeft = level.budget;
  game.rotationsUsed = 0;
  game.levelScore = 0;
  game.stars = 0;
  game.undoStack = [];
  game.focus = null;
  if (!keepScore) game.score = 0;
  game.phase = PHASES.PLAYING;
  refreshBeam(game);
  game.litBefore = game.beam.lit.size;
  notify(game);
}

export function startGame(game) {
  startLevel(game, 0, false);
}

export function mirrorIndexAt(game, x, y) {
  return game.level.mirrors.findIndex((m) => m.x === x && m.y === y);
}

export function canRotate(game, x, y) {
  if (game.phase !== PHASES.PLAYING) return false;
  const index = mirrorIndexAt(game, x, y);
  if (index < 0) return false;
  if (game.level.mirrors[index].fixed) return false;
  return game.rotationsLeft > 0;
}

export function rotateMirror(game, x, y) {
  if (!canRotate(game, x, y)) return false;
  const index = mirrorIndexAt(game, x, y);
  game.undoStack.push({
    orientations: game.orientations.slice(),
    rotationsLeft: game.rotationsLeft,
    rotationsUsed: game.rotationsUsed,
  });
  game.orientations[index] = otherOrientation(game.orientations[index]);
  game.rotationsLeft -= 1;
  game.rotationsUsed += 1;
  refreshBeam(game);
  const litNow = game.beam.lit.size;
  if (litNow > game.litBefore) playLantern(litNow);
  else playRotate();
  game.litBefore = litNow;
  checkEndConditions(game);
  notify(game);
  return true;
}

export function undoMove(game) {
  if (game.phase !== PHASES.PLAYING && game.phase !== PHASES.GAME_OVER) {
    return false;
  }
  const previous = game.undoStack.pop();
  if (!previous) return false;
  game.orientations = previous.orientations;
  game.rotationsLeft = previous.rotationsLeft;
  game.rotationsUsed = previous.rotationsUsed;
  game.phase = PHASES.PLAYING;
  refreshBeam(game);
  game.litBefore = game.beam.lit.size;
  playRotate();
  notify(game);
  return true;
}

export function restartLevel(game) {
  const keepScore = true;
  const savedScore = game.score;
  startLevel(game, game.levelIndex, keepScore);
  game.score = savedScore;
  notify(game);
}

export function nextLevel(game) {
  if (game.levelIndex + 1 >= LEVELS.length) {
    game.phase = PHASES.VICTORY;
    notify(game);
    return;
  }
  startLevel(game, game.levelIndex + 1, true);
}

export function checkEndConditions(game) {
  if (game.phase !== PHASES.PLAYING) return;
  if (game.beam.allLit) {
    game.stars = levelStars(game.level, game.rotationsUsed);
    game.levelScore = scoreLevel(game.level, game.rotationsUsed);
    game.score += game.levelScore;
    game.phase = PHASES.LEVEL_CLEAR;
    playWin();
    return;
  }
  if (game.rotationsLeft <= 0) {
    game.phase = PHASES.GAME_OVER;
    playLose();
  }
}

export function setRotationsLeftForShot(game, count) {
  // Screenshot helper only: the shot setup drives the real end check, so
  // the game-over overlay in a screenshot is the genuine one.
  game.rotationsLeft = count;
  checkEndConditions(game);
  notify(game);
}
