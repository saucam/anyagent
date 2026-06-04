# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - Unreleased

### Added

- **Cursor adapter** — skills and agents convert to `.cursor/rules/*.mdc`, and `CLAUDE.md` becomes an always-applied workspace rule. Lossy spots (no skill folder, no subagent concept) are reported, not dropped.
- **`anyagent check`** (and `sync --check`) — writes nothing and exits non-zero when any bridged target drifts from the source. A CI gate for shared `.claude/` setups.
- **Composite GitHub Action** (`saucam/anyagent@v1`) wrapping `anyagent check`.
- **Release workflow** — publishes to npm (with provenance) when a GitHub Release is published.
- `scripts/demo.sh`, `docs/launch.md`, and `docs/assets/SPEC.md`.

### Changed

- Generated guides are now written via `writeOutput`, so identical content is a no-op — quieter `watch`, meaningful `check`.
- `doctor` output reworked into a scannable ✓/✗ summary with a "ready to bridge" line.
- Default `--to` is now `codex gemini cursor hermes`.

## [0.1.0] - 2026-06-04

Initial public release.

### Added

- `anyagent init` — scaffold a starter canonical `.claude/` workspace (never overwrites).
- `anyagent doctor` — report discovered skills, agents, settings, and workspace guidance.
- `anyagent plan` — preview every sync operation without touching disk.
- `anyagent sync` — bridge skills, agents, and guidance into Codex, Gemini, and Hermes layouts.
- `anyagent watch` — re-run sync on an interval so targets track the source.
- Codex, Gemini, and Hermes adapters with a shared, tested `TargetAdapter` contract.
- Lossy-conversion warnings surfaced in the sync report instead of being dropped silently.
- Full test suite on Node's built-in runner; CI on Node 20 and 22.

### Notes

This is the first release under the name **anyagent** (previously prototyped as
`agent-bridge`). The bridge is intentionally filesystem-first and dependency-free.

[Unreleased]: https://github.com/saucam/anyagent/compare/v0.1.0...HEAD
[0.2.0]: https://github.com/saucam/anyagent/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/saucam/anyagent/releases/tag/v0.1.0
