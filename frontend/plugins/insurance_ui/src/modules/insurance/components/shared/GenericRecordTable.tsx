import { RecordTable } from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

interface GenericRecordTableProps<T> {
  columns: ColumnDef<T, any>[];
  data: T[];
  loading: boolean;
  sessionKey: string;
  stickyColumns?: string[];
  emptyState: EmptyStateProps;
}

export function GenericRecordTable<T>({
  columns,
  data,
  loading,
  sessionKey,
  stickyColumns = ['more', 'checkbox', 'name'],
  emptyState,
}: GenericRecordTableProps<T>) {
  return (
    <RecordTable.Provider
      columns={columns}
      data={data}
      className="m-3"
      stickyColumns={stickyColumns}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={false}
        hasNextPage={false}
        dataLength={data?.length}
        sessionKey={sessionKey}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
        {!loading && data?.length === 0 && (
          <div className="h-full w-full px-8 flex justify-center">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-6">
                <div className="text-muted-foreground mx-auto mb-4">
                  {emptyState.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {emptyState.title}
                </h3>
                <p className="text-muted-foreground max-w-md">
                  {emptyState.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
}
