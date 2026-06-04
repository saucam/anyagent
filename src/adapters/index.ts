import { codexAdapter } from './codex.js';
import { geminiAdapter } from './gemini.js';
import { hermesAdapter } from './hermes.js';
import type { TargetAdapter, TargetName } from '../types.js';

const adapters: Record<TargetName, TargetAdapter> = {
  codex: codexAdapter,
  gemini: geminiAdapter,
  hermes: hermesAdapter
};

export function getAdapter(name: TargetName): TargetAdapter {
  return adapters[name];
}

export function listAdapters(): TargetName[] {
  return Object.keys(adapters) as TargetName[];
}
