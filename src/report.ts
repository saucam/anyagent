import path from 'node:path';
import type { BridgeReport, TargetName } from './types.js';

export function createReport(): BridgeReport {
  return {
    entries: [],
    add(
      target: TargetName,
      action: string,
      source: string,
      destination: string,
      warnings: string[] = [],
      changed = true
    ) {
      this.entries.push({ target, action, source, destination, warnings, changed });
    }
  };
}

function display(root: string | undefined, filePath: string): string {
  if (!root) return filePath;
  return path.relative(root, filePath) || '.';
}

export function printReport(report: BridgeReport, root?: string): void {
  if (report.entries.length === 0) {
    console.log('No operations were needed.');
    return;
  }
  let warningCount = 0;
  for (const entry of report.entries) {
    console.log(`[${entry.target}] ${entry.action}`);
    console.log(`  from: ${display(root, entry.source)}`);
    console.log(`  to:   ${display(root, entry.destination)}`);
    for (const warning of entry.warnings) {
      console.log(`  warn: ${warning}`);
      warningCount += 1;
    }
  }
  const summary = `${report.entries.length} operation(s)` + (warningCount ? `, ${warningCount} warning(s)` : '');
  console.log(`\n${summary}`);
}

/** True when any operation in the report changed (or would change) a target. */
export function reportHasDrift(report: BridgeReport): boolean {
  return report.entries.some((entry) => entry.changed);
}

/**
 * Renders the `--check` view: list only what's out of date and return whether
 * the workspace is in sync. The CLI turns `false` into a non-zero exit.
 */
export function printCheck(report: BridgeReport, root?: string): boolean {
  const drifted = report.entries.filter((entry) => entry.changed);
  if (drifted.length === 0) {
    console.log(`✓ up to date — ${report.entries.length} bridged artifact(s) match the source.`);
    return true;
  }
  console.log(`✗ out of date — ${drifted.length} artifact(s) would change:`);
  for (const entry of drifted) {
    console.log(`  [${entry.target}] ${entry.action}: ${display(root, entry.destination)}`);
  }
  console.log(`\nRun \`anyagent sync\` to update them.`);
  return false;
}
