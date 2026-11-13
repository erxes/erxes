---
name: verify-models
description: Keep the TLA+ models of the file lifecycle and the job queue in step with the code. Use when changing anything in apps/core-api/src/modules/files or apps/core-api/src/modules/jobs, the core_files or core_jobs schema, or verify/tla.
---

Two models live in `verify/tla`:

| Model               | Covers                                                                          | Properties                                                                                                            | Real Postgres tests                     |
| ------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `FileLifecycle.tla` | `files.service.ts`, `storage.ts`, `files.http.ts`, migration `0015_file_states` | `ReadyHasCheckedBytes`, `NoBytesDeletedUnderLiveRecord`, `CompletionOwnsItsRow`, `DownloadsServeChecked`              | `concurrency.test.ts`, "file lifecycle" |
| `Jobs.tla`          | `jobs/jobs.ts`, migration `0017_jobs`                                           | `EnqueueFollowsTransaction`, `NeverLost`, `LeaseExclusive`, `AttemptsBounded`, `FinishedStaysFinished`, `AtLeastOnce` | `concurrency.test.ts`, "job queue"      |

Last reviewed against the code at the commit that added this skill. Move that forward only by
doing step 2.

## When you change covered code

1. Run `pnpm verify:models` before you start, so you know it passed.
2. Read your diff against each action's comment in the model. Every action names the `file:line`
   it stands for and is one atomic step there: one SQL statement, one storage call, one handler
   run, or a commit. Look for new writers of `core_files.status`, `core_files.key`, the stored
   objects, or `core_jobs` status, attempts and `locked_until`, including code that moved.
3. Change the model to match the code, not the other way round. Split an action when the code
   now does it in two steps, add one for a new writer, and update the line references.
4. Run `pnpm verify:models` again. Each `<Model>.cfg` must report no violation. Each
   `<Model>.broken-<what>.cfg` must still fail with its `\* expect:` line. A broken config that
   starts passing means the check no longer bites: fix the model.
5. Add a race to `apps/core-api/src/__tests__/concurrency.test.ts` for a new property or a new
   ordering, holding one side open with a gate the way the existing tests do.

Never weaken or drop a property to make a run pass, and never shrink the bounds to dodge a trace.
A timeout is a failure, not a pass.

## Reading a failure

TLC prints the shortest trace in the run's log under `.scratch/tlc/` (CI uploads them as the
`tlc-traces` artifact). Replay it against the code, step by step:

- If some step can't happen in the code (an action allows what the SQL or storage call refuses,
  or two actions are one statement in the code), it's a modeling error. Fix the model and say so.
- If every step can happen, it's a product bug. Write it as what a user or operator sees ("a
  third worker runs the job while the second still holds it"), reproduce it in
  `concurrency.test.ts`, and fix the code or report it. Model fixes and product fixes go in
  separate commits.

## Bounds and what is left out

- Files: two concurrent completions, three PUTs to one link, both storage drivers. Left out:
  `storeServerFile`, the size-mismatch branch (both drivers refuse other lengths), audit rows,
  several files, time.
- Jobs: two workers, two attempts, one manual retry. Time is abstract; leases end oldest first,
  because a queue's leases all have one length. Left out: atomic handlers' transactions, dedupe
  keys, `onDead`'s own effects, organisation deletion.

`tools/verify-models.sh` pins TLC 1.7.4 and Temurin JRE 21.0.13+9 by checksum and caches them in
`~/.cache/erxes-verify`. Change both the version and the checksum together.
