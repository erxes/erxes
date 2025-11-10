import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { IPosByItems } from '@/pos/pos-by-items/types/PosByItemType';
import { renderingPosByItemsDetailAtom } from '@/pos/pos-by-items/states/posByItemDetail';

export const PosByItemsMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPosByItems, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingPosByItemsDetail = useSetAtom(
    renderingPosByItemsDetailAtom,
  );
  const { _id } = cell.row.original;

  const setOpen = (posByItemsId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pos_by_items_id', posByItemsId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingPosByItemsDetail(false);
      }}
    />
  );
};

export const PosByItemsMoreColumn = {
  id: 'more',
  cell: PosByItemsMoreColumnCell,
  size: 33,
};
