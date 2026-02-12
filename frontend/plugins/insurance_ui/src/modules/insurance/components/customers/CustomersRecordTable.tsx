import { RecordTable } from 'erxes-ui';
import { IconUsers } from '@tabler/icons-react';
import { customersColumns } from './CustomersColumns';
import { useCustomers } from '~/modules/insurance/hooks';

const CUSTOMERS_CURSOR_SESSION_KEY = 'customers-cursor';

export const CustomersRecordTable = () => {
  const { customers, loading } = useCustomers();

  return (
    <RecordTable.Provider
      columns={customersColumns}
      data={customers || []}
      className="m-3"
      stickyColumns={['more', 'checkbox', 'fullName']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={false}
        hasNextPage={false}
        dataLength={customers?.length}
        sessionKey={CUSTOMERS_CURSOR_SESSION_KEY}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            {loading && <RecordTable.RowSkeleton rows={40} />}
            <RecordTable.RowList />
          </RecordTable.Body>
        </RecordTable>
        {!loading && customers?.length === 0 && (
          <div className="h-full w-full px-8 flex justify-center">
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
              <div className="mb-6">
                <IconUsers
                  size={64}
                  className="text-muted-foreground mx-auto mb-4"
                />
                <h3 className="text-xl font-semibold mb-2">
                  Харилцагч байхгүй байна
                </h3>
                <p className="text-muted-foreground max-w-md">
                  Эхний харилцагчаа үүсгэнэ үү
                </p>
              </div>
            </div>
          </div>
        )}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
};
