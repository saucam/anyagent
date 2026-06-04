import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { discoverClaudeWorkspace } from '../src/discover.js';
import { getAdapter } from '../src/adapters/index.js';
import { createReport } from '../src/report.js';
import type { BridgeOptions } from '../src/types.js';
import { exists, lstat, makeWorkspace, read, readlink, write } from './helpers.js';

function options(root: string, overrides: Partial<BridgeOptions> = {}): BridgeOptions {
  return { root, targets: ['codex'], mode: 'link', dryRun: false, check: false, ...overrides };
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
    for (const target of ['codex', 'gemini', 'cursor', 'windsurf', 'hermes'] as const) {
      await getAdapter(target).sync(source, options(ws.root, { targets: [target] }), createReport());
    }
    const generated = [
      'AGENTS.md',
      'GEMINI.md',
      '.hermes/WORKSPACE.md',
      '.codex/agents/reviewer.toml',
      '.cursor/rules/workspace.mdc',
      '.cursor/rules/agent-reviewer.mdc',
      '.cursor/rules/skill-reviewer.mdc',
      '.windsurf/rules/workspace.md',
      '.windsurf/rules/agent-reviewer.md',
      '.windsurf/workflows/reviewer.md'
    ];
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
    for (const target of ['codex', 'gemini', 'cursor', 'windsurf', 'hermes'] as const) {
      const adapter = getAdapter(target);
      const ops = await adapter.plan(source, options(ws.root, { targets: [target] }));
      assert.ok(ops.length >= 3, `${target} should plan at least skill + agent + guide`);
    }
  } finally {
    await ws.cleanup();
  }
});

test('windsurf sync maps skills to workflows, agents to rules, with frontmatter', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    await getAdapter('windsurf').sync(source, options(ws.root, { targets: ['windsurf'] }), createReport());

    // Skill → workflow (the closest native Windsurf concept).
    const workflow = await read(ws.root, '.windsurf/workflows/reviewer.md');
    assert.match(workflow, /description: "Code review skill\."/);

    // Workspace guide → always-on rule.
    const workspace = await read(ws.root, '.windsurf/rules/workspace.md');
    assert.match(workspace, /trigger: always_on/);

    // Agent → manually-triggered rule.
    const agentRule = await read(ws.root, '.windsurf/rules/agent-reviewer.md');
    assert.match(agentRule, /trigger: manual/);
    assert.match(agentRule, /Reviewer Agent/);

    // No skill folder is symlinked.
    assert.equal(await exists(ws.root, '.windsurf/skills'), false);
  } finally {
    await ws.cleanup();
  }
});

test('windsurf conversions are reported as lossy (warnings present)', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    const report = createReport();
    await getAdapter('windsurf').sync(source, options(ws.root, { targets: ['windsurf'] }), report);
    const warned = report.entries.filter((e) => e.warnings.length > 0);
    assert.ok(warned.length >= 2, 'skill and agent conversions should both warn about lossiness');
  } finally {
    await ws.cleanup();
  }
});

test('cursor sync writes valid .mdc rules with frontmatter and no symlinks', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    await getAdapter('cursor').sync(source, options(ws.root, { targets: ['cursor'] }), createReport());

    const workspace = await read(ws.root, '.cursor/rules/workspace.mdc');
    assert.match(workspace, /^---\n/);
    assert.match(workspace, /alwaysApply: true/);

    const skillRule = await read(ws.root, '.cursor/rules/skill-reviewer.mdc');
    // description should be lifted from the SKILL.md frontmatter
    assert.match(skillRule, /description: "Code review skill\."/);
    assert.match(skillRule, /alwaysApply: false/);

    const agentRule = await read(ws.root, '.cursor/rules/agent-reviewer.mdc');
    assert.match(agentRule, /Reviewer Agent/);

    // Cursor has no skill folder — nothing should be symlinked.
    assert.equal(await exists(ws.root, '.cursor/skills'), false);
  } finally {
    await ws.cleanup();
  }
});

test('cursor conversions are reported as lossy (warnings present)', async () => {
  const ws = await makeWorkspace();
  try {
    const source = await discoverClaudeWorkspace(ws.root);
    const report = createReport();
    await getAdapter('cursor').sync(source, options(ws.root, { targets: ['cursor'] }), report);
    const warned = report.entries.filter((e) => e.warnings.length > 0);
    assert.ok(warned.length >= 2, 'skill and agent conversions should both warn about lossiness');
  } finally {
    await ws.cleanup();
  }
});

test('check mode: clean after sync, dirty after the source changes, writes nothing', async () => {
  const ws = await makeWorkspace();
  try {
    let source = await discoverClaudeWorkspace(ws.root);
    const targets = ['codex', 'gemini', 'cursor', 'windsurf', 'hermes'] as const;

    // First, bring everything in sync.
    for (const target of targets) {
      await getAdapter(target).sync(source, options(ws.root, { targets: [target] }), createReport());
    }

    // A check run now should report zero drift.
    const clean = createReport();
    for (const target of targets) {
      await getAdapter(target).sync(source, options(ws.root, { targets: [target], check: true }), clean);
    }
    assert.equal(clean.entries.some((e) => e.changed), false, 'expected no drift right after sync');

    // Mutate the source guide, then re-discover.
    await write(ws.root, 'CLAUDE.md', '# Workspace Map\n\n- A brand new rule.\n');
    source = await discoverClaudeWorkspace(ws.root);

    const dirty = createReport();
    for (const target of targets) {
      await getAdapter(target).sync(source, options(ws.root, { targets: [target], check: true }), dirty);
    }
    assert.ok(dirty.entries.some((e) => e.changed), 'expected drift after the source changed');

    // Check mode must not have written the update.
    const onDisk = await read(ws.root, 'AGENTS.md');
    assert.ok(!onDisk.includes('A brand new rule.'), 'check mode must not write');
  } finally {
    await ws.cleanup();
  }
});
