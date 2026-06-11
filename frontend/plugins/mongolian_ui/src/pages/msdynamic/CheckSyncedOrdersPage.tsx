import { CheckSyncedOrders } from '~/modules/msdynamic/msdynamic-check-orders/components/CheckSyncedOrders';
import { PageSubHeader } from 'erxes-ui';
import { MSDynamicCheckOrderFilter } from '~/modules/msdynamic/msdynamic-check-orders/components/MSDynamicCheckOrderFilter';

const CheckSyncedOrdersPage = () => {
  return (
    <>
      <PageSubHeader>
        <MSDynamicCheckOrderFilter />
      </PageSubHeader>
      <CheckSyncedOrders />
    </>
  );
};

export { CheckSyncedOrdersPage };
