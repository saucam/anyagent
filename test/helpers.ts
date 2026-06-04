import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/**
 * Creates an isolated temporary workspace seeded with a canonical `.claude/`
 * layout (one skill, one agent, settings, and a CLAUDE.md guide). Returns the
 * absolute root; callers should `cleanup()` in a `finally`.
 */
export async function makeWorkspace(): Promise<{ root: string; cleanup: () => Promise<void> }> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'anyagent-'));

  await write(root, 'CLAUDE.md', '# Workspace Map\n\n- Prefer small, focused changes.\n');
  await write(
    root,
    '.claude/agents/reviewer.md',
    '# Reviewer Agent\n\nYou are a senior code reviewer.\n'
  );
  await write(
    root,
    '.claude/skills/reviewer/SKILL.md',
    '---\nname: reviewer\ndescription: Code review skill.\n---\n\nReview like an owner.\n'
  );
  await write(root, '.claude/settings.json', '{\n  "permissions": { "allow": ["Bash(npm test:*)"] }\n}\n');

  return {
    root,
    cleanup: () => fs.rm(root, { recursive: true, force: true })
  };
}

export async function write(root: string, relPath: string, content: string): Promise<void> {
  const target = path.join(root, relPath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content, 'utf8');
}

export async function read(root: string, relPath: string): Promise<string> {
  return fs.readFile(path.join(root, relPath), 'utf8');
}

export async function exists(root: string, relPath: string): Promise<boolean> {
  try {
    await fs.lstat(path.join(root, relPath));
    return true;
  } catch {
    return false;
  }
}

export async function lstat(root: string, relPath: string) {
  return fs.lstat(path.join(root, relPath));
}

export async function readlink(root: string, relPath: string): Promise<string> {
  return fs.readlink(path.join(root, relPath));
}
