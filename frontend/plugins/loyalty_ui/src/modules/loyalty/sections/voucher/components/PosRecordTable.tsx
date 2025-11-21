import { RecordTable } from 'erxes-ui';

import { posColumns } from './columns';
import { useVoucherCampaign } from '~/modules/loyalty/sections/voucher/hooks/useVoucher';

export const VoucherCampaignRecordTable = () => {
  const { list, fetchMore, loading } = useVoucherCampaign();

  return (
    <RecordTable.Provider
      columns={posColumns}
      data={list}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        // hasPreviousPage={pageInfo?.hasPreviousPage}
        // hasNextPage={pageInfo?.hasNextPage}
        dataLength={list?.length}
        sessionKey="pos_cursor"
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton handleFetchMore={fetchMore} />
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton handleFetchMore={fetchMore} />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
      {/* <PosCommandBar /> */}
    </RecordTable.Provider>
  );
};
