import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { discoverClaudeWorkspace } from '../src/discover.js';
import { getAdapter } from '../src/adapters/index.js';
import { createReport } from '../src/report.js';
import type { BridgeOptions } from '../src/types.js';
import { exists, lstat, makeWorkspace, read, readlink } from './helpers.js';

function options(root: string, overrides: Partial<BridgeOptions> = {}): BridgeOptions {
  return { root, targets: ['codex'], mode: 'link', dryRun: false, ...overrides };
}

test('codex sync links a skill, converts the agent, and writes AGENTS.md', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    await getAdapter('codex').sync(source, options(ws.root), createReport());

    assert.ok(await exists(ws.root, '.agents/skills/reviewer'));
    assert.ok((await lstat(ws.root, '.agents/skills/reviewer')).isSymbolicLink());
    assert.ok(await exists(ws.root, '.codex/agents/reviewer.toml'));
    assert.ok(await exists(ws.root, 'AGENTS.md'));

    const toml = await read(ws.root, '.codex/agents/reviewer.toml');
    assert.match(toml, /name = "reviewer"/);
    assert.match(toml, /Reviewer Agent/);
  } finally {
    await ws.cleanup();
  }
});

test('skill symlinks are relative, not absolute (portability)', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    await getAdapter('codex').sync(source, options(ws.root), createReport());

    const link = await readlink(ws.root, '.agents/skills/reviewer');
    assert.ok(!path.isAbsolute(link), `expected relative symlink, got ${link}`);
    assert.equal(link, path.join('..', '..', '.claude', 'skills', 'reviewer'));
  } finally {
    await ws.cleanup();
  }
});

test('generated files never leak an absolute home path', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    for (const target of ['codex', 'gemini', 'hermes'] as const) {
      await getAdapter(target).sync(source, options(ws.root, { targets: [target] }), createReport());
    }
    const generated = ['AGENTS.md', 'GEMINI.md', '.hermes/WORKSPACE.md', '.codex/agents/reviewer.toml'];
    for (const file of generated) {
      const content = await read(ws.root, file);
      assert.ok(!content.includes(ws.root), `${file} leaked the absolute workspace path`);
    }
  } finally {
    await ws.cleanup();
  }
});

test('sync is idempotent: the second run skips the already-bridged skill', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    const adapter = getAdapter('codex');

    await adapter.sync(source, options(ws.root), createReport());
    const secondReport = createReport();
    await adapter.sync(source, options(ws.root), secondReport);

    const skillEntry = secondReport.entries.find((e) => e.destination.endsWith(path.join('.agents', 'skills', 'reviewer')));
    assert.ok(skillEntry, 'expected a skill entry on the second run');
    assert.match(skillEntry!.action, /skipped/);
  } finally {
    await ws.cleanup();
  }
});

test('dry-run plans operations without writing anything', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    await getAdapter('codex').sync(source, options(ws.root, { dryRun: true }), createReport());
    assert.equal(await exists(ws.root, '.agents/skills/reviewer'), false);
    assert.equal(await exists(ws.root, 'AGENTS.md'), false);
  } finally {
    await ws.cleanup();
  }
});

test('copy mode produces a real directory, not a symlink', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    await getAdapter('codex').sync(source, options(ws.root, { mode: 'copy' }), createReport());
    const stat = await lstat(ws.root, '.agents/skills/reviewer');
    assert.equal(stat.isSymbolicLink(), false);
    assert.equal(stat.isDirectory(), true);
    assert.ok(await exists(ws.root, '.agents/skills/reviewer/SKILL.md'));
  } finally {
    await ws.cleanup();
  }
});

test('every adapter plan and sync agree on the same targets', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    for (const target of ['codex', 'gemini', 'hermes'] as const) {
      const adapter = getAdapter(target);
      const ops = await adapter.plan(source, options(ws.root, { targets: [target] }));
      assert.ok(ops.length >= 3, `${target} should plan at least skill + agent + guide`);
    }
  } finally {
    await ws.cleanup();
  }
});
