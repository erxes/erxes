import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { PosBreadCrumb } from '~/modules/pos/pos/breadcumb/PosBreadCumb';
import { PosOrdersByCustomerRecordTable } from '~/modules/pos/pos-orders-by-customer/components/PosOrdersByCustomerRecordTable';

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
                  <PosBreadCrumb />
                  <Separator.Inline />
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb>
        </PageHeader.Start>
      </PageHeader>
      <PosOrdersByCustomerRecordTable posId={posId} />
    </>
  );
};
