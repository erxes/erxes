# Lessons

> Institutional scar tissue. Things AI got wrong in this repo, and how to avoid them next time. **Read this at the start of every session.** Append to it after every shipped feature where you learned something non-obvious.

## How to add an entry

```markdown
## YYYY-MM-DD — <one-line title>
**Symptom:** what looked wrong / what broke.
**Root cause:** why it happened.
**Lesson:** the durable rule. What to check or do differently next time.
**Where applicable:** which skill / file / pattern (so the lesson is searchable).
```

Keep entries to ≤5 lines each. If a lesson is bigger than that, it probably wants to become a `rules/` file or a `SLOP-CHECKLIST.md` entry.

## What counts as a lesson

- AI shipped something that broke a test it didn't realize existed
- A skill's "files to touch" list missed a real dependency
- A sister feature mirrored had a subtle exception that didn't apply
- A pattern that "looks like" precedent but isn't
- An error message that was misleading; the actual cause was elsewhere
- A multi-tenant leak that compiled and passed local tests but broke under another subdomain

## What is NOT a lesson

- "I forgot to import X" — that's a one-time mistake, not durable knowledge
- "I confused two variable names" — typo, not lesson
- Repo facts that belong in `glossary.md` or `stack.md`
- Decisions that belong in `decisions.md`

If you're not sure, write the lesson. Stale lessons get pruned periodically; missing ones never get added.

## Pruning

Quarterly: re-read this file end to end. Lessons that are now baked into rules/skills can be deleted with a `(absorbed into <path>)` note. Lessons that are now obsolete (e.g., the pattern they warned about no longer exists) get deleted outright.

---

## Entries

## 2026-05-22 — `add-deal-field.md` skill points to the wrong UI surface for "edit" wishes
**Symptom:** Phase 3 GROUND for the riskLevel wish: skill said mirror `priority` through `AddCardForm.tsx` + `salesFormSchema`. Read both files — `priority` isn't there. The Add form covers only: name, description, assignedUserIds, companyIds, customerIds, labelIds, tagIds.
**Root cause:** The skill conflates two surfaces — Add (the create sheet) and Detail/Edit (the persistent deal sheet). `priority` is only wired in the Detail/Edit surface. The skill's "frontend sister" file list omits the detail sheet entirely.
**Lesson:** When the wish says "editable from the deal detail sheet" (not "add deal sheet"), AddCardForm is the wrong file. The skill needs a second file-set for the detail/edit surface. For now: grep `frontend/plugins/sales_ui/src/modules/deals/` for `priority` to locate the real detail-sheet component before mirroring.
**Where applicable:** `skills/sales/add-deal-field.md` — needs an update pass to split "create surface" from "edit/detail surface" sisters.

## 2026-05-22 — `.agents/` needs `pnpm install --ignore-workspace`
**Symptom:** Running `pnpm install` from inside `.agents/` reports "Scope: all 23 workspace projects" in 1.8s and installs nothing. `pnpm exec playwright` then fails with `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`.
**Root cause:** `pnpm-workspace.yaml` at repo root globs `backend/**` and `frontend/**`. `.agents/` is not in the workspace, but pnpm still detects the workspace config and runs in workspace mode, ignoring `.agents/package.json`.
**Lesson:** First-time setup in `.agents/` requires `pnpm install --ignore-workspace`. `evals/run.sh` detects the missing install and emits the exact command. The README's "First-time setup" section is the single source of truth — don't shortcut to `pnpm install` in docs.
**Where applicable:** `README.md` setup section, `evals/run.sh` Playwright branch, any future doc that mentions installing in `.agents/`.

## 2026-05-22 — `priority` is already a Deal field (free-text string)
**Symptom:** Initial docs drafted `priority` as the canonical "new field" example. A skills-writing subagent verified against the codebase and found `priority: String, optional` already at `backend/plugins/sales_api/src/modules/sales/db/definitions/deals.ts:96`.
**Root cause:** I wrote `data-model.md` from memory of "common CRM feature requests" without verifying against the live schema.
**Lesson:** Before claiming a field "does not exist" in a doc, grep the schema. Better yet, derive the field list from the schema, not from intuition.
**Where applicable:** `docs/sales/data-model.md`, `evals/golden-tasks.md`, any future skill that names a field.

