import { RecordTable } from 'erxes-ui';
import {
  firstPosSummaryColumns,
  secondPosSummaryColumns,
  generateOtherPaymentColumns,
} from './PosSummaryColumns';
import { PosSummaryCommandBar } from '@/pos/pos-summary/components/pos-summary-command-bar/PosSummaryCommandBar';
import { usePosSummaryList } from '~/modules/pos/pos-summary/hooks/UsePosSummaryList';
import { IconShoppingCartX } from '@tabler/icons-react';

export const PosSummaryRecordTable = ({ posId }: { posId?: string }) => {
  const { posSummaryList, handleFetchMore, loading, pageInfo } =
    usePosSummaryList({ posId });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const allColumns = [
    ...firstPosSummaryColumns,
    ...generateOtherPaymentColumns(posSummaryList?.[0]?.amounts || {}),
    ...secondPosSummaryColumns,
  ];
  const columnsKey = allColumns.map((c) => c.id || '').join('|');
  return (
    <RecordTable.Provider
      key={columnsKey}
      columns={allColumns}
      data={posSummaryList}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={posSummaryList?.length}
        sessionKey="pos_summary_cursor"
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
        {!loading && posSummaryList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No pos summary yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first pos summary.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <PosSummaryCommandBar />
    </RecordTable.Provider>
  );
};
