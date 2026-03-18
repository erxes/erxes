import { PageHeader } from 'ui-modules';
import { Breadcrumb } from 'erxes-ui';
import { PosOrdersByCustomerRecordTable } from '@/pos/pos-orders-by-customer/components/PosOrdersByCustomerRecordTable';

export const PosOrdersByCustomerPage = () => {
  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1"></Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <PosOrdersByCustomerRecordTable />
    </>
  );
};
