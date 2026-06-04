export type TargetName = 'codex' | 'gemini' | 'cursor' | 'windsurf' | 'hermes';

export type LinkMode = 'link' | 'copy';

export interface BridgeOptions {
  root: string;
  targets: TargetName[];
  mode: LinkMode;
  dryRun: boolean;
  /**
   * Check mode: never write, but record whether each operation *would* change
   * disk. The CLI exits non-zero if anything is out of date. Implies no writes.
   */
  check: boolean;
}

export interface ClaudeSkill {
  name: string;
  dir: string;
  skillFile: string;
  scope: 'repo';
  projectRoot: string;
}

export interface ClaudeAgent {
  name: string;
  file: string;
  scope: 'repo';
  projectRoot: string;
}

export interface ClaudeSettings {
  name: string;
  file: string;
  data: unknown;
  scope: 'repo';
  projectRoot: string;
}

export interface WorkspaceGuide {
  file: string;
  content: string;
}

export interface ClaudeWorkspace {
  root: string;
  hasClaudeDir: boolean;
  projectRoots: string[];
  workspaceGuide: WorkspaceGuide | null;
  skills: ClaudeSkill[];
  agents: ClaudeAgent[];
  settings: ClaudeSettings[];
}

export interface PlannedOperation {
  type: 'skill' | 'agent' | 'guide' | 'settings';
  action: string;
  source: string;
  target: string;
}

export interface ReportEntry {
  target: TargetName;
  action: string;
  source: string;
  destination: string;
  warnings: string[];
  /** Whether this operation changed (or would change, in check/dry-run) the target. */
  changed: boolean;
}

export interface BridgeReport {
  entries: ReportEntry[];
  add(
    target: TargetName,
    action: string,
    source: string,
    destination: string,
    warnings?: string[],
    changed?: boolean
  ): void;
}

export interface TargetAdapter {
  name: TargetName;
  plan(source: ClaudeWorkspace, options: BridgeOptions): Promise<PlannedOperation[]>;
  sync(source: ClaudeWorkspace, options: BridgeOptions, report: BridgeReport): Promise<void>;
}

export interface ConvertedAgent {
  fileName: string;
  content: string;
  warnings: string[];
}
