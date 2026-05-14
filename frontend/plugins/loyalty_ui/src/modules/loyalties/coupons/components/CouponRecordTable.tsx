import { RecordTable, Spinner } from 'erxes-ui';
import { IconTicket } from '@tabler/icons-react';
import { couponColumns } from './CouponColumns';

import { CouponAddModal } from './CouponAddModal';
import { useCouponList } from '../hooks/useCouponList';

const COUPON_CURSOR_SESSION_KEY = 'coupons_cursor';

export const CouponRecordTable = () => {
  const { couponList, handleFetchMore, loading, pageInfo } = useCouponList();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  if (loading && !couponList?.length) return <Spinner />;

  return (
    <RecordTable.Provider
      columns={couponColumns}
      data={couponList || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'campaignId', 'code']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={couponList?.length}
        sessionKey={COUPON_CURSOR_SESSION_KEY}
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
        {!loading && couponList?.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
              <IconTicket size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                No coupons yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 mb-4">
                Get started by creating your first coupon.
              </p>
              <CouponAddModal />
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
