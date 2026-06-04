import path from 'node:path';
import type { BridgeReport, ReportEntry, TargetName } from './types.js';

export function createReport(): BridgeReport {
  return {
    entries: [],
    add(target: TargetName, action: string, source: string, destination: string, warnings: string[] = []) {
      this.entries.push({ target, action, source, destination, warnings });
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
