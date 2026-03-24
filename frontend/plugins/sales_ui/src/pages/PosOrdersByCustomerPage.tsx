import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { PosOrdersByCustomerRecordTable } from '@/pos/pos-orders-by-customer/components/PosOrdersByCustomerRecordTable';
import { PosBreadcrumb } from '@/pos/pos/breadcumb/PosBreadcrumb';
import { useParams } from 'react-router-dom';

export const PosOrdersByCustomerPage = () => {
  const { posId } = useParams();
  return (
    <>
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              {posId && (
                <>
                  <PosBreadcrumb />
                  <Separator.Inline />
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <PosOrdersByCustomerRecordTable />
    </>
  );
};
