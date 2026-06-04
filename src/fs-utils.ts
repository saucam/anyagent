import fs from 'node:fs/promises';
import path from 'node:path';

export async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.lstat(filePath);
    return true;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return false;
    throw error;
  }
}

export async function ensureDir(dirPath: string, dryRun = false): Promise<void> {
  if (dryRun) return;
  await fs.mkdir(dirPath, { recursive: true });
}

export async function readText(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8');
}

export async function readJsonIfExists(filePath: string): Promise<unknown | null> {
  if (!(await exists(filePath))) return null;
  const raw = await readText(filePath);
  return JSON.parse(raw) as unknown;
}

export async function writeFile(filePath: string, content: string, dryRun = false): Promise<void> {
  if (dryRun) return;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, 'utf8');
}

export async function listDirs(dirPath: string): Promise<string[]> {
  if (!(await exists(dirPath))) return [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
    .map((entry) => path.join(dirPath, entry.name));
}

export async function listFiles(dirPath: string, extension?: string): Promise<string[]> {
  if (!(await exists(dirPath))) return [];
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && (!extension || entry.name.endsWith(extension)))
    .map((entry) => path.join(dirPath, entry.name));
}

async function targetAlreadyLinksToSource(target: string, source: string): Promise<boolean> {
  const targetStat = await fs.lstat(target).catch(() => null);
  if (!targetStat?.isSymbolicLink()) return false;
  const linkedPath = await fs.readlink(target);
  const resolvedLinkedPath = path.resolve(path.dirname(target), linkedPath);
  return resolvedLinkedPath === path.resolve(source);
}

export async function linkOrCopyDir(source: string, target: string, mode: 'link' | 'copy', dryRun = false): Promise<'applied' | 'skipped'> {
  // Symlinks are idempotent: if the bridge already points where we want, do nothing.
  // Copies are always refreshed so edits in the source propagate.
  if (mode === 'link' && (await targetAlreadyLinksToSource(target, source))) return 'skipped';
  if (dryRun) return 'applied';
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.rm(target, { recursive: true, force: true });
  if (mode === 'copy') {
    await fs.cp(source, target, { recursive: true });
    return 'applied';
  }
  // Relative symlinks keep the whole workspace portable/relocatable.
  const relativeSource = path.relative(path.dirname(target), source);
  await fs.symlink(relativeSource, target, 'dir');
  return 'applied';
}

export function rel(root: string, filePath: string): string {
  return path.relative(root, filePath) || '.';
}
