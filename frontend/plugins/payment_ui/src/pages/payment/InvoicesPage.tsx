import { PageSubHeader } from 'erxes-ui';
import { InvoiceFilterBar } from '~/modules/payment/components/InvoiceFilterBar';
import { InvoiceRecordTable } from '~/modules/payment/components/InvoiceRecordTable';

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
