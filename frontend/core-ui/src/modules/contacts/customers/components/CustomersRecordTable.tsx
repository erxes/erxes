import { RecordTable } from 'erxes-ui';
import { useCustomers } from '@/contacts/customers/hooks/useCustomers';
import { customersColumns } from './CustomersColumns';
import { CustomersCommandBar } from '@/contacts/customers/components/customers-command-bar';
import { useIsCustomerLeadSessionKey } from '../hooks/useCustomerLeadSessionKey';
export const CustomersRecordTable = () => {
  const { customers, handleFetchMore, loading, pageInfo } = useCustomers();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};
  const { sessionKey } = useIsCustomerLeadSessionKey();

  return (
    <RecordTable.Provider
      columns={customersColumns}
      data={customers || [{}]}
      stickyColumns={['more', 'checkbox', 'avatar', 'name']}
      className="m-3"
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={customers?.length}
        sessionKey={sessionKey}
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
      </RecordTable.CursorProvider>
      <CustomersCommandBar />
    </RecordTable.Provider>
  );
};
