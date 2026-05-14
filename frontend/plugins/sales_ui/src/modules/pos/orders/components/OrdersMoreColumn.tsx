import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable, Command, Combobox, Popover } from 'erxes-ui';
import { IOrder } from '@/pos/types/order';
import { renderingOrderDetailAtom } from '@/pos/states/orderDetail';
import { IconEdit, IconArrowBackUp } from '@tabler/icons-react';
import { usePosOrderReturnBill } from '../detail/hooks/usePosorderReturnBill';

export const OrdersMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IOrder, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingOrderDetail = useSetAtom(renderingOrderDetailAtom);
  const { _id } = cell.row.original;
  const { posOrderReturnBill, loading, error } = usePosOrderReturnBill();

  const setOpen = (orderId: string) => {
    if (!orderId) {
      console.warn('Order ID is undefined, cannot open order details');
      return;
    }
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pos_order_id', orderId);
    setSearchParams(newSearchParams);
    setRenderingOrderDetail(true);
  };

  const handleReturnBill = () => {
    if (!_id) {
      console.warn('Order ID is undefined, cannot return bill');
      return;
    }
    try {
      if (error) {
        console.error('Mutation error:', error);
        return;
      }
      posOrderReturnBill(_id);
    } catch (err) {
      console.error('Error in handleReturnBill:', err);
    }
  };

  return (
    <Popover>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" />
      </Popover.Trigger>
      <Combobox.Content>
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value="edit"
              onSelect={() => setOpen(_id)}
              disabled={!_id}
            >
              <IconEdit /> Edit
            </Command.Item>
            <Command.Item
              value="return"
              onSelect={handleReturnBill}
              disabled={loading || !_id}
            >
              <IconArrowBackUp /> {loading ? 'Returning...' : 'Return Bill'}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

export const ordersMoreColumn = {
  id: 'more',
  cell: OrdersMoreColumnCell,
  size: 33,
};
