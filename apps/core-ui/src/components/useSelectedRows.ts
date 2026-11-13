import { RecordTable } from 'erxes-ui';

/** The records behind the rows selected in the surrounding `RecordTable.Provider`, whose data is `rows`. */
export const useSelectedRows = <T extends { id: string }>(rows: T[]) => {
  const selection = RecordTable.useRecordTableState((state) => state.rowSelection);

  return rows.filter((row) => selection[row.id]);
};
