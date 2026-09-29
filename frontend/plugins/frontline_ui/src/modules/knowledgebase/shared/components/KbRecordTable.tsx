import { ColumnDef } from '@tanstack/react-table';
import { RecordTable } from 'erxes-ui';
import { ReactNode } from 'react';
import { KbErrorState } from '@/knowledgebase/shared/components/KbStates';

export const KbRecordTable = <T,>({
  columns,
  data,
  loading,
  error,
  tableId,
  empty,
  commandBar,
}: {
  columns: ColumnDef<T>[];
  data: T[];
  loading: boolean;
  error?: { message: string };
  tableId: string;
  empty: ReactNode;
  commandBar: ReactNode;
}) => {
  if (error) {
    return <KbErrorState message={error.message} />;
  }

  if (!loading && data.length === 0) {
    return empty;
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={data}
      stickyColumns={['more', 'checkbox', 'title']}
      className="m-3"
      tableId={tableId}
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading ? (
              <RecordTable.RowSkeleton rows={10} />
            ) : (
              <RecordTable.RowList />
            )}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
      {commandBar}
    </RecordTable.Provider>
  );
};
