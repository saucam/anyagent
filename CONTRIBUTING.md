# Contributing to anyagent

Thanks for helping make agent setups portable. This project is small, strict, and dependency-free on purpose — contributions that keep it that way are the easiest to merge.

## Development setup

```bash
git clone https://github.com/saucam/anyagent
cd anyagent
npm install
npm run build      # compile src/ -> dist/
npm test           # run the test suite (node:test via tsx)
npm run typecheck  # type-check src/ AND test/
```

Run the tool against the bundled example without touching your machine:

```bash
npm run demo       # sync the example workspace in --dry-run
```

## Project layout

```
src/
  cli.ts                 # arg parsing + command dispatch
  discover.ts            # finds .claude skills / agents / settings / CLAUDE.md
  init.ts                # `anyagent init` scaffolding
  fs-utils.ts            # relative symlinks, idempotent linking, IO helpers
  report.ts              # the sync report (and its warnings)
  adapters/              # one file per target (codex, gemini, hermes)
  converters/            # claude-agent -> target-specific manifest
  types.ts               # the shared contract every adapter implements
test/                    # node:test specs (one per concern)
examples/claude-source/  # a real canonical workspace to bridge
```

## Adding a new target adapter

An adapter is ~40 lines. The contract lives in [`src/types.ts`](src/types.ts) as `TargetAdapter`:

```ts
export interface TargetAdapter {
  name: TargetName;
  plan(source: ClaudeWorkspace, options: BridgeOptions): Promise<PlannedOperation[]>;
  sync(source: ClaudeWorkspace, options: BridgeOptions, report: BridgeReport): Promise<void>;
}
```

To add, say, an `aider` adapter (`cursor` and `windsurf` are already built — read [`src/adapters/cursor.ts`](src/adapters/cursor.ts) or [`src/adapters/windsurf.ts`](src/adapters/windsurf.ts) as references for a generate-only target):

1. Add `'aider'` to `TargetName` in `src/types.ts`.
2. Create `src/adapters/aider.ts` exporting an `aiderAdapter: TargetAdapter`. Use `linkOrCopyDir` for skills (if the target has a skill folder) and `writeOutput` for generated guidance — both produce **relative** paths, and `writeOutput` makes the target check-aware for free.
3. Register it in `src/adapters/index.ts`.
4. If agents need a target-specific shape, add `convertClaudeAgentToAider` in `src/converters/claude-agent.ts`.
5. Add a spec in `test/sync.test.ts`, and extend the cross-target loops (the "no absolute path leaks" and "check mode" tests) to include your target.

### Non-negotiables for adapters

- **Generated files and symlinks must be relative.** Never write an absolute path into a generated artifact — it breaks the portability that's the whole point. The `generated files never leak an absolute home path` test enforces this across every target.
- **`sync` must be idempotent.** Running it twice should report skips, not churn. Use `writeOutput` (not `writeFile`) for generated files so identical content is a no-op. The `sync is idempotent` and `check mode` tests enforce this.
- **Report drift honestly.** Pass the real `changed` flag to `report.add(...)` (`result === 'changed'` / `result === 'applied'`) so `anyagent check` can gate CI.
- **Lossy conversions emit a warning, never a silent drop.** Add a `warnings: [...]` entry to the `ConvertedAgent` instead of dropping the field.
- **`--dry-run` and `--check` must write nothing.** `writeOutput` and `linkOrCopyDir` already honor both — thread `options` through, don't reach past them.

## Tests

We use Node's built-in test runner — no test-framework dependency. Add focused specs under `test/*.test.ts`. Every spec creates its own temp workspace via `test/helpers.ts` and cleans up in a `finally`.

```bash
npm test
```

CI runs `typecheck`, `test`, and `build` on Node 20 and 22. All three must pass.

## Commit messages & PRs

- Keep commits small and focused.
- Describe the user-visible behavior change in the PR, and call out any conversion that becomes lossy.
- New behavior needs a test. Bug fixes need a test that fails before the fix.

## Code of conduct

By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).
