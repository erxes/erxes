import { RecordTable } from 'erxes-ui';
import {
  firstLotteryColumns,
  secondLotteryColumns,
} from '@/loyalties/lotteries/components/LotteryColumns';
import { useLotteryList } from '@/loyalties/lotteries/hooks/UseLotteryList';
import { IconShoppingCartX } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import { LotteryCommandBar } from './lottery-command-bar/LotteryCommandBar';

export const LotteryRecordTable = ({ posId }: { posId?: string }) => {
  const { lotteriesList, handleFetchMore, loading, pageInfo } = useLotteryList({
    posId,
  });
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  const allColumns = [...firstLotteryColumns, ...secondLotteryColumns];
  const columnsKey = allColumns.map((c) => c.id || '').join('|');

  if (loading) return <Spinner />;

  return (
    <RecordTable.Provider
      key={columnsKey}
      columns={allColumns}
      data={lotteriesList || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'number']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={lotteriesList?.length}
        sessionKey="lotteries_cursor"
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
        {!loading && lotteriesList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6">
                <IconShoppingCartX size={48} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No lotteries yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first lottery.
              </p>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <LotteryCommandBar />
    </RecordTable.Provider>
  );
};
