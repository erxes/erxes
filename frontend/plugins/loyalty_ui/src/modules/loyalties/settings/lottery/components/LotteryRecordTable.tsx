import { RecordTable } from 'erxes-ui';

import { IconHeart } from '@tabler/icons-react';
import { LOTTERY_CURSOR_SESSION_KEY } from '../constants/lotteryCursorSessionKey';
import { lotteryColumns } from './LotteryColumns';
import { useLotteryStatusEdit } from '../hooks/useLotteryStatusEdit';
import { useLottery } from '../hooks/useLotteries';
import { LotteryAddSheet } from './LotteryAddSheet';
import { LotteryCommandBar } from './lottery-command-bar/LotteryCommandBar';

export const LotteryRecordTable = () => {
  const { lottery, handleFetchMore, loading, pageInfo } = useLottery();
  const { editStatus } = useLotteryStatusEdit();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  return (
    <RecordTable.Provider
      columns={lotteryColumns(editStatus)}
      data={lottery || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'title']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={lottery?.length}
        sessionKey={LOTTERY_CURSOR_SESSION_KEY}
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
        {!loading && lottery?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconHeart
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">No lottery yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating your first lottery.
                  </p>
                </div>
                <LotteryAddSheet />
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <LotteryCommandBar />
    </RecordTable.Provider>
  );
};
