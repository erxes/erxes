import { RecordTable } from 'erxes-ui';
import { invoicesColumns } from './InvoiceColumns';

import { useInvoices } from '../hooks/use-invoices';

export function InvoiceRecordTable() {
  const { invoices, loading } = useInvoices();
  return (
    <RecordTable.Provider
      data={invoices || []}
      columns={invoicesColumns}
      className="m-3"
    >
      <RecordTable.Scroll>
        <RecordTable>
          <RecordTable.Header />
          <RecordTable.Body>
            <RecordTable.RowList />
            {loading && <RecordTable.RowSkeleton rows={30} />}
          </RecordTable.Body>
        </RecordTable>
      </RecordTable.Scroll>
    </RecordTable.Provider>
  );
}
