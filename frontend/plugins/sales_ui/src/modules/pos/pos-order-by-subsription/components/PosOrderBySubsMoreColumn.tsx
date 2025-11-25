import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { IPosOrdersBySubs } from '@/pos/pos-order-by-subsription/types/PosOrderBySubs';
import { renderingPosOrdersBySubsDetailAtom } from '@/pos/pos-order-by-subsription/states/PosOrderBySubsDetail';

export const PosOrderBySubsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPosOrdersBySubs, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingPosOrdersBySubsDetail = useSetAtom(
    renderingPosOrdersBySubsDetailAtom,
  );
  const { _id } = cell.row.original;

  const setOpen = (posOrdersBySubsId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pos_orders_by_sub_id', posOrdersBySubsId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingPosOrdersBySubsDetail(false);
      }}
    />
  );
};

export const PosOrderBySubsMoreColumn = {
  id: 'more',
  cell: PosOrderBySubsMoreColumnCell,
  size: 33,
};
