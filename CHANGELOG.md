# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
[0.1.0]: https://github.com/saucam/anyagent/releases/tag/v0.1.0
