// Canvas rendering for Lumen Lanterns: the board, its pieces, the glowing
// beam and the travelling sparkles. Pure drawing only; all game state lives
// in game.js and all beam geometry comes from beam.js.

import { BEAM_COLORS, PALETTE, BOARD } from './config.js';

export function computeLayout(level, cssWidth, cssHeight) {
  const cell = Math.max(
    BOARD.minCell,
    Math.min(
      BOARD.maxCell,
      Math.floor(
        Math.min(
          (cssWidth - BOARD.padding * 2) / level.cols,
          (cssHeight - BOARD.padding * 2) / level.rows,
        ),
      ),
    ),
  );
  const width = cell * level.cols + BOARD.padding * 2;
  const height = cell * level.rows + BOARD.padding * 2;
  return { cell, width, height, pad: BOARD.padding };
}

function cellCentre(layout, x, y) {
  return {
    px: layout.pad + (x + 0.5) * layout.cell,
    py: layout.pad + (y + 0.5) * layout.cell,
  };
}

function roundRectPath(ctx, x, y, w, h, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawBoardTiles(ctx, level, layout) {
  for (let y = 0; y < level.rows; y += 1) {
    for (let x = 0; x < level.cols; x += 1) {
      const left = layout.pad + x * layout.cell;
      const top = layout.pad + y * layout.cell;
      ctx.fillStyle = (x + y) % 2 === 0 ? PALETTE.tile : PALETTE.tileAlt;
      roundRectPath(
        ctx,
        left + 2,
        top + 2,
        layout.cell - 4,
        layout.cell - 4,
        10,
      );
      ctx.fill();
    }
  }
}

function drawWall(ctx, layout, x, y) {
  const { px, py } = cellCentre(layout, x, y);
  const half = layout.cell * 0.36;
  ctx.fillStyle = PALETTE.wall;
  roundRectPath(ctx, px - half, py - half, half * 2, half * 2, 8);
  ctx.fill();
  ctx.fillStyle = PALETTE.wallTop;
  roundRectPath(ctx, px - half, py - half, half * 2, half * 0.7, 8);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 2;
  roundRectPath(ctx, px - half, py - half, half * 2, half * 2, 8);
  ctx.stroke();
}

function drawMirror(ctx, layout, mirror, orient) {
  const { px, py } = cellCentre(layout, mirror.x, mirror.y);
  const half = layout.cell * 0.3;
  const rising = orient === '/';
  const a = rising
    ? { x: px - half, y: py + half }
    : { x: px - half, y: py - half };
  const b = rising
    ? { x: px + half, y: py - half }
    : { x: px + half, y: py + half };
  ctx.lineCap = 'round';
  ctx.strokeStyle = PALETTE.mirrorEdge;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.mirror;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  if (mirror.fixed) {
    ctx.fillStyle = PALETTE.fixedRivet;
    for (const [rx, ry] of [
      [-half, -half],
      [half, half],
    ]) {
      ctx.beginPath();
      ctx.arc(px + rx, py + ry, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawPrism(ctx, layout, x, y, time) {
  const { px, py } = cellCentre(layout, x, y);
  const r = layout.cell * 0.3;
  const pulse = 0.75 + Math.sin(time / 500) * 0.15;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.strokeStyle = PALETTE.prism;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(px, py - r);
  ctx.lineTo(px + r, py);
  ctx.lineTo(px, py + r);
  ctx.lineTo(px - r, py);
  ctx.closePath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(px, py - r * 0.45);
  ctx.lineTo(px + r * 0.45, py + r * 0.35);
  ctx.lineTo(px - r * 0.45, py + r * 0.35);
  ctx.closePath();
  ctx.stroke();
  ctx.restore();
}

function drawFilter(ctx, layout, filter) {
  const { px, py } = cellCentre(layout, filter.x, filter.y);
  const half = layout.cell * 0.3;
  ctx.fillStyle = BEAM_COLORS[filter.color];
  ctx.globalAlpha = 0.28;
  roundRectPath(ctx, px - half, py - half, half * 2, half * 2, 8);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = BEAM_COLORS[filter.color];
  ctx.lineWidth = 3;
  roundRectPath(ctx, px - half, py - half, half * 2, half * 2, 8);
  ctx.stroke();
}

function drawLantern(ctx, layout, lantern, lit, time) {
  const { px, py } = cellCentre(layout, lantern.x, lantern.y);
  const w = layout.cell * 0.34;
  const h = layout.cell * 0.42;
  if (lit) {
    const glow = ctx.createRadialGradient(px, py, 4, px, py, layout.cell);
    glow.addColorStop(0, 'rgba(255, 217, 77, 0.55)');
    glow.addColorStop(1, 'rgba(255, 217, 77, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py, layout.cell, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = lit ? PALETTE.lanternGlow : PALETTE.lanternDim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(px, py - h / 2 - 8);
  ctx.lineTo(px, py - h / 2);
  ctx.stroke();
  ctx.fillStyle = lit ? PALETTE.lanternGlow : '#232b52';
  roundRectPath(ctx, px - w / 2, py - h / 2, w, h, 8);
  ctx.fill();
  ctx.strokeStyle = lit ? '#fff3c4' : PALETTE.lanternDim;
  roundRectPath(ctx, px - w / 2, py - h / 2, w, h, 8);
  ctx.stroke();
  if (lit) {
    const flicker = 0.85 + Math.sin(time / 160 + lantern.x) * 0.15;
    ctx.fillStyle = `rgba(255, 247, 214, ${flicker})`;
    ctx.beginPath();
    ctx.arc(px, py, layout.cell * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  if (lantern.color !== 'any') {
    ctx.fillStyle = BEAM_COLORS[lantern.color];
    ctx.beginPath();
    ctx.arc(px + w / 2 - 2, py - h / 2 + 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawEmitter(ctx, layout, emitter) {
  const { px, py } = cellCentre(layout, emitter.x, emitter.y);
  const glow = ctx.createRadialGradient(px, py, 2, px, py, layout.cell * 0.8);
  glow.addColorStop(0, 'rgba(255, 247, 214, 0.5)');
  glow.addColorStop(1, 'rgba(255, 247, 214, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(px, py, layout.cell * 0.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a6a2f';
  ctx.beginPath();
  ctx.arc(px, py, layout.cell * 0.24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff7d6';
  ctx.beginPath();
  ctx.arc(px, py, layout.cell * 0.13, 0, Math.PI * 2);
  ctx.fill();
}

function branchPixelPoints(layout, branch) {
  return branch.points.map((point) => cellCentre(layout, point.x, point.y));
}

function drawBeamBranch(ctx, layout, branch, time) {
  const pixels = branchPixelPoints(layout, branch);
  if (pixels.length < 2) return;
  const color = BEAM_COLORS[branch.color] || BEAM_COLORS.white;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  const passes = [
    { width: 11, alpha: 0.16, dash: null },
    { width: 6, alpha: 0.45, dash: null },
    { width: 2.5, alpha: 0.95, dash: null },
  ];
  for (const pass of passes) {
    ctx.globalAlpha = pass.alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = pass.width;
    ctx.beginPath();
    ctx.moveTo(pixels[0].px, pixels[0].py);
    for (let i = 1; i < pixels.length; i += 1) {
      ctx.lineTo(pixels[i].px, pixels[i].py);
    }
    ctx.stroke();
  }
  // Marching dashes give the beam a sense of flowing light.
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.setLineDash([10, 18]);
  ctx.lineDashOffset = -(time / 28) % 28;
  ctx.beginPath();
  ctx.moveTo(pixels[0].px, pixels[0].py);
  for (let i = 1; i < pixels.length; i += 1) {
    ctx.lineTo(pixels[i].px, pixels[i].py);
  }
  ctx.stroke();
  ctx.restore();
}

function pointAlongPolyline(pixels, distance) {
  let remaining = distance;
  for (let i = 1; i < pixels.length; i += 1) {
    const dx = pixels[i].px - pixels[i - 1].px;
    const dy = pixels[i].py - pixels[i - 1].py;
    const length = Math.hypot(dx, dy);
    if (remaining <= length) {
      const t = length === 0 ? 0 : remaining / length;
      return {
        px: pixels[i - 1].px + dx * t,
        py: pixels[i - 1].py + dy * t,
      };
    }
    remaining -= length;
  }
  return pixels[pixels.length - 1];
}

function drawBeamSparkles(ctx, layout, branch, time, seed) {
  const pixels = branchPixelPoints(layout, branch);
  if (pixels.length < 2) return;
  let total = 0;
  for (let i = 1; i < pixels.length; i += 1) {
    total += Math.hypot(
      pixels[i].px - pixels[i - 1].px,
      pixels[i].py - pixels[i - 1].py,
    );
  }
  if (total < 30) return;
  const color = BEAM_COLORS[branch.color] || BEAM_COLORS.white;
  ctx.save();
  ctx.fillStyle = color;
  for (let s = 0; s < 3; s += 1) {
    const offset = ((time / 9 + seed * 53 + (s * total) / 3) % total + total) % total;
    const point = pointAlongPolyline(pixels, offset);
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(point.px, point.py, 3.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawFocusCursor(ctx, layout, focus) {
  if (!focus) return;
  const left = layout.pad + focus.x * layout.cell;
  const top = layout.pad + focus.y * layout.cell;
  ctx.save();
  ctx.strokeStyle = PALETTE.accent;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([7, 5]);
  roundRectPath(ctx, left + 4, top + 4, layout.cell - 8, layout.cell - 8, 10);
  ctx.stroke();
  ctx.restore();
}

export function drawBoard(ctx, game, layout, time) {
  const { level } = game;
  ctx.clearRect(0, 0, layout.width, layout.height);
  drawBoardTiles(ctx, level, layout);
  for (const [x, y] of level.walls) drawWall(ctx, layout, x, y);
  for (const filter of level.filters) drawFilter(ctx, layout, filter);
  level.mirrors.forEach((mirror, index) => {
    drawMirror(ctx, layout, mirror, game.orientations[index]);
  });
  for (const [x, y] of level.prisms) drawPrism(ctx, layout, x, y, time);
  drawEmitter(ctx, layout, level.emitter);
  game.beam.branches.forEach((branch, index) => {
    drawBeamBranch(ctx, layout, branch, time);
    drawBeamSparkles(ctx, layout, branch, time, index);
  });
  level.lanterns.forEach((lantern, index) => {
    drawLantern(ctx, layout, lantern, game.beam.lit.has(index), time);
  });
  drawFocusCursor(ctx, layout, game.focus);
}
