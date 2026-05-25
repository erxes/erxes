# add frontline segment field

> **When to use:** the wish makes a frontline field filterable in the segment builder (e.g. filter tickets by `priority`, filter conversations by `closedUserId`).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Frontline defines properties and tags for segment content types in `backend/plugins/frontline_api/src/main.ts`:

```ts
properties: {
  types: [
    {
      description: 'Inbox',
      type: 'conversation',
    },
    {
      description: 'Tickets',
      type: 'ticket',
    },
  ],
}
```

**Read these files in full** before writing any code:

- `backend/plugins/frontline_api/src/main.ts` — contains tag and property module registries.
- Segment handler/config scripts in other plugins to see the contract.

## Phase 4 — PLAN

1. **register segment field in properties meta** — files: `backend/plugins/frontline_api/src/main.ts`
2. **extend properties mapper** — if custom properties require type mapping.
3. Run verification check.

## Phase 5 — IMPLEMENT (step-by-step)

1. **`main.ts`** — update the segment properties types array.
2. Run `.agents/evals/run.sh frontline`.
