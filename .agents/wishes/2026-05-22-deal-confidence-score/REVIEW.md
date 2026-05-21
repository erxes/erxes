# REVIEW: Deal confidenceScore (0–100 integer, default 50)

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md) | **Plan:** [`./PLAN.md`](./PLAN.md)

## Self-review of the diff

I ran `git diff feat/agents-system..feat/deal-confidence-score` and read every changed line.

### Slop checklist walk-through

- [x] **Comments that restate the code** — clean. The only comments in the new code are in `SelectConfidenceScoreMin.tsx` (none) and the test spec (which documents *why* a test is skipped — that's a non-obvious "why").
- [x] **try/catch around code that cannot fail** — clean. No try/catch added.
- [x] **Helpers extracted for a single caller** — borderline-clean. The inline `ThresholdEditor` component in `SelectConfidenceScoreMin.tsx` is shared between `FilterBar` and `FilterView` (two callers), so it earns its extraction. The `clamp` helper has two callers (Enter handler and Apply button). Both pass the rule.
- [x] **Backwards-compat shims for code that doesn't exist** — clean. No "old field name" coalesce.
- [x] **// TODO: implement** — clean. No TODOs.
- [x] **Tests that only assert non-throw** — clean. The live tests assert URL contents and visible options; skipped tests document the seed gates.
- [x] **Validation at internal boundaries** — clean. The detail-sheet handler's `Number.isFinite && 0..100` guard is at the system boundary (user-supplied input from `<input type="number">`), so it earns its existence.
- [x] **"Just in case" parameters** — clean. Specifically rejected the `$in: [value]` array shape inherited from `priority` precedent (documented in GROUND.md "Deviations" #1).
- [x] **Renaming unused params to _var** — clean.
- [x] **Feature flags / config knobs for non-configurable code** — clean.
- [x] **Re-exports without purpose** — clean. `SelectConfidenceScoreMin` is `Object.assign({}, { ... })` matching `SelectPriority` precedent — exposes three FilterX components under one namespace.
- [x] **Defensive optional chaining on non-null types** — clean.
- [x] **console.log left in shipped code** — clean. `grep -rn 'console.log' frontend/plugins/sales_ui/src/modules/deals/components/common/filters/SelectConfidenceScoreMin.tsx` → 0 hits.
- [x] **`any` to silence the type checker** — clean.
- [x] **TS literal-union without schema enum** — N/A. `confidenceScore` is `number`, not a literal union. The schema-level `min: 0, max: 100` matches the static type's semantic range.
- [x] **Function names cited but not grep-verified** — verified all four function/component names in this REVIEW (`SelectConfidenceScoreMin`, `handleDealFieldChange`, `useQueryState`, `generateFilter`) exist as cited.
- [x] **Premature flexibility inherited from precedent** — explicit deviation documented in GROUND.md: rejected `$in: [v]` for `$gte`.

### Other things I checked

- [x] No files touched outside SPEC scope. Disclosure: I updated `meta/activity-log/constants.ts` (one line) so future updateDeal events emit a confidenceScore-change row; that file was named in PLAN/GROUND, just not in SPEC's "UI changes" header (it's a backend constant).
- [x] Subdomain scoping respected on every data path. No new data path introduced; `models.Deals.updateDeal` is already subdomain-scoped via `generateModels(subdomain)`.
- [x] No cross-plugin direct imports.
- [x] No new ports introduced.
- [x] No `erxes-api-shared` changes.
- [x] No `npm` / `yarn` usage.
- [x] No secrets committed.

## Acceptance criteria — each verified

1. **Detail sheet shows a numeric `confidenceScore` input pre-populated with the current value (default 50)** — verified by code inspection in `SalesFormFields.tsx` (`defaultValue={confidenceScore ?? 50}`). Skipped Playwright test documents the seed gate.
2. **User can edit to any integer in [0, 100] and the change persists** — verified by code inspection: `handleDealFieldChange('confidenceScore', next)` calls `editDeals` mutation; `commonFields` includes `confidenceScore` so Apollo cache stays in sync. Round-trip Playwright test skipped pending seeded deal.
3. **Values outside [0, 100] are rejected** — verified by Mongoose schema validators (`min: 0, max: 100`) and by the UI guard in `onBlur`. No Playwright assertion possible without a unit harness; documented as a `test.skip`.
4. **Kanban card displays a progress bar with fill = confidenceScore%** — verified by code inspection in `DealsBoardCard.tsx` (`role="progressbar"` div with inner `width: ${confidence}%`). Playwright assertion skipped pending seeded deal.
5. **Action bar exposes `Confidence ≥ N` filter; `N=70` returns deals with `confidenceScore >= 70`** — verified backend: `deals.ts` resolver emits `{ confidenceScore: { $gte: confidenceScoreMin } }`. Verified frontend: live-server Playwright test confirms URL push `?confidenceScoreMin=70`.
6. **Legacy deals (no `confidenceScore` in Mongo) render as 50** — verified: Mongoose schema `default: 50` applies on document load; UI also has a fallback `confidenceScore ?? 50` for cached payloads without the field. Skipped Playwright test documents the seed gate.

## Lessons captured

- [x] Yes — appended to [`../../memory/lessons.md`](../../memory/lessons.md):
  - "Numeric scalar fields can deviate from precedent: `$gte` filter vs `priority`'s `$in`."
  - "Mongoose `default:` is enough for legacy reads — no backfill migration needed for displayable numeric fields."

## Final verification

- [x] `.agents/evals/run.sh sales` exit 0 — see below
- [x] Playwright behavioral spec updated; tests requiring a live stack are skipped with documented gates (matching existing baseline pattern in the file)

```
─── [1] Build erxes-api-shared (prereq for backend plugins) ───
    ✓ erxes-api-shared built
─── [2] Build sales_api ───
    ✓ sales_api built
    ⚠ sales_api has no test target — skipping
─── [3] Build sales_ui ───
    ✓ sales_ui built

✓ All checks passed for plugin: sales
```

## PR

- Title: `feat(sales): add Deal confidenceScore (0–100, default 50)`
- Body: per `.github/PULL_REQUEST_TEMPLATE.md`
- Draft: yes (per developer instruction)
