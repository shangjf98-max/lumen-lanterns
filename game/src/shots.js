// Deterministic screenshot setups for Lumen Lanterns. A ?shot= URL
// parameter drives the real game through its normal transitions (start,
// rotate, end checks), so every screenshot is a genuine render of the game
// in that state: nothing here draws a fake screen.
//
//   ?shot=start  title screen (the default boot state)
//   ?shot=play   level 3 mid-puzzle, one rotation short of the solve
//   ?shot=clear  level 1 solved, with the level-clear overlay
//   ?shot=over   level 1 out of rotations, with the game-over overlay
//   ?level=n     additionally start on level n (1-based) when no shot asks
//                for a specific level

import { LEVELS } from './levels.js';
import {
  PHASES,
  startGame,
  startLevel,
  rotateMirror,
  setRotationsLeftForShot,
} from './game.js';

// Solution rotations per level, as mirror coordinates in solve order. The
// solver outside the repository verifies these against the beam tracer.
const SOLUTION_ROTATIONS = [
  [[4, 2]],
  [
    [4, 1],
    [4, 4],
  ],
  [
    [3, 1],
    [3, 4],
  ],
  [
    [5, 3],
    [5, 1],
  ],
  [
    [1, 3],
    [5, 3],
  ],
  [
    [2, 3],
    [5, 1],
    [5, 4],
  ],
];

export function applyShot(game, search) {
  const params = new URLSearchParams(search);
  const shot = params.get('shot');
  const levelParam = Number.parseInt(params.get('level') || '', 10);
  if (!shot && !Number.isInteger(levelParam)) return;
  if (!shot && Number.isInteger(levelParam)) {
    const index = Math.min(
      Math.max(levelParam - 1, 0),
      LEVELS.length - 1,
    );
    startLevel(game, index, false);
    return;
  }
  if (shot === 'start') {
    game.phase = PHASES.START;
    return;
  }
  if (shot === 'play') {
    startLevel(game, 2, false);
    const rotations = SOLUTION_ROTATIONS[2];
    // Apply all but the last rotation: the beam is live, one lantern lit,
    // one puzzle move still to make.
    for (let i = 0; i < rotations.length - 1; i += 1) {
      rotateMirror(game, rotations[i][0], rotations[i][1]);
    }
    game.focus = { x: rotations[rotations.length - 1][0], y: rotations[rotations.length - 1][1] };
    return;
  }
  if (shot === 'clear') {
    startGame(game);
    for (const [x, y] of SOLUTION_ROTATIONS[0]) rotateMirror(game, x, y);
    return;
  }
  if (shot === 'over') {
    startGame(game);
    setRotationsLeftForShot(game, 0);
  }
}
