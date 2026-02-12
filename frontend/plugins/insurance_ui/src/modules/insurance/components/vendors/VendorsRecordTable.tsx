import { RecordTable } from 'erxes-ui';
import { IconBuilding } from '@tabler/icons-react';
import { vendorsColumns } from './VendorsColumns';
import { useVendors } from '~/modules/insurance/hooks';

const VENDORS_CURSOR_SESSION_KEY = 'vendors-cursor';

export const VendorsRecordTable = () => {
  const { vendors, loading } = useVendors();

  return (
    <RecordTable.Provider
      columns={vendorsColumns}
      data={vendors || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'name']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={false}
        hasNextPage={false}
        dataLength={vendors?.length}
        sessionKey={VENDORS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
        {!loading && vendors?.length === 0 && (
          <div className="h-full w-full px-8 flex justify-center">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-6">
                <IconBuilding
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">No vendors yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Get started by creating your first insurance vendor.
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
