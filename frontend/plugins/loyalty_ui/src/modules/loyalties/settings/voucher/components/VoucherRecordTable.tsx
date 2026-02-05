import { RecordTable } from 'erxes-ui';

import { voucherColumns } from './VoucherColumns';
import { VoucherCommandBar } from './voucher-command-bar/VoucherCommandBar';
import { useVouchers } from '../hooks/useVouchers';
import { useVoucherStatusEdit } from '../hooks/useVoucherStatusEdit';
import { VOUCHERS_CURSOR_SESSION_KEY } from '../constants/vouchersCursorSessionKey';

import { IconTicket } from '@tabler/icons-react';
import { LoyaltyVoucherAddSheet } from './VoucherAddSheet';

export const VoucherRecordTable = () => {
  const { vouchers, handleFetchMore, loading, pageInfo } = useVouchers();
  const { editStatus } = useVoucherStatusEdit();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  return (
    <RecordTable.Provider
      columns={voucherColumns(editStatus)}
      data={vouchers || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'title']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={vouchers?.length}
        sessionKey={VOUCHERS_CURSOR_SESSION_KEY}
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
        {!loading && vouchers?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconTicket
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">No voucher yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating your first voucher.
                  </p>
                </div>
                <LoyaltyVoucherAddSheet />
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <VoucherCommandBar />
    </RecordTable.Provider>
  );
};
