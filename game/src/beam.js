// Pure beam tracing for Lumen Lanterns. No DOM, no state: given a level and
// the current mirror orientations, traceBeam returns every beam branch as a
// list of cell-centre points plus the set of lanterns the light reaches.
//
// Rules: a '/' mirror maps (dx, dy) to (-dy, -dx); a '\' mirror maps it to
// (dy, dx). A prism stops the incoming beam and fires two new ones at right
// angles to it. A filter recolours the beam. A lantern never blocks the beam.
// A visited (cell, direction, colour) set keeps mirror loops finite.

import { DIRECTIONS } from './config.js';

function cellKey(x, y) {
  return `${x},${y}`;
}

function reflectSlash(dx, dy) {
  return { dx: -dy, dy: -dx };
}

function reflectBackslash(dx, dy) {
  return { dx: dy, dy: dx };
}

export function buildCellIndex(level, orientations) {
  const walls = new Set(level.walls.map(([x, y]) => cellKey(x, y)));
  const prisms = new Set(level.prisms.map(([x, y]) => cellKey(x, y)));
  const filters = new Map(
    level.filters.map((f) => [cellKey(f.x, f.y), f.color]),
  );
  const mirrors = new Map();
  level.mirrors.forEach((mirror, index) => {
    mirrors.set(cellKey(mirror.x, mirror.y), {
      orient: orientations[index],
      fixed: mirror.fixed,
    });
  });
  const lanterns = new Map();
  level.lanterns.forEach((lantern, index) => {
    lanterns.set(cellKey(lantern.x, lantern.y), { ...lantern, index });
  });
  return { walls, prisms, filters, mirrors, lanterns };
}

export function traceBeam(level, orientations) {
  const { cols, rows } = level;
  const index = buildCellIndex(level, orientations);
  const start = DIRECTIONS[level.emitter.dir];
  const lit = new Set();
  const branches = [];
  const seen = new Set();

  // Each branch is a queue item: current cell, direction, colour, and the
  // polyline of points it has drawn so far (cell centres, in grid units).
  const queue = [
    {
      x: level.emitter.x,
      y: level.emitter.y,
      dx: start.dx,
      dy: start.dy,
      color: 'white',
      points: [{ x: level.emitter.x, y: level.emitter.y }],
    },
  ];

  while (queue.length > 0) {
    const branch = queue.shift();
    let { x, y, dx, dy, color } = branch;
    const points = branch.points.slice();

    for (;;) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) {
        // Run the beam half a cell past the edge so it visibly exits.
        points.push({ x: x + dx * 0.5, y: y + dy * 0.5 });
        branches.push({ points, color });
        break;
      }
      const state = `${nx},${ny},${dx},${dy},${color}`;
      if (seen.has(state)) {
        points.push({ x: nx, y: ny });
        branches.push({ points, color });
        break;
      }
      seen.add(state);
      const key = cellKey(nx, ny);
      x = nx;
      y = ny;
      points.push({ x, y });

      if (index.walls.has(key)) {
        branches.push({ points, color });
        break;
      }
      const lantern = index.lanterns.get(key);
      if (lantern && (lantern.color === 'any' || lantern.color === color)) {
        lit.add(lantern.index);
      }
      const filter = index.filters.get(key);
      if (filter) color = filter;
      const prism = index.prisms.has(key);
      if (prism) {
        branches.push({ points, color });
        // Split at right angles to the incoming direction, both ways.
        const left = { dx: dy, dy: -dx };
        const right = { dx: -dy, dy: dx };
        queue.push({
          x,
          y,
          dx: left.dx,
          dy: left.dy,
          color,
          points: [{ x, y }],
        });
        queue.push({
          x,
          y,
          dx: right.dx,
          dy: right.dy,
          color,
          points: [{ x, y }],
        });
        break;
      }
      const mirror = index.mirrors.get(key);
      if (mirror) {
        const next =
          mirror.orient === '/'
            ? reflectSlash(dx, dy)
            : reflectBackslash(dx, dy);
        dx = next.dx;
        dy = next.dy;
      }
    }
  }

  return { branches, lit, allLit: lit.size === level.lanterns.length };
}
