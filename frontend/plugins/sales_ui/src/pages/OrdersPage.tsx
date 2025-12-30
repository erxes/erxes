import { PageHeader } from 'ui-modules';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { OrderRecordTable } from '@/pos/orders/components/OrderRecordTable';
import { PosBreadcrumb } from '@/pos/pos/breadcumb/PosBreadcrumb';
import { PosOrderFilter } from '@/pos/orders/components/PosOrderFilter';

export const OrdersPage = () => {
  const { posId } = useParams();
  console.log('posId:', posId);

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
      <PageSubHeader>
        <PosOrderFilter />
      </PageSubHeader>
      <OrderRecordTable posId={posId} />
    </>
  );
};
