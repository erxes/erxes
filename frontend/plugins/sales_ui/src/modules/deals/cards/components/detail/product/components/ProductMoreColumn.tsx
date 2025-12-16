import { Cell, ColumnDef } from '@tanstack/react-table';
import { atom, useSetAtom } from 'jotai';

import { IProductData } from 'ui-modules';
import { RecordTable } from 'erxes-ui';
import { useSearchParams } from 'react-router-dom';

export const renderingProductDetailAtom = atom(false);

export const ProductMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProductData, unknown>;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRenderingProductDetail = useSetAtom(renderingProductDetailAtom);
  const { _id } = cell.row.original;

  const setOpen = (productId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('product_id', productId);
    setSearchParams(newSearchParams);
  };

  return (
    <RecordTable.MoreButton
      className="w-full h-full"
      onClick={() => {
        setOpen(_id);
        setRenderingProductDetail(false);
      }}
    />
  );
};

export const productMoreColumn: ColumnDef<IProductData> = {
  id: 'more',
  size: 33,
  cell: ProductMoreColumnCell,
};
