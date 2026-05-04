import { IconSettings2 } from '@tabler/icons-react';
import { ColumnDef, RecordTable } from 'erxes-ui';
import { ReactNode } from 'react';

interface Props<T extends object> {
  configs: T[];
  columns: ColumnDef<T>[];
  emptyDescription: string;
  commandBar: ReactNode;
}

export const ErkhetConfigRecordTable = <T extends object>({
  configs,
  columns,
  emptyDescription,
  commandBar,
}: Props<T>) => (
  <RecordTable.Provider
    columns={columns}
    data={configs}
    className="m-3"
    tableOptions={{ enableRowSelection: true } as any}
  >
    <RecordTable>
      <RecordTable.Header />
      <RecordTable.Body>
        <RecordTable.RowList />
      </RecordTable.Body>
    </RecordTable>
    {configs.length === 0 && (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3 text-center">
          <IconSettings2 size={48} className="text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">No configs yet</h3>
          <p className="text-sm text-gray-500">{emptyDescription}</p>
        </div>
      </div>
    )}
    {commandBar}
  </RecordTable.Provider>
);
