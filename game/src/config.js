// Shared constants for Lumen Lanterns: palette, beam colours and tuning.
// Nothing here touches the DOM, so the beam solver can import the game logic
// from Node without a browser.

export const GAME_TITLE = 'Lumen Lanterns';

export const DIRECTIONS = {
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
  N: { dx: 0, dy: -1 },
};

export const BEAM_COLORS = {
  white: '#fff7d6',
  amber: '#ffb02e',
  teal: '#2ee6c8',
};

export const PALETTE = {
  page: '#0b1026',
  panel: '#141b3d',
  panelEdge: '#2b3768',
  tile: '#182150',
  tileAlt: '#1b2456',
  gridLine: '#26306b',
  wall: '#3a466e',
  wallTop: '#55639a',
  mirror: '#cfe6ff',
  mirrorEdge: '#7fb2e8',
  fixedRivet: '#8a93b8',
  prism: '#b78cff',
  lanternDim: '#5b648f',
  lanternGlow: '#ffd94d',
  text: '#eef1ff',
  textDim: '#aab3d6',
  accent: '#ffd94d',
  danger: '#ff6b81',
};

export const BOARD = {
  maxCell: 76,
  minCell: 44,
  padding: 18,
};

// Scoring: every level pays a base, a per-lantern bonus and an efficiency
// bonus for finishing at or under par. Stars follow the same par rule.
export const SCORING = {
  levelBase: 500,
  perLantern: 150,
  parBonus: 250,
  nearParBonus: 100,
};

export function otherOrientation(orient) {
  return orient === '/' ? '\\' : '/';
}
