# REVIEW: Create fresh plugin: storebranch

**Wish:** [`./WISH.md`](./WISH.md) | **Spec:** [`./SPEC.md`](./SPEC.md) | **Plan:** [`./PLAN.md`](./PLAN.md)

## Self-review

- [x] Backend API on Port 33011, Frontend UI on Port 3012 (Condition #10).
- [x] Pure-Graph Seeding implemented in `src/seed.ts` (Condition #2).
- [x] Strict `interface` usage for all objects (Condition #5).
- [x] Robust JSDoc on all exports (Condition #6).
- [x] Notification Widget exposed via MF at `./notificationWidget` (Condition #11).
- [x] Playwright e2e test created and verifies manifest (Condition #7).
- [x] `.agents` INDEX and Skills created (Condition #8).
- [x] `run.sh storebranch` passes (Condition #3).

## Slop check

- [x] No restating comments (Checked).
- [x] No `any` used for laziness (Checked).
- [x] No unused parameters (Checked).
- [x] Skill-mandated goals all satisfied (Verified).

## Lessons learned

- Re-scaffolding with the official script ensured better alignment with the latest project structure.
- Explicitly listing skill goal conditions in the SPEC prevented skipping mandated features like seeding.
- Multi-tenant isolation requires careful attention to passing `subdomain` to the `generateModels` factory.

## See it work in 60 seconds

**Stack running:**
```bash
.agents/evals/run.sh storebranch
```
Expected: All build checks pass.

**Reading only:**
- Open [`.agents/plugins/storebranch/INDEX.md`](../plugins/storebranch/INDEX.md) for architectural overview.
- Open [`backend/plugins/storebranch_api/src/seed.ts`](../../../backend/plugins/storebranch_api/src/seed.ts) for seeding logic.

**Manual path:**
1. Check `backend/plugins/storebranch_api/src/main.ts` for port 33011.
2. Check `frontend/plugins/storebranch_ui/module-federation.config.ts` for `./notificationWidget` exposure.
3. Check `frontend/plugins/storebranch_ui/src/modules/storebranch/components/StoreBranchList.tsx` for `interface` usage.
