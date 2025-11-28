import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { IDuplicated } from '@/put-responses-duplicated/types/DuplicatedType';
import { renderingDuplicatedDetailAtom } from '@/put-responses-duplicated/states/DuplicatedDetailStates';

export const DuplicatedMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IDuplicated, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingDuplicatedDetail = useSetAtom(
    renderingDuplicatedDetailAtom,
  );
  const { _id } = cell.row.original;

  const setOpen = (duplicatedId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('duplicated_id', duplicatedId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingDuplicatedDetail(false);
      }}
    />
  );
};

export const duplicatedMoreColumn = {
  id: 'more',
  cell: DuplicatedMoreColumnCell,
  size: 33,
};
