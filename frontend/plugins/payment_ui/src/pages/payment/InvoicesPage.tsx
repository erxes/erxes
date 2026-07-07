import { PageSubHeader } from 'erxes-ui';
import { InvoiceFilterBar } from '~/modules/payment/components/InvoiceFilterBar';
import { InvoiceRecordTable } from '~/modules/payment/components/InvoiceRecordTable';

/** Invoices settings page with filter bar and invoice record table. */
export const InvoicesPage = () => {
  return (
    <>
      <PageSubHeader>
        <InvoiceFilterBar />
      </PageSubHeader>
      <InvoiceRecordTable />
    </>
  );
};
