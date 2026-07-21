import { RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { invoicesColumns } from './InvoiceColumns';
import { InvoiceFilterBar } from './InvoiceFilterBar';
import { useInvoices } from '../hooks/use-invoices';

export function InvoiceRecordTable() {
  const { t } = useTranslation('payment');
  const { invoices, loading, pageInfo, handleFetchMore } = useInvoices();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      data={invoices || []}
      columns={invoicesColumns(t)}
      className="m-3"
      stickyColumns={['checkbox', 'invoiceNumber']}
    >
      <InvoiceFilterBar />
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        dataLength={invoices?.length}
      >
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.CursorBackwardSkeleton
              handleFetchMore={handleFetchMore}
            />
            {loading && <RecordTable.RowSkeleton rows={20} />}
            <RecordTable.RowList />
            <RecordTable.CursorForwardSkeleton
              handleFetchMore={handleFetchMore}
            />
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
}
