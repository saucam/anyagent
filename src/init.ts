import path from 'node:path';
import { exists, rel, writeFile } from './fs-utils.js';

const STARTER_GUIDE = `# Workspace Map

Describe what this workspace is and the conventions every agent should follow.

## Conventions

- Prefer small, focused changes.
- Run tests before shipping user-facing behavior.
`;

const STARTER_AGENT = `# Reviewer Agent

You are a senior code reviewer. Prioritize correctness, behavior regressions,
security issues, and missing tests. Keep summaries brief and lead with concrete
findings and file references.
`;

const STARTER_SKILL = `---
name: reviewer
description: Use for code review focused on correctness, regressions, security, and missing tests.
---

Review like an owner. Lead with concrete findings and file references.
`;

interface InitResult {
  created: string[];
  skipped: string[];
}

/**
 * Scaffolds a minimal canonical `.claude/` workspace so a first-time user has
 * something real to bridge. Never overwrites existing files.
 */
export async function initWorkspace(root: string, dryRun = false): Promise<InitResult> {
  const absRoot = path.resolve(root);
  const targets: Array<{ file: string; content: string }> = [
    { file: path.join(absRoot, 'CLAUDE.md'), content: STARTER_GUIDE },
    { file: path.join(absRoot, '.claude', 'agents', 'reviewer.md'), content: STARTER_AGENT },
    { file: path.join(absRoot, '.claude', 'skills', 'reviewer', 'SKILL.md'), content: STARTER_SKILL }
  ];

  const created: string[] = [];
  const skipped: string[] = [];
  for (const target of targets) {
    if (await exists(target.file)) {
      skipped.push(rel(absRoot, target.file));
      continue;
    }
    await writeFile(target.file, target.content, dryRun);
    created.push(rel(absRoot, target.file));
  }
  return { created, skipped };
}
