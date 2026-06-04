# Media asset spec

Two README assets, produced with our in-house media stack (drishti compositor
for motion, the `fig_*.py` → headless-Chrome SVG/PNG pipeline for the diagram).
Drop the rendered files in this folder; the README already points here.

## 1. `architecture.svg` (+ `architecture.png` @2x)

Static "one source → many targets" diagram. Replaces the ASCII art in the
README "How it works" section.

- **Canvas:** ~1400×720, transparent or `#FFFFFF` background.
- **Palette / type:** the shared standard — `TEXT #1F2933`, `MUTED #6B7280`,
  `GRID #E5E7EB`; blue `#E2ECF6/#2C5F8C`, peach `#FCEFE7/#C26A4F`, green
  `#F0F6F1/#4A8054`. `ui-sans-serif` for labels, `ui-monospace` for paths.
- **Left node (source, blue, emphasized):** `.claude/` with children
  `skills/`, `agents/`, `settings.json`, and a sibling `CLAUDE.md`.
- **Center:** one arrow labeled `anyagent sync` fanning out.
- **Right nodes (targets, one box each):**
  - **Codex** → `.agents/skills/`, `.codex/agents/*.toml`, `AGENTS.md`
  - **Gemini** → `.gemini/skills/`, `.gemini/agents/*.md`, `GEMINI.md`
  - **Cursor** → `.cursor/rules/*.mdc`
  - **Hermes** → `.hermes/…`, `.hermes/WORKSPACE.md`
- **Green summary banner (bottom):** "Edit once. Every agent stays in sync."

## 2. `demo.gif` (terminal recording)

A ~15s terminal animation of the canonical demo. Source of truth for the exact
commands + output is [`scripts/demo.sh`](../../scripts/demo.sh); run it to
reproduce verbatim. Sequence (type each, let output settle ~1.2s):

```
$ anyagent init        # creates CLAUDE.md + .claude/{agents,skills}/reviewer
$ anyagent doctor      # ✓ checklist → "3 portable artifact(s) ready to bridge"
$ anyagent sync --to codex gemini cursor
                       # 9 operations across 3 tools, honest lossy `warn:` lines,
                       # ending "9 operation(s), 4 warning(s)"
$ anyagent check --to codex gemini cursor
                       # ✓ up to date — 9 bridged artifact(s) match the source.
```

- **Window:** rounded dark terminal, monospace, ~1200×760, ~12–14 fps.
- **The money beat:** the `sync` fan-out into **codex / gemini / cursor** — let
  those three bracket labels land. End on the green `✓ up to date`.
- **Output:** `demo.gif` (README hero) and, if cheap, `demo.mp4` for socials.

## Wiring

Once both land here, swap the two commented `<!-- MEDIA -->` blocks in the
README for the real `![](docs/assets/…)` embeds.
