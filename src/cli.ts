#!/usr/bin/env node
import { setTimeout as sleep } from 'node:timers/promises';
import { discoverClaudeWorkspace } from './discover.js';
import { getAdapter, listAdapters } from './adapters/index.js';
import { createReport, printReport } from './report.js';
import { rel } from './fs-utils.js';
import { initWorkspace } from './init.js';
import type { BridgeOptions, LinkMode, TargetName } from './types.js';

interface ParsedArgs {
  command: string;
  root: string;
  targets: TargetName[];
  mode: LinkMode;
  dryRun: boolean;
  intervalMs: number;
}

const validTargets = new Set<TargetName>(listAdapters());

function usage(): string {
  return `anyagent — write your agent setup once, run it in any agent.

Usage:
  anyagent init   [--root <path>] [--dry-run]
  anyagent doctor [--root <path>]
  anyagent plan   [--root <path>] [--to codex gemini hermes] [--copy]
  anyagent sync   [--root <path>] [--to codex gemini hermes] [--copy] [--dry-run]
  anyagent watch  [--root <path>] [--to codex gemini hermes] [--interval-ms 2000]

Commands:
  init    Scaffold a starter canonical .claude/ workspace (never overwrites).
  doctor  Report what anyagent can see in the canonical workspace.
  plan    Print the operations sync would perform, without touching disk.
  sync    Bridge skills, agents, and guidance into each target layout.
  watch   Re-run sync on an interval so targets track the source.

Defaults:
  --root .
  --to codex gemini hermes
  mode is symlink unless --copy is passed
`;
}

function parseArgs(argv: string[]): ParsedArgs {
  const args = [...argv];
  const command = args.shift() ?? 'help';
  let root = '.';
  let targets: TargetName[] = listAdapters();
  let mode: LinkMode = 'link';
  let dryRun = false;
  let intervalMs = 2000;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === '--root') {
      root = args[++index] ?? root;
      continue;
    }
    if (arg === '--to') {
      const selected: TargetName[] = [];
      while (args[index + 1] && !args[index + 1].startsWith('--')) {
        const value = args[++index] as TargetName;
        if (!validTargets.has(value)) throw new Error(`Unknown target: ${value}`);
        selected.push(value);
      }
      targets = selected.length > 0 ? selected : targets;
      continue;
    }
    if (arg === '--copy') {
      mode = 'copy';
      continue;
    }
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '--interval-ms') {
      intervalMs = Number(args[++index] ?? intervalMs);
      if (!Number.isFinite(intervalMs) || intervalMs < 250) throw new Error('--interval-ms must be at least 250');
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  return { command, root, targets, mode, dryRun, intervalMs };
}

function optionsFromArgs(args: ParsedArgs): BridgeOptions {
  return {
    root: args.root,
    targets: args.targets,
    mode: args.mode,
    dryRun: args.dryRun
  };
}

async function printInit(args: ParsedArgs): Promise<void> {
  const result = await initWorkspace(args.root, args.dryRun);
  for (const file of result.created) console.log(`created ${file}`);
  for (const file of result.skipped) console.log(`exists  ${file} (left untouched)`);
  if (result.created.length === 0) {
    console.log('\nWorkspace already initialized. Run `anyagent sync` to bridge it.');
  } else {
    console.log('\nNext: `anyagent sync --to codex gemini hermes`');
  }
}

async function printDoctor(args: ParsedArgs): Promise<void> {
  const source = await discoverClaudeWorkspace(args.root);
  const show = (file: string): string => rel(source.root, file);
  console.log(`Root: ${source.root}`);
  console.log(`Claude directory: ${source.hasClaudeDir ? 'found' : 'missing'}`);
  console.log(`Workspace CLAUDE.md: ${source.workspaceGuide ? show(source.workspaceGuide.file) : 'missing'}`);
  console.log(`Skills: ${source.skills.length}`);
  for (const skill of source.skills) console.log(`  - ${skill.name}: ${show(skill.skillFile)}`);
  console.log(`Agents: ${source.agents.length}`);
  for (const agent of source.agents) console.log(`  - ${agent.name}: ${show(agent.file)}`);
  console.log(`Settings files: ${source.settings.length}`);
  for (const setting of source.settings) console.log(`  - ${setting.name}: ${show(setting.file)}`);
}

async function printPlan(args: ParsedArgs): Promise<void> {
  const source = await discoverClaudeWorkspace(args.root);
  const options = optionsFromArgs(args);
  for (const target of args.targets) {
    const adapter = getAdapter(target);
    const operations = await adapter.plan(source, options);
    console.log(`[${target}] ${operations.length} operation(s)`);
    for (const operation of operations) {
      console.log(`  ${operation.action} ${operation.type}`);
      console.log(`    from: ${rel(source.root, operation.source)}`);
      console.log(`    to:   ${rel(source.root, operation.target)}`);
    }
  }
}

async function sync(args: ParsedArgs): Promise<void> {
  const source = await discoverClaudeWorkspace(args.root);
  const options = optionsFromArgs(args);
  const report = createReport();
  for (const target of args.targets) {
    await getAdapter(target).sync(source, options, report);
  }
  printReport(report, source.root);
}

async function watch(args: ParsedArgs): Promise<void> {
  console.log(`Watching ${args.root}; syncing every ${args.intervalMs}ms. Press Ctrl+C to stop.`);
  while (true) {
    await sync(args);
    await sleep(args.intervalMs);
  }
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === 'help' || args.command === '--help' || args.command === '-h') {
    console.log(usage());
    return;
  }
  if (args.command === 'init') return printInit(args);
  if (args.command === 'doctor') return printDoctor(args);
  if (args.command === 'plan') return printPlan(args);
  if (args.command === 'sync') return sync(args);
  if (args.command === 'watch') return watch(args);
  throw new Error(`Unknown command: ${args.command}\n\n${usage()}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
