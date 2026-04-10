import { RecordTable } from 'erxes-ui';
import {
  firstVoucherColumns,
  secondVoucherColumns,
} from '@/loyalties/vouchers/components/VoucherColumns';
import { useVouchersList } from '@/loyalties/vouchers/hooks/UseVoucherList';
import { IconShoppingCartX } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';

export const VoucherRecordTable = ({ posId }: { posId?: string }) => {
  const { vouchersList, handleFetchMore, loading, pageInfo } = useVouchersList({
    posId,
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const allColumns = [...firstVoucherColumns, ...secondVoucherColumns];
  const columnsKey = allColumns.map((c) => c.id || '').join('|');

  if (loading) return <Spinner />;

  return (
    <RecordTable.Provider
      key={columnsKey}
      columns={allColumns}
      data={vouchersList || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'number']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={vouchersList?.length}
        sessionKey="vouchers_cursor"
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
        {!loading && vouchersList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No vouchers yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first voucher.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      {/* <VoucherCommandBar /> */}
    </RecordTable.Provider>
  );
};
