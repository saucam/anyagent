import path from 'node:path';
import { readText, rel } from '../fs-utils.js';
import type { ClaudeAgent, ClaudeSkill, ConvertedAgent } from '../types.js';

function titleFromName(name: string): string {
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function sourceRef(agent: ClaudeAgent): string {
  // Reference the agent by its workspace-relative path so generated files stay
  // portable and never leak the author's home directory.
  return rel(agent.projectRoot, agent.file);
}

/**
 * Minimal frontmatter reader — pulls a single key (e.g. `description`) out of a
 * leading `---`-delimited block. Deliberately tiny: no YAML dependency, and
 * SKILL.md frontmatter is flat key/value.
 */
function frontmatterValue(content: string, key: string): string | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  for (const line of match[1].split('\n')) {
    const kv = line.match(new RegExp(`^${key}\\s*:\\s*(.+)$`));
    if (kv) return kv[1].trim().replace(/^["']|["']$/g, '');
  }
  return null;
}

function stripFrontmatter(content: string): string {
  return content.replace(/^---\n[\s\S]*?\n---\n?/, '').trimStart();
}

function mdcFrontmatter(description: string, alwaysApply: boolean): string {
  // Cursor rules (.mdc) read `description`, `globs`, and `alwaysApply`.
  return `---\ndescription: ${JSON.stringify(description)}\nglobs:\nalwaysApply: ${alwaysApply}\n---\n`;
}

export async function convertClaudeAgentToCodex(agent: ClaudeAgent): Promise<ConvertedAgent> {
  const body = await readText(agent.file);
  const displayName = titleFromName(agent.name);
  const ref = sourceRef(agent);
  const toml = `name = ${JSON.stringify(agent.name)}\ndescription = ${JSON.stringify(`${displayName} imported from Claude Code agent ${path.basename(agent.file)}.`)}\ndeveloper_instructions = ${JSON.stringify(`Imported from Claude Code agent: ${ref}\n\n${body}`)}\n`;
  return {
    fileName: `${agent.name}.toml`,
    content: toml,
    warnings: ['Claude agent tool and hook semantics are preserved as instructions, not native Codex policy.']
  };
}

export async function convertClaudeAgentToGemini(agent: ClaudeAgent): Promise<ConvertedAgent> {
  const body = await readText(agent.file);
  return {
    fileName: `${agent.name}.md`,
    content: `# ${titleFromName(agent.name)}\n\nImported from Claude Code agent: ${sourceRef(agent)}\n\n${body}`,
    warnings: ['Gemini agent schema support is target-specific; this version preserves the Claude agent as readable instructions.']
  };
}

export async function convertClaudeAgentToHermes(agent: ClaudeAgent): Promise<ConvertedAgent> {
  const body = await readText(agent.file);
  return {
    fileName: `${agent.name}.md`,
    content: `# ${titleFromName(agent.name)}\n\nImported from Claude Code agent: ${sourceRef(agent)}\n\n${body}`,
    warnings: []
  };
}

export async function convertClaudeAgentToCursor(agent: ClaudeAgent): Promise<ConvertedAgent> {
  const body = await readText(agent.file);
  const description = `Agent: ${titleFromName(agent.name)} (imported from Claude Code via anyagent)`;
  const content =
    mdcFrontmatter(description, false) +
    `\n# ${titleFromName(agent.name)}\n\nImported from Claude Code agent: ${sourceRef(agent)}\n\n${stripFrontmatter(body)}`;
  return {
    fileName: `agent-${agent.name}.mdc`,
    content,
    warnings: [
      'Cursor has no subagent concept; preserved as an opt-in (.mdc) rule, not an isolated agent with its own tool policy.'
    ]
  };
}

export async function convertClaudeSkillToCursor(skill: ClaudeSkill): Promise<ConvertedAgent> {
  const raw = await readText(skill.skillFile);
  const description =
    frontmatterValue(raw, 'description') ?? `Skill: ${titleFromName(skill.name)} (imported from Claude Code via anyagent)`;
  const ref = rel(skill.projectRoot, skill.skillFile);
  const content =
    mdcFrontmatter(description, false) +
    `\n# ${titleFromName(skill.name)}\n\nImported from Claude Code skill: ${ref}\n\n${stripFrontmatter(raw)}`;
  return {
    fileName: `skill-${skill.name}.mdc`,
    content,
    warnings: [
      'Cursor has no native skill format; converted to an agent-requested rule. Scripts and assets alongside SKILL.md are not carried into the rule.'
    ]
  };
}

function windsurfRuleFrontmatter(description: string, trigger: 'always_on' | 'manual'): string {
  // Windsurf rules (.windsurf/rules/*.md) read `trigger` and `description`.
  return `---\ntrigger: ${trigger}\ndescription: ${JSON.stringify(description)}\n---\n`;
}

export async function convertClaudeAgentToWindsurf(agent: ClaudeAgent): Promise<ConvertedAgent> {
  const body = await readText(agent.file);
  const description = `Agent: ${titleFromName(agent.name)} (imported from Claude Code via anyagent)`;
  const content =
    windsurfRuleFrontmatter(description, 'manual') +
    `\n# ${titleFromName(agent.name)}\n\nImported from Claude Code agent: ${sourceRef(agent)}\n\n${stripFrontmatter(body)}`;
  return {
    fileName: `agent-${agent.name}.md`,
    content,
    warnings: [
      'Windsurf has no subagent concept; preserved as a manually-triggered rule, not an isolated agent with its own tool policy.'
    ]
  };
}

export async function convertClaudeSkillToWindsurf(skill: ClaudeSkill): Promise<ConvertedAgent> {
  // A Claude skill is a reusable, invocable procedure — Windsurf's nearest
  // native concept is a workflow (.windsurf/workflows/*.md, invoked with /name).
  const raw = await readText(skill.skillFile);
  const description =
    frontmatterValue(raw, 'description') ?? `Skill: ${titleFromName(skill.name)} (imported from Claude Code via anyagent)`;
  const ref = rel(skill.projectRoot, skill.skillFile);
  const content =
    `---\ndescription: ${JSON.stringify(description)}\n---\n` +
    `\n# ${titleFromName(skill.name)}\n\nImported from Claude Code skill: ${ref}\n\n${stripFrontmatter(raw)}`;
  return {
    fileName: `${skill.name}.md`,
    content,
    warnings: [
      `Mapped to a Windsurf workflow (invoke with /${skill.name}). Scripts and assets alongside SKILL.md are not carried into the workflow.`
    ]
  };
}
