import fs from 'node:fs/promises';
import path from 'node:path';
import { exists, listDirs, listFiles, readJsonIfExists, readText } from './fs-utils.js';
import type { ClaudeAgent, ClaudeSettings, ClaudeSkill, ClaudeWorkspace } from './types.js';

const ignoredDirs = new Set([
  '.git',
  '.hg',
  '.svn',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.turbo',
  '.cache',
  '__pycache__',
  '.venv',
  'venv'
]);

async function discoverSkills(projectRoot: string): Promise<ClaudeSkill[]> {
  const skillsDir = path.join(projectRoot, '.claude', 'skills');
  const skillDirs = await listDirs(skillsDir);
  const skills: ClaudeSkill[] = [];
  for (const dir of skillDirs) {
    const skillFile = path.join(dir, 'SKILL.md');
    if (!(await exists(skillFile))) continue;
    skills.push({ name: path.basename(dir), dir, skillFile, scope: 'repo', projectRoot });
  }
  return skills;
}

async function discoverAgents(projectRoot: string): Promise<ClaudeAgent[]> {
  const agentsDir = path.join(projectRoot, '.claude', 'agents');
  const files = await listFiles(agentsDir, '.md');
  return files.map((file) => ({
    name: path.basename(file, '.md'),
    file,
    scope: 'repo',
    projectRoot
  }));
}

async function discoverSettings(projectRoot: string): Promise<ClaudeSettings[]> {
  const settings: ClaudeSettings[] = [];
  for (const name of ['settings.json', 'settings.local.json']) {
    const file = path.join(projectRoot, '.claude', name);
    if (!(await exists(file))) continue;
    settings.push({ name, file, data: await readJsonIfExists(file), scope: 'repo', projectRoot });
  }
  return settings;
}

async function findClaudeProjectRoots(root: string): Promise<string[]> {
  const roots = new Set<string>();

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => null);
    if (!entries) return;

    if (entries.some((entry) => entry.isDirectory() && entry.name === '.claude')) {
      roots.add(dir);
    }

    for (const entry of entries) {
      if (!entry.isDirectory() || ignoredDirs.has(entry.name) || entry.name === '.claude') continue;
      await walk(path.join(dir, entry.name));
    }
  }

  await walk(root);
  return [...roots].sort();
}

export async function discoverClaudeWorkspace(root: string): Promise<ClaudeWorkspace> {
  const absRoot = path.resolve(root);
  const workspaceClaudeMd = path.join(absRoot, 'CLAUDE.md');
  const claudeDir = path.join(absRoot, '.claude');
  const projectRoots = await findClaudeProjectRoots(absRoot);
  const skills = (await Promise.all(projectRoots.map(discoverSkills))).flat();
  const agents = (await Promise.all(projectRoots.map(discoverAgents))).flat();
  const settings = (await Promise.all(projectRoots.map(discoverSettings))).flat();

  return {
    root: absRoot,
    hasClaudeDir: await exists(claudeDir),
    projectRoots,
    workspaceGuide: await exists(workspaceClaudeMd)
      ? { file: workspaceClaudeMd, content: await readText(workspaceClaudeMd) }
      : null,
    skills,
    agents,
    settings
  };
}
