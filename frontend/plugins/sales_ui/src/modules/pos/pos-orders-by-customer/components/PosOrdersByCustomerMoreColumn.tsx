import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { renderingPosOrdersByCustomerDetailAtom } from '@/pos/pos-orders-by-customer/states/PosOrdersByCustomerDetail';
import { IPosOrdersByCustomer } from '@/pos/pos-orders-by-customer/types/posOrdersByCustomerType';

export const PosOrdersByCustomerMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPosOrdersByCustomer, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingPosOrdersByCustomerDetail = useSetAtom(
    renderingPosOrdersByCustomerDetailAtom,
  );
  const { _id } = cell.row.original;

  const setOpen = (posOrdersByCustomerId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pos_orders_by_customer_id', posOrdersByCustomerId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingPosOrdersByCustomerDetail(false);
      }}
    />
  );
};

export const PosOrdersByCustomerMoreColumn = {
  id: 'more',
  cell: PosOrdersByCustomerMoreColumnCell,
  size: 33,
};
