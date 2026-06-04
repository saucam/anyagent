# Security Policy

## Scope

anyagent is a local-first CLI. It reads a workspace, writes generated files, and
creates symlinks. It makes **no network calls**, collects **no telemetry**, and
has **zero runtime dependencies** — which keeps the attack surface small.

The areas worth scrutiny are:

- **Filesystem writes** — `sync` removes and recreates target paths (`.agents/`,
  `.codex/`, `.gemini/`, `.hermes/`, `AGENTS.md`, `GEMINI.md`). Always review a
  `plan` (or run with `--dry-run`) before syncing into an unfamiliar workspace.
- **Symlink creation** — skills are linked with **relative** targets inside the
  workspace.

## Reporting a vulnerability

If you find a security issue, please **do not** open a public issue. Instead use
GitHub's [private vulnerability reporting](https://github.com/saucam/anyagent/security/advisories/new)
for this repository, or contact the maintainer directly.

You can expect an acknowledgement within a few days. Once a fix is available
we'll coordinate a release and credit you (unless you prefer to remain anonymous).

## Supported versions

This project is pre-1.0; security fixes land on the latest released version.
