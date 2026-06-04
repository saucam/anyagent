import { codexAdapter } from './codex.js';
import { geminiAdapter } from './gemini.js';
import { cursorAdapter } from './cursor.js';
import { hermesAdapter } from './hermes.js';
import type { TargetAdapter, TargetName } from '../types.js';

// Order matters: this is the default `--to` order and the doctor/help listing.
const adapters: Record<TargetName, TargetAdapter> = {
  codex: codexAdapter,
  gemini: geminiAdapter,
  cursor: cursorAdapter,
  hermes: hermesAdapter
};

export function getAdapter(name: TargetName): TargetAdapter {
  return adapters[name];
}

export function listAdapters(): TargetName[] {
  return Object.keys(adapters) as TargetName[];
}
