import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { ICheckPosOrders } from '../types/checkPosOrders';
import { renderingCheckPosOrdersDetailAtom } from '../states/checkPosOrdersDetailStates';

export const CheckPosOrdersMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICheckPosOrders, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingCheckPosOrdersDetail = useSetAtom(
    renderingCheckPosOrdersDetailAtom,
  );
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
        setRenderingCheckPosOrdersDetail(false);
      }}
    />
  );
};

export const CheckPosOrdersMoreColumn = {
  id: 'more',
  cell: CheckPosOrdersMoreColumnCell,
  size: 33,
};
