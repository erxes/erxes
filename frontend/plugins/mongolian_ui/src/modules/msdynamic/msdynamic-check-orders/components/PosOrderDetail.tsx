import { Sheet, useQueryState } from 'erxes-ui';
import { IPosOrderDetail } from '../types/msDynamicCheckOrder';
import { PosOrderDetailContent } from './PosOrderDetailContent';

const ORDER_DETAIL_ID_KEY = 'orderDetailId';

type Props = {
  orders: IPosOrderDetail;
};

/** Order detail sheet neej haruulna. */
const PosOrderDetail = ({ orders }: Props) => {
  const [orderDetailId, setOrderDetailId] =
    useQueryState<string>(ORDER_DETAIL_ID_KEY);

  const open = Boolean(orderDetailId) && orderDetailId === orders?._id;

  /** Sheet haagdval query state tseverlene. */
  const handleOpenChange = (next: boolean) => {
    if (!next) setOrderDetailId(null);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange} modal>
      <Sheet.View className="sm:max-w-3xl">
        <Sheet.Header className="border-b border-border/70">
          <Sheet.Title>Order Detail</Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex min-h-0 flex-1 flex-col overflow-hidden p-5">
          {orders ? (
            <PosOrderDetailContent orders={orders} />
          ) : (
            <div className="text-sm text-muted-foreground">
              Order not found.
            </div>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};

export { PosOrderDetail };
