import { RecordTable } from 'erxes-ui';

/** The records behind the rows selected in the surrounding `RecordTable.Provider`, whose data is `rows`. */
export const useSelectedRows = <T>(rows: T[]): T[] => {
  // TanStack Table v8 changes the selection inside the same table object, so a compiled hook
  // would cache the selected rows on a table that never changes.
  'use no memo';
  const { table } = RecordTable.useRecordTable();

  return table.getFilteredSelectedRowModel().rows.flatMap((row) => rows[row.index] ?? []);
};
