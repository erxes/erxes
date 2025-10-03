import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { IPos } from '../types/pos';
import { renderingPosDetailAtom } from '../states/posDetail';

export const PosMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IPos, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingPosDetail = useSetAtom(renderingPosDetailAtom);
  const { _id } = cell.row.original;

  const setOpen = (posId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('pos_id', posId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingPosDetail(false);
      }}
    />
  );
};

export const posMoreColumn = {
  id: 'more',
  cell: PosMoreColumnCell,
  size: 33,
};
