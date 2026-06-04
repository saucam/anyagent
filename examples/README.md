# Example workspace

`claude-source/` is a minimal but real canonical workspace:

```
claude-source/
  CLAUDE.md                      # workspace guidance
  .claude/
    agents/reviewer.md           # a subagent
    skills/reviewer/SKILL.md     # a skill
    settings.json                # permissions
```

Try anyagent against it without installing anything:

```bash
# from the repo root
npm run build

# see what's discoverable
node dist/cli.js doctor --root examples/claude-source

# preview the bridge (no writes)
node dist/cli.js plan --root examples/claude-source --to codex gemini hermes

# actually bridge it
node dist/cli.js sync --root examples/claude-source --to codex gemini hermes
```

After `sync`, you'll see generated `.agents/`, `.codex/`, `.gemini/`, `.hermes/`,
`AGENTS.md`, and `GEMINI.md` appear next to the source. Those outputs are
`.gitignore`d — regenerate them any time with the commands above.
