import { RecordTable } from 'erxes-ui';

/** The records behind the rows selected in the surrounding `RecordTable.Provider`, whose data is `rows`. */
export const useSelectedRows = <T>(rows: T[]): T[] => {
  const { table } = RecordTable.useRecordTable();

  return table.getFilteredSelectedRowModel().rows.flatMap((row) => rows[row.index] ?? []);
};
