import { useParams } from 'react-router-dom';
import { useFormsList } from '../hooks/useFormsList';
import { RecordTable } from 'erxes-ui';
import { ColumnDef } from '@tanstack/react-table';
import { IForm } from '../types/formTypes';

export const FormsList = () => {
  const { id } = useParams();
  const { forms, loading, handleFetchMore, pageInfo } = useFormsList({
    channelId: id || '',
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      columns={formsColumns as unknown as ColumnDef<IForm>[]}
      data={forms || []}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={forms?.length}
        sessionKey={'forms_cursor'}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading ? (
              <RecordTable.RowSkeleton rows={32} />
            ) : (
              <RecordTable.RowList />
            )}
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};

const formsColumns = [
  {
    accessorKey: 'name',
    label: 'Name',
    id: 'name',
  },
];
