import { Cell } from '@tanstack/react-table';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';
import { ProductItem } from '../types/productItem';
import { renderingCheckProductDetailAtom } from '../states/checkProductDetailStates';
import { ColumnDef } from '@tanstack/table-core';

export const CheckProductMoreColumnCell = ({
  cell,
}: {
  cell: Cell<ProductItem, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingCheckProductDetail = useSetAtom(
    renderingCheckProductDetailAtom,
  );
  const { _id } = cell.row.original;

  const setOpen = (checkProductId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('checkProductId', checkProductId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingCheckProductDetail(false);
      }}
    />
  );
};

export const CheckProductMoreColumn: ColumnDef<ProductItem> = {
  id: 'more',
  cell: CheckProductMoreColumnCell,
  size: 33,
};
