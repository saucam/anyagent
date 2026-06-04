import { readFileSync } from 'node:fs';

/**
 * Reads the package version from package.json, which ships next to dist/ in the
 * published tarball (`dist/version.js` → `../package.json`) and at the repo root
 * during development (`src/version.ts` → `../package.json`).
 */
export function getVersion(): string {
  const pkgUrl = new URL('../package.json', import.meta.url);
  const pkg = JSON.parse(readFileSync(pkgUrl, 'utf8')) as { version: string };
  return pkg.version;
}
