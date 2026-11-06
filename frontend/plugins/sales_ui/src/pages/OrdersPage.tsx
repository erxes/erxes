import { Can, Export, PageHeader } from 'ui-modules';
import { Breadcrumb, PageSubHeader, Separator } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { OrderRecordTable } from '../modules/pos/orders/components/OrderRecordTable';
import { PosBreadcrumb } from '../modules/pos/pos/breadcumb/PosBreadcrumb';
import { PosOrderFilter } from '../modules/pos/orders/components/PosOrderFilter';
import { PosOrderSideWidget } from '../modules/pos/orders/detail/PosOrderSideWidget';
import { PosOrderSheet } from '~/modules/pos/orders/components/PosOrderSheet';
import { useOrdersVariables } from '@/pos/orders/hooks/UseOrderList';

export const OrdersPage = () => {
  const { posId } = useParams();
  const variables = useOrdersVariables({ posId });

  const getFilters = () => {
    // Paging belongs to the list; the export walks every matching order.
    const filters: Record<string, unknown> = { ...variables };
    delete filters.perPage;
    delete filters.page;
    return filters;
  };

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
      <div className="flex overflow-hidden w-full h-full">
        <div className="flex flex-col overflow-hidden w-full h-full">
          <PageSubHeader>
            <PosOrderSheet />
            <PosOrderFilter />
            <Can action="posOrdersExportManage">
              <Export
                pluginName="sales"
                moduleName="pos"
                collectionName="posOrders"
                getFilters={getFilters}
              />
            </Can>
          </PageSubHeader>
          <OrderRecordTable posId={posId} />
        </div>
        <PosOrderSideWidget />
      </div>
    </>
  );
};
