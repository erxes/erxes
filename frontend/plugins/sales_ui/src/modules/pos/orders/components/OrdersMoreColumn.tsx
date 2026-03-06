import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { IOrder } from '@/pos/types/order';
import { renderingOrderDetailAtom } from '@/pos/states/orderDetail';

export const OrdersMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IOrder, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingOrderDetail = useSetAtom(renderingOrderDetailAtom);
  const { _id } = cell.row.original;

  const setOpen = (orderId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('order_id', orderId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingOrderDetail(true);
      }}
    />
  );
};

export const ordersMoreColumn = {
  id: 'more',
  cell: OrdersMoreColumnCell,
  size: 33,
};
