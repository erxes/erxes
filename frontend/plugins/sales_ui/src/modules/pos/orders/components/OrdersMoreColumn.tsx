import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable, Command, Combobox, Popover } from 'erxes-ui';
import { IOrder } from '@/pos/types/order';
import { renderingOrderDetailAtom } from '@/pos/states/orderDetail';
import { IconEdit } from '@tabler/icons-react';

export const OrdersMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IOrder, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingOrderDetail = useSetAtom(renderingOrderDetailAtom);
  const { _id } = cell.row.original;

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
