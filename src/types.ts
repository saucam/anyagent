export type TargetName = 'codex' | 'gemini' | 'hermes';

export type LinkMode = 'link' | 'copy';

export interface BridgeOptions {
  root: string;
  targets: TargetName[];
  mode: LinkMode;
  dryRun: boolean;
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
}

export interface BridgeReport {
  entries: ReportEntry[];
  add(target: TargetName, action: string, source: string, destination: string, warnings?: string[]): void;
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
