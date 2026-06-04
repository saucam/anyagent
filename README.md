<div align="center">

# anyagent

### Write your agent setup once. Run it in any agent.

**Stop re-teaching every AI agent how you work.**

[![CI](https://github.com/saucam/anyagent/actions/workflows/ci.yml/badge.svg)](https://github.com/saucam/anyagent/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/anyagent.svg)](https://www.npmjs.com/package/anyagent)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![node](https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg)](https://nodejs.org)
[![zero deps](https://img.shields.io/badge/runtime%20deps-0-success.svg)](package.json)

</div>

---

You spent weeks building your **Claude Code** setup — skills, subagents, project rules, workspace guidance. Then you open **Codex**, or **Gemini**, and every one of them starts the session half-amnesiac. So you copy-paste folders, rewrite agents in a different format, and watch them drift out of sync forever.

**anyagent** keeps your Claude Code `.claude/` workspace as the single source of truth and projects it into the native formats other agents already know how to read. One canonical setup. Every assistant. No duplicated folders, no copy-paste drift.

```bash
npx anyagent sync --to codex gemini
```

That's it. Your Claude skills now show up in Codex's `.agents/skills/`, your agents become Codex TOML and Gemini Markdown, and your `CLAUDE.md` becomes `AGENTS.md` and `GEMINI.md` — all generated from the one workspace you already maintain.

## 30-second demo

```bash
# 1. Scaffold a canonical workspace (or use your existing .claude/)
npx anyagent init

# 2. See exactly what anyagent can find
npx anyagent doctor

# 3. Preview every change without touching disk
npx anyagent plan --to codex gemini hermes

# 4. Bridge it
npx anyagent sync --to codex gemini hermes
```

Now the *same* Claude-origin skill and reviewer agent are discoverable in Codex and Gemini — no rewrite, no second copy to keep in sync.

## Why this exists

AI coding tools are converging on the same **primitives** — skills, agents, rules, commands, hooks, MCP servers — but **not** on one filesystem layout or manifest format:

| Tool | Skills | Agents | Project guidance |
| ---- | ------ | ------ | ---------------- |
| Claude Code | `.claude/skills/*/SKILL.md` | `.claude/agents/*.md` | `CLAUDE.md` |
| Codex | `.agents/skills/*` | `.codex/agents/*.toml` | `AGENTS.md` |
| Gemini | `.gemini/skills/*` | `.gemini/agents/*.md` | `GEMINI.md` |

The next layer of value isn't another agent. It's the **compatibility layer between agents** — so your accumulated workflow knowledge belongs to *you*, not to whichever tool you opened today.

## How it works

```
          ┌──────────────────────────┐
          │   Canonical source       │
          │   .claude/               │
          │     skills/              │
          │     agents/              │
          │     settings.json        │
          │   CLAUDE.md              │
          └────────────┬─────────────┘
                       │  anyagent sync
        ┌──────────────┼──────────────┐
        ▼              ▼               ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │  Codex  │    │ Gemini  │    │ Hermes  │
   │ .agents │    │ .gemini │    │ .hermes │
   │ .codex  │    │ GEMINI  │    │WORKSPACE│
   │ AGENTS  │    │  .md    │    │  .md    │
   └─────────┘    └─────────┘    └─────────┘
```

- **Skills are symlinked** (relative links, so your workspace stays portable) into each target's native skill folder. Edit once, every agent sees the change instantly.
- **Agents are converted** into each target's manifest — Codex TOML, Gemini/Hermes Markdown — preserving the original instructions.
- **Workspace guidance is generated**: `CLAUDE.md` → `AGENTS.md` / `GEMINI.md` / `.hermes/WORKSPACE.md`.
- **Lossy conversions are reported, never silent.** When a Claude-specific concept (hooks, tool policies) has no native equivalent, anyagent preserves it as readable instructions and prints a `warn:` line. Trust comes from honesty.

```
$ anyagent sync --to codex
[codex] link skill
  from: .claude/skills/reviewer
  to:   .agents/skills/reviewer
[codex] converted agent
  from: .claude/agents/reviewer.md
  to:   .codex/agents/reviewer.toml
  warn: Claude agent tool and hook semantics are preserved as instructions, not native Codex policy.
[codex] generated guide
  from: CLAUDE.md
  to:   AGENTS.md

3 operation(s), 1 warning(s)
```

## Install

Run it with no install:

```bash
npx anyagent <command>
```

Or install globally:

```bash
npm install -g anyagent
anyagent sync --to codex gemini
```

Requires **Node.js ≥ 20**. Zero runtime dependencies.

## Commands

| Command | What it does |
| ------- | ------------ |
| `anyagent init` | Scaffold a starter canonical `.claude/` workspace. Never overwrites existing files. |
| `anyagent doctor` | Report every skill, agent, setting, and guide anyagent can see. |
| `anyagent plan` | Print the exact operations `sync` would perform — no writes. |
| `anyagent sync` | Bridge skills, agents, and guidance into each target. |
| `anyagent watch` | Re-run `sync` on an interval so targets track the source. |

### Flags

| Flag | Default | Meaning |
| ---- | ------- | ------- |
| `--root <path>` | `.` | The workspace root to read from. |
| `--to <targets...>` | `codex gemini hermes` | Which targets to bridge into. |
| `--copy` | off (symlink) | Copy skills instead of symlinking — for environments where symlinks aren't ideal. |
| `--dry-run` | off | Plan the work without writing anything. |
| `--interval-ms <n>` | `2000` | `watch` poll interval (min 250). |

## Design principles

- **One source of truth.** Prefer symlinks and generated files over manual copies.
- **Native discovery first.** Feed each agent the files it already knows how to load.
- **No runtime magic.** The bridge does its work before the agent starts.
- **Lossy conversions must be visible.** Never silently drop behavior.
- **Local-first.** No cloud dependency. No telemetry. Ever.
- **Boring filesystem wins.** It should feel obvious the moment you see it.

## Supported targets

| Target | Status | Notes |
| ------ | ------ | ----- |
| Codex | ✅ | Skills, agents (TOML), `AGENTS.md` |
| Gemini | ✅ | Skills, agents (Markdown), `GEMINI.md` |
| Hermes | ✅ | Skills, agents (Markdown), `.hermes/WORKSPACE.md` |
| Cursor | 🔭 roadmap | `.cursor/rules/*` |
| Windsurf | 🔭 roadmap | — |
| Aider / OpenCode | 🔭 roadmap | — |

Want a target? [Open an issue](https://github.com/saucam/anyagent/issues/new/choose) or read [CONTRIBUTING.md](CONTRIBUTING.md) — adapters are ~40 lines and share a tested contract.

## Roadmap

- Cursor and Windsurf adapters
- MCP config normalization across tools
- A hook-compatibility matrix
- Cross-agent command conversion
- `anyagent publish` — export a portable, shareable bundle
- GitHub Action to validate shared agent setups in a repo

See [proposal.md](proposal.md) for the full vision.

## Contributing

Issues and PRs welcome. The codebase is small (~600 lines), strict TypeScript, zero runtime deps, and fully tested. Start with [CONTRIBUTING.md](CONTRIBUTING.md).

```bash
git clone https://github.com/saucam/anyagent
cd anyagent
npm install
npm run build
npm test
```

## License

[MIT](LICENSE) © [Yash Datta](https://github.com/saucam)

---

<div align="center">

**Your AI workflow should belong to you, not to one assistant.**

</div>
