// Lumen Lanterns entry program (Node 22, standard library only).
//
// The grader runs this file from the repository root in a fresh container
// with no network: /bot holds the repository read-only and /output is
// writable. The program hands the game in by copying the static game files
// and the screenshots into the output directory, then writing the dossier
// with the vendored make.fun library, using the same caps the scorer uses.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyEntryFolder(name: string): void {
  const source = join(repoRoot, name);
  const target = join(outputDir, name);
  mkdirSync(target, { recursive: true });
  if (existsSync(source)) {
    cpSync(source, target, { recursive: true });
  }
}

function writeEntryDossier(): void {
  const dossierBytes = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossierBytes);
}

mkdirSync(outputDir, { recursive: true });
copyEntryFolder('game');
copyEntryFolder('screenshots');
writeEntryDossier();
