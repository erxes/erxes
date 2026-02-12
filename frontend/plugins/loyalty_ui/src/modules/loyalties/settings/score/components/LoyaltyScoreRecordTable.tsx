import { RecordTable } from 'erxes-ui';

import { scoreColumns } from './ScoreColumns';

import { useLoyaltyScore } from '../hooks/useLoyaltyScore';
import { useLoyaltyScoreEdit } from '../hooks/useLoyaltyScoreEdit';
import { LOYALTY_SCORE_CURSOR_SESSION_KEY } from '../constants/loyaltyScoreCursorSessionKey';

import { IconTicket } from '@tabler/icons-react';
import { LoyaltyScoreCommandBar } from './loyalty-score-command-bar/LoyaltyScoreCommandBar';
import { LoyaltyScoreAddSheet } from './LoyaltyScoreAddSheet';

export const ScoreRecordTable = () => {
  const { campaigns, handleFetchMore, loading, pageInfo } = useLoyaltyScore();
  const { editStatus } = useLoyaltyScoreEdit();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  return (
    <RecordTable.Provider
      columns={scoreColumns(editStatus)}
      data={campaigns || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'title']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={campaigns?.length}
        sessionKey={LOYALTY_SCORE_CURSOR_SESSION_KEY}
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
        {!loading && campaigns?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconTicket
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">
                    No score campaign yet
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating your first score campaign.
                  </p>
                </div>
                <LoyaltyScoreAddSheet />
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <LoyaltyScoreCommandBar />
    </RecordTable.Provider>
  );
};
