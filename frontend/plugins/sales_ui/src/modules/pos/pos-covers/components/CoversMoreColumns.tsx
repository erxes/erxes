import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { ICover } from '~/modules/pos/types/Cover';
import { renderingCoverDetailAtom } from '../../states/CoverDetail';

export const coverMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ICover, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingCoverDetail = useSetAtom(renderingCoverDetailAtom);
  const { _id } = cell.row.original;

  const setOpen = (coverId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('cover_id', coverId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingCoverDetail(false);
      }}
    />
  );
};

export const coverMoreColumn = {
  id: 'more',
  cell: coverMoreColumnCell,
  size: 33,
};
