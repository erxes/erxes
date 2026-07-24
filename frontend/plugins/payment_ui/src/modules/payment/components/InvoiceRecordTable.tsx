import { IconInvoice } from '@tabler/icons-react';
import { Empty, RecordTable } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { invoicesColumns } from './InvoiceColumns';
import { useInvoices } from '../hooks/use-invoices';

const InvoiceEmptyState = () => {
  const { t } = useTranslation('payment');

  return (
    <Empty className="m-3">
      <Empty.Header>
        <Empty.Media variant="default">
          <IconInvoice />
        </Empty.Media>
        <Empty.Title>{t('no-invoices')}</Empty.Title>
      </Empty.Header>
    </Empty>
  );
};

export function InvoiceRecordTable() {
  const { t } = useTranslation('payment');
  const { invoices, loading, pageInfo, handleFetchMore } = useInvoices();
  const { hasPreviousPage, hasNextPage } = pageInfo || {};

  return (
    <RecordTable.Provider
      data={invoices || []}
      columns={invoicesColumns(t)}
      className="m-3"
      stickyColumns={['invoiceNumber']}
    >
      <RecordTable.CursorProvider
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        loading={loading}
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
        {!loading && invoices?.length === 0 && <InvoiceEmptyState />}
      </RecordTable.CursorProvider>
    </RecordTable.Provider>
  );
}
