import { RecordTable } from 'erxes-ui';
import { useCoversList } from '@/pos/pos-covers/hooks/UseCoversList';
import { coverColumns } from '@/pos/pos-covers/components/CoverColumns';
import { CoverCommandBar } from '@/pos/pos-covers/components/cover-command-bar/CoverCommandBar';
import { useIsPosCoverLeadSessionKey } from '@/pos/pos-covers/hooks/UsePosCoverLeadSessionKey';
import { IconShoppingCartX } from '@tabler/icons-react';

export const CoversRecordTable = () => {
  const { coversList, handleFetchMore, loading, pageInfo } = useCoversList();
  const { sessionKey } = useIsPosCoverLeadSessionKey();

  return (
    <RecordTable.Provider
      columns={coverColumns}
      data={coversList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={pageInfo?.hasPreviousPage}
        hasNextPage={pageInfo?.hasNextPage}
        dataLength={coversList?.length}
        sessionKey={sessionKey}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
        {!loading && coversList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No covers yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first cover.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <CoverCommandBar />
    </RecordTable.Provider>
  );
};
