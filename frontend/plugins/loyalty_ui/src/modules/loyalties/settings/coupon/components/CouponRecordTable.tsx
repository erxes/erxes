import { RecordTable } from 'erxes-ui';

import { couponColumns } from './CouponColumns';
import { CouponCommandBar } from './coupon-command-bar/CouponCommandBar';
import { useCoupons } from '../hooks/useCoupons';
import { useCouponStatusEdit } from '../hooks/useCouponStatusEdit';
import { COUPONS_CURSOR_SESSION_KEY } from '../constants/couponsCursorSessionKey';

import { IconTicket } from '@tabler/icons-react';
import { LoyaltyCouponAddSheet } from './CouponAddSheet';

export const CouponRecordTable = () => {
  const { coupons, handleFetchMore, loading, pageInfo } = useCoupons();
  const { editStatus } = useCouponStatusEdit();

  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  return (
    <RecordTable.Provider
      columns={couponColumns(editStatus)}
      data={coupons || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={coupons?.length}
        sessionKey={COUPONS_CURSOR_SESSION_KEY}
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
        {!loading && coupons?.length === 0 && (
          <div>
            <div className=" h-full w-full px-8 flex justify-center">
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                <div className="mb-6">
                  <IconTicket
                    size={64}
                    className="text-muted-foreground mx-auto mb-4"
                  />
                  <h3 className="text-xl font-semibold mb-2">No coupon yet</h3>
                  <p className="text-muted-foreground max-w-md">
                    Get started by creating your first coupon.
                  </p>
                </div>
                <LoyaltyCouponAddSheet />
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
      <CouponCommandBar />
    </RecordTable.Provider>
  );
};