## 2026-05-22 — Module Federation exposes drift between code and docs
**Symptom:** `docs/sales/module-federation.md` lists 5 exposes; the actual `module-federation.config.ts` has more (e.g. `posSettings`, `salesSettings` alias, `automationsWidget`).
**Root cause:** Doc was written from CLAUDE.md's example snippet, not from the live config.
**Lesson:** Documentation about config files must be derived from the config file, not from sample code. When in doubt, `cat` the source.
**Where applicable:** `docs/sales/module-federation.md`, any future doc that quotes a config file.

## 2026-05-22 — Deal filter UIs live in two places — share-able vs. action-bar-only
**Symptom:** When mirroring `priority` for `riskLevel`, found two parallel `SelectPriority` implementations: `components/deal-selects/SelectPriority.tsx` (the deal-detail/card variant with `card/detail/form/icon` variants) and `components/common/filters/SelectPriority.tsx` (the action-bar variant with `FilterBar`/`FilterView`/`FilterItem`). Each is wired separately by callers; they don't share code.
**Root cause:** The action-bar Filter pattern (`Filter.View`/`Filter.BarItem`/`Filter.Item`) uses the erxes-ui `Filter` primitive, which has a different control flow than the deal-detail `SelectTriggerOperation` pattern. They are intentionally separate APIs.
**Lesson:** For a new field that needs both an edit-in-detail picker AND an action-bar filter, you need to expose the picker at both surfaces — either with two files (`deal-selects/SelectX.tsx` + `common/filters/SelectX.tsx`) or one file that namespaces both via `Object.assign` (the route I took for `riskLevel`). Either is fine; pick the one that matches the closest sister. Don't try to unify across the two APIs.
**Where applicable:** `skills/sales/add-deal-field.md` — add a "where the edit and filter surfaces differ" callout. The `priority` pattern has two files; I went one-file for `riskLevel`. Both work.

## 2026-05-22 — Function-name slop in PR bodies (cite by grep, not by skill quotation)
**Symptom:** PR #7758 body said "auto-discovered by `generateSalesFields`" for segment field #5. Reviewer caught it — `generateSalesFields` is at `backend/plugins/sales_api/src/modules/sales/fieldUtils.ts:178`, not in `meta/`, and the actual segment-field auto-discovery flows through core-modules (`setupSegmentProducers` → `esTypesMap` → `gatherDependentServicesType`). The local `generateSalesFields` feeds into that pipeline but is not the discoverer.
**Root cause:** The PR body quoted a function name out of the skill (`add-sales-segment-field.md`) without grepping to confirm what the function actually does and where it lives. Skill text said "auto-discover via `generateSalesFields`" — true in spirit, but the body inherited the imprecision.
**Lesson:** Before citing a function name in a PR body, REVIEW.md, or any artifact the developer will read: `grep -rn '<functionName>'` and confirm both location and role. Skills can be approximations; PR bodies cannot. SLOP-CHECKLIST.md needs a new entry for "function names cited but not grep-verified."
**Where applicable:** Phase 7 REVIEW + SHIP; `SLOP-CHECKLIST.md`; `add-sales-segment-field.md` (the skill's claim should be tightened too).

## 2026-05-22 — `Deal.riskLevel` rides every deal-list query via `commonListFields` (over-fetch awareness)
**Symptom:** PR #7758 added `riskLevel` to `frontend/plugins/sales_ui/src/modules/deals/graphql/queries/DealsQueries.ts` `commonListFields`. Result: every deal-list query now fetches `riskLevel` even on pages that don't display the badge. Fine for a tiny string today, but the pattern compounds across many `add-deal-field` wishes.
**Root cause:** The skill `add-deal-field.md` PLAN says "extend `commonFields`" without distinguishing "fields the kanban card needs" from "fields only the detail sheet needs." Mirroring `priority` 1:1 means inheriting `priority`'s over-fetch.
**Lesson:** When adding a field, consider whether it's needed on the **list query** (board, table) or only on the **detail query** (one-deal fetch). If detail-only, add to `dealDetail` fragments instead of `commonListFields`. Not a slop blocker for small scalars; matters for arrays, JSON, or fields with N+1 resolvers.
**Where applicable:** `add-deal-field.md` — add a "list-vs-detail fragment" note. Future fields like big JSON or arrays should default to detail-only.

## 2026-05-22 — tRPC procedures return `{ status, data | errorMessage }`
**Symptom:** Easy to write a tRPC procedure that returns bare values; existing procedures in the sales plugin wrap with `{ status: 'success' | 'error', data | errorMessage }`.
**Root cause:** Convention is not enforced by tRPC itself; only by precedent.
**Lesson:** Mirror an existing procedure's return shape before declaring done. See `add-sales-trpc-procedure.md`.
**Where applicable:** every new tRPC procedure on sales.
