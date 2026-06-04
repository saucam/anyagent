import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { initWorkspace } from '../src/init.js';
import { exists, read } from './helpers.js';

async function tmpDir(): Promise<{ root: string; cleanup: () => Promise<void> }> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'anyagent-init-'));
  return { root, cleanup: () => fs.rm(root, { recursive: true, force: true }) };
}

test('init scaffolds a canonical .claude workspace from scratch', async () => {
  const dir = await tmpDir();
  try {
    const result = await initWorkspace(dir.root);
    assert.equal(result.skipped.length, 0);
    assert.equal(result.created.length, 3);
    assert.ok(await exists(dir.root, 'CLAUDE.md'));
    assert.ok(await exists(dir.root, '.claude/agents/reviewer.md'));
    assert.ok(await exists(dir.root, '.claude/skills/reviewer/SKILL.md'));
  } finally {
    await dir.cleanup();
  }
});

test('init never overwrites existing files', async () => {
  const dir = await tmpDir();
  try {
    await fs.writeFile(path.join(dir.root, 'CLAUDE.md'), 'KEEP ME', 'utf8');
    const result = await initWorkspace(dir.root);
    assert.ok(result.skipped.includes('CLAUDE.md'));
    assert.equal(await read(dir.root, 'CLAUDE.md'), 'KEEP ME');
  } finally {
    await dir.cleanup();
  }
});

test('init dry-run writes nothing', async () => {
  const dir = await tmpDir();
  try {
    await initWorkspace(dir.root, true);
    assert.equal(await exists(dir.root, 'CLAUDE.md'), false);
  } finally {
    await dir.cleanup();
  }
});
