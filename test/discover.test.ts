import assert from 'node:assert/strict';
import path from 'node:path';
import { test } from 'node:test';
import { discoverClaudeWorkspace } from '../src/discover.js';
import { makeWorkspace, write } from './helpers.js';

test('discovers skills, agents, settings, and the workspace guide', async () => {
  const ws = await makeWorkspace();
  try {
    const found = await discoverClaudeWorkspace(ws.root);
    assert.equal(found.hasClaudeDir, true);
    assert.equal(found.skills.length, 1);
    assert.equal(found.skills[0].name, 'reviewer');
    assert.equal(found.agents.length, 1);
    assert.equal(found.agents[0].name, 'reviewer');
    assert.equal(found.settings.length, 1);
    assert.ok(found.workspaceGuide);
    assert.match(found.workspaceGuide!.content, /Workspace Map/);
  } finally {
    await ws.cleanup();
  }
});

test('discovers nested project roots and skips ignored dirs', async () => {
  const ws = await makeWorkspace();
  try {
    await write(ws.root, 'packages/api/.claude/skills/deployer/SKILL.md', '---\nname: deployer\n---\nDeploy.\n');
    // A .claude dir buried in node_modules must be ignored.
    await write(ws.root, 'node_modules/pkg/.claude/skills/ghost/SKILL.md', '---\nname: ghost\n---\nNo.\n');

    const found = await discoverClaudeWorkspace(ws.root);
    const skillNames = found.skills.map((s) => s.name).sort();
    assert.deepEqual(skillNames, ['deployer', 'reviewer']);
    assert.ok(found.projectRoots.includes(path.join(ws.root, 'packages', 'api')));
  } finally {
    await ws.cleanup();
  }
});

test('a directory without .claude reports nothing but does not throw', async () => {
  const ws = await makeWorkspace();
  try {
    const empty = path.join(ws.root, 'empty');
    const found = await discoverClaudeWorkspace(empty);
    assert.equal(found.hasClaudeDir, false);
    assert.equal(found.skills.length, 0);
    assert.equal(found.agents.length, 0);
    assert.equal(found.workspaceGuide, null);
  } finally {
    await ws.cleanup();
  }
});
