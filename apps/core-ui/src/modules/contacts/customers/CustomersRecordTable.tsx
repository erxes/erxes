import type { CustomerState } from '@erxes/core-contract';
import { RecordTable } from 'erxes-ui';
import { messageOf } from '~/lib/api';
import { CustomersCommandBar } from './CustomersCommandBar';
import { useCustomersColumns } from './customersColumns';
import { customersSessionKey, useCustomers } from './useCustomers';

export const CustomersRecordTable = ({ state }: { state: CustomerState }) => {
  const { list, loading, error, hasNextPage, hasPreviousPage, handleFetchMore } = useCustomers(state);
  const columns = useCustomersColumns();

  if (error) {
    return <div className="m-3 text-sm text-destructive">{messageOf(error)}</div>;
  }

  return (
    <RecordTable.Provider
      columns={columns}
      data={list}
      stickyColumns={['more', 'checkbox', 'avatar', 'name']}
      className="m-3"
      tableId={`core_${state}s_record_table`}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={list.length}
        sessionKey={customersSessionKey(state)}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton handleFetchMore={handleFetchMore} />
            {loading ? <RecordTable.RowSkeleton rows={32} /> : <RecordTable.RowList />}
            <RecordTable.CursorForwardSkeleton handleFetchMore={handleFetchMore} />
          </RecordTable.Body>
        </RecordTable>
        {!loading && list.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No {state === 'lead' ? 'leads' : 'customers'} yet.
          </p>
        )}
      </RecordTable.CursorProvider>
      <CustomersCommandBar />
    </RecordTable.Provider>
  );
};
