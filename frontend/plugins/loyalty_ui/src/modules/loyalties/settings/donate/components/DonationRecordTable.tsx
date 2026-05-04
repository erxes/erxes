import { RecordTable } from 'erxes-ui';

import { donationColumns } from './DonationColumns';
import { DonationCommandBar } from './donation-command-bar/DonationCommandBar';
import { useDonations } from '../hooks/useDonations';
import { useDonationStatusEdit } from '../hooks/useDonationStatusEdit';
import { DONATIONS_CURSOR_SESSION_KEY } from '../constants/donationsCursorSessionKey';

import { IconHeart } from '@tabler/icons-react';
import { LoyaltyDonationAddSheet } from './DonationAddSheet';

export const DonationRecordTable = () => {
  const { donations, handleFetchMore, loading, pageInfo } = useDonations();
  const { editStatus } = useDonationStatusEdit();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  return (
    <RecordTable.Provider
      columns={donationColumns(editStatus)}
      data={donations || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'title']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={donations?.length}
        sessionKey={DONATIONS_CURSOR_SESSION_KEY}
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
        {!loading && donations?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconHeart
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">
                    No donation yet
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating your first donation.
                  </p>
                </div>
                <LoyaltyDonationAddSheet />
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <DonationCommandBar />
    </RecordTable.Provider>
  );
};
