import { PageHeader } from 'ui-modules';
import { Breadcrumb, Separator } from 'erxes-ui';

import { useParams } from 'react-router-dom';

import { PosFilter } from '~/modules/pos/pos/PosFilter';
import { OrderRecordTable } from '~/modules/pos/orders/components/OrderRecordTable';
import { PosBreadCrumb } from '~/modules/pos/pos/breadcumb/PosBreadCumb';

export const OrdersPage = () => {
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
      {/* <PageHeader>
        <PosFilter />
      </PageHeader> */}
      <OrderRecordTable posId={posId} />
    </>
  );
};
