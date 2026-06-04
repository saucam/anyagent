import path from 'node:path';
import { readText, rel } from '../fs-utils.js';
import type { ClaudeAgent, ConvertedAgent } from '../types.js';

function titleFromName(name: string): string {
  return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function sourceRef(agent: ClaudeAgent): string {
  // Reference the agent by its workspace-relative path so generated files stay
  // portable and never leak the author's home directory.
  return rel(agent.projectRoot, agent.file);
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
