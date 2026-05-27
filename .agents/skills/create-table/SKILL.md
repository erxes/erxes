---
name: create-table
description: Build erxes table and list screens with existing RecordTable, cursor pagination, filters, loading states, actions, and command bar patterns.
---

# Skill: Create Table Page

## Workflow

1. Find existing table page
2. Reuse the existing table pattern; frontend plugins commonly use
   `RecordTable`
3. Match pagination behavior
4. Match filter/search behavior
5. Match loading states
6. Match action button layout
7. Reuse existing empty states
8. Match bulk action and command bar behavior when the nearby table has it
9. Run focused validation: `pnpm nx lint <plugin>` and
   `pnpm nx build <plugin>`

## Important

- Preserve existing UX patterns
- Avoid custom table systems
- Reuse existing components first
- For cursor lists, prefer existing `useRecordTableCursor`,
  `validateFetchMore`, and `RecordTable.CursorProvider` patterns
