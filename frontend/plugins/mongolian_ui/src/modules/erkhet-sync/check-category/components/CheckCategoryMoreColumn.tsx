import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { CategoryItem } from '../types/categoryItem';
import { renderingCheckCategoryDetailAtom } from '../states/checkCategoryDetailStates';
import { ColumnDef } from '@tanstack/table-core';

export const CheckCategoryMoreColumnCell = ({
  cell,
}: {
  cell: Cell<CategoryItem, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingCheckCategoryDetail = useSetAtom(
    renderingCheckCategoryDetailAtom,
  );
  const { _id } = cell.row.original;

  const setOpen = (checkCategoryId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('checkCategoryId', checkCategoryId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingCheckCategoryDetail(false);
      }}
    />
  );
};

export const CheckCategoryMoreColumn: ColumnDef<CategoryItem> = {
  id: 'more',
  cell: CheckCategoryMoreColumnCell,
  size: 33,
};
