import { Cell } from '@tanstack/react-table';
import { renderingProductDetailAtom } from '../states/productDetailStates';
import { IProduct } from '@/products/types/productTypes';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTable } from 'erxes-ui';

export const ProductMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IProduct, unknown>;
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

export const productMoreColumn = {
  id: 'more',
  cell: ProductMoreColumnCell,
  size: 33,
};
