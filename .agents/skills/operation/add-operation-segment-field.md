# add operation segment field

> **When to use:** the wish makes an operation field filterable in the segment builder (e.g. filter tasks by `estimatePoint`, filter projects by `leadId`).

## Phase 3 — GROUND (mirror an existing feature)

**Step 1 (mandatory): find the sister feature you will mirror.**

Operation defines properties and tags for segment content types in `backend/plugins/operation_api/src/main.ts`:

```ts
properties: {
  types: [
    {
      description: 'Task',
      type: 'task',
    },
    {
      description: 'Project',
      type: 'project',
    },
  ],
}
```

**Read these files in full** before writing any code:

- `backend/plugins/operation_api/src/main.ts` — contains properties registries.
- Segment handler/config scripts in other plugins to see the contract.

## Phase 4 — PLAN

1. **register segment field in properties meta** — files: `backend/plugins/operation_api/src/main.ts`
2. Run verification check.

## Phase 5 — IMPLEMENT (step-by-step)

1. **`main.ts`** — update properties types array.
2. Run `.agents/evals/run.sh operation`.
