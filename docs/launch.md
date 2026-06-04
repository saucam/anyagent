# Launch kit

Ready-to-use copy for launching anyagent. Edit to taste.

## The one-liner

> **Stop re-teaching every AI agent how you work.**

Backup lines:

- Write your agent setup once. Run it in any agent.
- Your AI workflow should belong to you, not to one assistant.

## Positioning (the paragraph that matters)

> anyagent isn't another agent, and it isn't a skill marketplace. It's the
> **compatibility layer between agents**. AI coding tools are converging on the
> same primitives — skills, agents, rules, project guidance — but not on one
> filesystem layout. So your best instructions get trapped in whichever tool you
> set them up in. anyagent keeps your Claude Code `.claude/` workspace as the
> single source of truth and projects it into the native formats Codex, Gemini,
> and Cursor already read. One setup. Every assistant. No copy-paste drift.

## Show HN

**Title:** `Show HN: anyagent – use your Claude Code skills/agents in Codex, Gemini, and Cursor`

**Body:**

> I kept rebuilding the same setup — skills, subagents, project rules — every
> time I opened a different AI coding tool, and they drifted out of sync
> immediately.
>
> anyagent treats your Claude Code `.claude/` workspace as the source of truth
> and bridges it into the native layouts other tools already discover: Codex
> (`.agents/skills`, `.codex/agents/*.toml`, `AGENTS.md`), Gemini, and Cursor
> (`.cursor/rules/*.mdc`). Skills are symlinked (relative, so the workspace stays
> portable), agents are converted, and `CLAUDE.md` becomes `AGENTS.md`/`GEMINI.md`.
>
> The design bet is honesty: anything that doesn't map cleanly (Claude hooks,
> tool policies, Cursor's lack of subagents) is preserved as instructions and
> **reported as a warning**, never dropped silently. There's also an
> `anyagent check` that exits non-zero when a target drifts, so you can gate it
> in CI.
>
> TypeScript, zero runtime deps, MIT. Feedback welcome — especially on the
> agent-conversion fidelity and which target to add next (Windsurf? Aider?).

## X / LinkedIn thread

1. You spent weeks building your Claude Code setup — skills, subagents, rules.
   Then you open Codex or Cursor and start from zero. Again. 🧵
2. Every tool is converging on the same ideas (skills, agents, project guidance)
   — but a different filesystem layout. Your knowledge gets trapped in one tool.
3. anyagent fixes that. One command:
   `npx anyagent sync --to codex gemini cursor`
   → your Claude skills + agents + CLAUDE.md show up natively in all three.
4. It's honest about what doesn't translate. Lossy conversions are *reported*,
   not silently dropped. Trust > magic.
5. `anyagent check` exits non-zero on drift → drop it in CI so a repo's shared
   agent setup can't rot. [demo gif]
6. MIT, zero deps, TypeScript. ⭐ github.com/saucam/anyagent — tell me which
   agent to bridge next.

## Subreddits / communities

- r/ClaudeAI, r/ChatGPTCoding, r/cursor
- Tag the `AGENTS.md` conversation — anyagent *generates* AGENTS.md from your
  Claude setup, which is the timely hook.

## Assets

Hero GIF + architecture diagram: see [`assets/SPEC.md`](assets/SPEC.md).
