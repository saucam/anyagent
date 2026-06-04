## What this changes

<!-- A short description of the user-visible behavior change. -->

## Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (new behavior has a test; bug fixes have a regression test)
- [ ] `npm run build` passes
- [ ] Generated files / symlinks stay **relative** (no absolute paths leaked)
- [ ] Any lossy conversion emits a `warn:` instead of dropping behavior silently
- [ ] `--dry-run` still writes nothing

## Notes for reviewers

<!-- Anything that became lossy, any new target, any contract change. -->
