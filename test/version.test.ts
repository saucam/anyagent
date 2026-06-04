import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { getVersion } from '../src/version.js';

test('getVersion returns the package.json version as semver', async () => {
  const version = getVersion();
  assert.match(version, /^\d+\.\d+\.\d+/, `expected semver, got ${version}`);

  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(version, pkg.version);
});
