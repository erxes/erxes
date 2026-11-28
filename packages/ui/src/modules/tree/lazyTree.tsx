import { onDemand } from 'erxes-ui/components/on-demand';

/*
 * The tree rows load the first time a page shows one: erxes-ui is one chunk every route loads,
 * and only some plugin pages use them. A tree's parts share their fold state, so they come
 * from one module.
 */

const tableTree = async () =>
  (await import('../record-table/components/RecordTableTree')).RecordTableTree;

const selectTree = async () => (await import('../pickers/SelectTree')).SelectTree;

/**
 * A record table whose rows are a tree, indented with arrows that fold.
 * Wrap the table in it with an `id` and `ordered` (rows in tree order, each with its `order`
 * path such as "01/02/"), render rows with `RecordTable.RowList Row={RecordTableTree.Row}`, and
 * start the first cell with `RecordTableTree.Trigger`. Every row opens again when `length`
 * changes.
 */
export const RecordTableTree = Object.assign(
  onDemand(async () => tableTree()),
  {
    Indentation: onDemand(async () => (await tableTree()).Indentation),
    Arrow: onDemand(async () => (await tableTree()).Arrow),
    Trigger: onDemand(async () => (await tableTree()).Trigger),
    Row: onDemand(async () => (await tableTree()).Row),
  },
);

/**
 * A picker's items as a tree, indented with arrows that fold.
 * `SelectTree.Provider` (an `id`, `ordered` while the items are in tree order, unsearched) wraps
 * the list, and each item is a `SelectTree.Item` with its `order` path and `hasChildren`.
 */
export const SelectTree = Object.assign(
  onDemand(async () => selectTree()),
  {
    Item: onDemand(async () => (await selectTree()).Item),
    Provider: onDemand(async () => (await selectTree()).Provider),
  },
);
