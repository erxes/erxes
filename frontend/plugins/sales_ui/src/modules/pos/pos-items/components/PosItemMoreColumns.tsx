import { Cell } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { IPosItem } from '@/pos/pos-items/types/posItem';

export const PosItemMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPosItem, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { _id } = cell.row.original;

  const setOpen = (posItemId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pos_order_id', posItemId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
      }}
    />
  );
};

export const PosItemMoreColumn = {
  id: 'more',
  cell: PosItemMoreColumnCell,
  size: 33,
};
