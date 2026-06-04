# anyagent: One Agent Setup, Everywhere

> This is the original vision document. The project shipped under the name
> **anyagent** — "write your agent setup once, run it in any agent." Names like
> "anyagent" below are historical; the CLI is `anyagent`.

## The Pitch

Every serious AI coding user is building the same private operating system: skills, subagents, project rules, commands, hooks, MCP servers, review checklists, debugging rituals, and hard-won workflow knowledge.

Then they have to rebuild it again for every agent.

Claude Code has `.claude/`. Codex has `.agents/skills`, `AGENTS.md`, and TOML agents. Gemini has `.gemini/skills`, `.agents/skills`, and its own runtime conventions. Cursor, Windsurf, Aider, OpenCode, and emerging tools all have overlapping but incompatible formats.

The result is absurd: the user's best instructions are trapped inside one tool, while the rest of their agents start every session half-amnesiac.

**anyagent makes one agent setup portable.**

Keep your Claude Code setup as the source of truth, and let Codex, Gemini, Cursor, and other agents discover the same skills, rules, and agent definitions automatically.

No duplicated folders. No copy-paste drift. No re-teaching every agent from scratch.

## Why This Should Exist

AI coding tools are converging on the same primitives:

- Skills: reusable workflows packaged as `SKILL.md`
- Agents: specialized personas with instructions and tool policies
- Rules: persistent project and user guidance
- Commands: repeatable prompts and task launchers
- Hooks: lifecycle automation around tool calls and edits
- MCP servers: live integrations and external context

But they are not converging on one filesystem layout or manifest format.

That means the next layer of value is not another agent. It is the compatibility layer between agents.

The winning developer workflow will not be “choose one assistant forever.” It will be “bring your operating system of intent to every assistant you use.”

anyagent is that layer.

## The Viral One-Liner

**Stop re-teaching every AI agent how you work.**

## What anyagent Does

anyagent reads a canonical agent workspace, starting with Claude Code's `.claude/` layout, and exposes it to other tools through native-compatible files, symlinks, generated manifests, and validation reports.

```text
Canonical source
.claude/
  skills/
  agents/
  commands/
  hooks/
  mcp.json
  settings.json
  CLAUDE.md

Generated or linked targets
.agents/skills/          # Codex + Gemini shared skill discovery
.codex/agents/           # Codex custom agents
.gemini/skills/          # Gemini skills
AGENTS.md                # Codex project guidance
GEMINI.md                # Gemini project guidance
.cursor/rules/           # Cursor rules
```

The user keeps editing one canonical setup. anyagent handles the rest.

## Core Commands

```bash
anyagent init
anyagent sync --from claude --to codex gemini cursor
anyagent doctor
anyagent watch
anyagent explain .claude/agents/reviewer.md --target codex
```

## MVP

The first release should be small, sharp, and useful on day one.

1. Discover `.claude/skills/**/SKILL.md` at project and user scope.
2. Symlink those skills into `.agents/skills` and `.gemini/skills`.
3. Generate Codex-compatible custom agent TOML files from `.claude/agents/*.md`.
4. Generate `AGENTS.md` and `GEMINI.md` bridge instructions that point each agent at the shared layer.
5. Run `anyagent doctor` to show what is linked, converted, ignored, or lossy.
6. Add `watch` mode so changes in `.claude/` immediately refresh the target layouts.

The MVP should avoid trying to support every tool perfectly. It should make Claude, Codex, and Gemini feel dramatically closer first.

## The Hard Part

Skills are easy because the ecosystem is moving toward `SKILL.md`.

Agents are harder.

Claude agents, Codex agents, and Gemini agents do not share one schema. anyagent should not pretend otherwise. It should convert what can be converted, preserve the original, and clearly label lossy behavior.

Example warnings:

```text
WARN reviewer.md -> codex/reviewer.toml
Claude field "tools" has no exact Codex equivalent. Preserved as instruction text.

WARN security-auditor.md -> gemini/security-auditor.md
Hook dependency "PreToolUse" is Claude-specific. Not mapped.
```

Trust comes from honesty. The tool should be explicit about what translated cleanly and what did not.

## Design Principles

- **One source of truth.** Prefer symlinks and generated files over manual copies.
- **Native discovery first.** Feed each agent the files it already knows how to load.
- **No runtime magic required.** The bridge should work before the agent starts.
- **Lossy conversions must be visible.** Never silently drop behavior.
- **Local-first.** No cloud dependency. No telemetry by default.
- **Composable.** Work with existing tools like `skillshare`, `skrills`, and `vercel-labs/skills` where useful.
- **Boring filesystem wins.** The project should feel obvious after users see it.

## Why It Can Go Viral

Developers already have the pain. They are installing Claude skills, Codex skills, Gemini skills, Cursor rules, MCP configs, and subagents by hand. The annoyance is universal, easy to demonstrate, and immediately relatable.

The demo is simple:

```bash
anyagent init
anyagent sync --from claude --to codex gemini
codex "use my reviewer agent on this PR"
gemini "use my debugging skill on this failing test"
```

Then show that the same Claude-origin skill is available in all three tools.

That is the kind of demo people repost because it makes the fragmented agent ecosystem feel fixable.

## Positioning

anyagent is not another skill marketplace.

It is not trying to replace Claude Code, Codex, Gemini, Cursor, or any other agent.

It is the portability layer for the user's accumulated agent knowledge.

A good tagline:

> Your AI workflow should belong to you, not to one assistant.

## Initial Repository Shape

```text
anyagent/
  README.md
  proposal.md
  package.json
  src/
    cli.ts
    discover.ts
    sync.ts
    doctor.ts
    watch.ts
    adapters/
      claude.ts
      codex.ts
      gemini.ts
      cursor.ts
    converters/
      claude-agent-to-codex.ts
      claude-agent-to-gemini.ts
  examples/
    claude-source/
    codex-target/
    gemini-target/
  tests/
```

TypeScript is a good default because the target users are CLI-heavy developers, filesystem tooling is straightforward, and npm distribution is frictionless.

## First Public Release

Release `v0.1` with three promises:

1. It discovers Claude skills.
2. It exposes them to Codex and Gemini using native discovery paths.
3. It tells you exactly what did and did not translate.

Do not overbuild the first version. Make the core bridge excellent.

## Future Roadmap

- Cursor and Windsurf adapters
- MCP config normalization
- Hook compatibility matrix
- Cross-agent command conversion
- Agent schema registry
- VS Code extension for bridge status
- GitHub Action for validating shared agent setups in repos
- `anyagent publish` for exporting portable bundles
- Interactive migration from existing scattered agent configs

## Call To Action

The agent ecosystem is becoming powerful, but fragmented. Every new tool asks users to recreate the same context, rules, and workflows one more time.

anyagent gives that knowledge a home.

Bring your skills. Bring your agents. Bring your rules.

Use them everywhere.
