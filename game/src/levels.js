// Level definitions for Lumen Lanterns. Coordinates are grid cells:
// x grows right, y grows down. The emitter sits on the grid edge and fires
// in its direction. Budgets and pars are set after the solver (kept outside
// the repository) proves each level solvable and finds its shortest solve.

export const LEVELS = [
  {
    name: 'First Light',
    cols: 5,
    rows: 5,
    emitter: { x: 0, y: 2, dir: 'E' },
    walls: [
      [1, 1],
      [3, 3],
    ],
    mirrors: [{ x: 4, y: 2, orient: '\\', fixed: false }],
    prisms: [],
    filters: [],
    lanterns: [{ x: 4, y: 0, color: 'any' }],
    budget: 3,
    par: 1,
    hint: 'Click the mirror to turn it. Bounce the beam up to the lantern.',
  },
  {
    name: 'Two Turns',
    cols: 6,
    rows: 6,
    emitter: { x: 0, y: 1, dir: 'E' },
    walls: [
      [2, 3],
      [3, 2],
    ],
    mirrors: [
      { x: 4, y: 1, orient: '/', fixed: false },
      { x: 4, y: 4, orient: '\\', fixed: false },
    ],
    prisms: [],
    filters: [],
    lanterns: [
      { x: 1, y: 4, color: 'any' },
      { x: 0, y: 4, color: 'any' },
    ],
    budget: 4,
    par: 2,
    hint: 'One beam can light two lanterns: it shines straight through them.',
  },
  {
    name: 'Split Decision',
    cols: 6,
    rows: 6,
    emitter: { x: 0, y: 3, dir: 'E' },
    walls: [
      [1, 0],
      [5, 3],
    ],
    mirrors: [
      { x: 3, y: 1, orient: '\\', fixed: false },
      { x: 3, y: 4, orient: '/', fixed: false },
    ],
    prisms: [[3, 3]],
    filters: [],
    lanterns: [
      { x: 5, y: 1, color: 'any' },
      { x: 5, y: 4, color: 'any' },
    ],
    budget: 4,
    par: 2,
    hint: 'A prism splits the beam sideways. Aim both halves at lanterns.',
  },
  {
    name: 'True Colors',
    cols: 7,
    rows: 7,
    emitter: { x: 0, y: 3, dir: 'E' },
    walls: [
      [2, 5],
      [4, 5],
      [3, 0],
    ],
    mirrors: [
      { x: 5, y: 3, orient: '\\', fixed: false },
      { x: 5, y: 1, orient: '\\', fixed: false },
    ],
    prisms: [],
    filters: [{ x: 3, y: 3, color: 'teal' }],
    lanterns: [
      { x: 1, y: 3, color: 'any' },
      { x: 6, y: 1, color: 'teal' },
    ],
    budget: 5,
    par: 2,
    hint: 'Coloured lanterns need a matching beam. Tint it with the filter.',
  },
  {
    name: 'Crossfire',
    cols: 7,
    rows: 7,
    emitter: { x: 3, y: 6, dir: 'N' },
    walls: [
      [0, 0],
      [6, 0],
      [6, 6],
    ],
    mirrors: [
      { x: 1, y: 3, orient: '\\', fixed: false },
      { x: 5, y: 3, orient: '/', fixed: false },
    ],
    prisms: [[3, 3]],
    filters: [],
    lanterns: [
      { x: 1, y: 5, color: 'any' },
      { x: 1, y: 6, color: 'any' },
      { x: 5, y: 5, color: 'any' },
    ],
    budget: 5,
    par: 2,
    hint: 'The prism fires from below. Catch both halves and bend them down.',
  },
  {
    name: 'Grand Circuit',
    cols: 7,
    rows: 7,
    emitter: { x: 0, y: 3, dir: 'E' },
    walls: [
      [6, 6],
      [0, 6],
      [1, 5],
    ],
    mirrors: [
      { x: 2, y: 3, orient: '\\', fixed: false },
      { x: 5, y: 1, orient: '/', fixed: false },
      { x: 5, y: 4, orient: '\\', fixed: false },
    ],
    prisms: [[2, 1]],
    filters: [{ x: 4, y: 1, color: 'amber' }],
    lanterns: [
      { x: 0, y: 1, color: 'any' },
      { x: 4, y: 4, color: 'any' },
      { x: 3, y: 4, color: 'amber' },
    ],
    budget: 6,
    par: 3,
    hint: 'Split, tint, then bend: every trick you learned, in one puzzle.',
  },
];
