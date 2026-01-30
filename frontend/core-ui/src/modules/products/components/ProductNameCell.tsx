import { Cell } from '@tanstack/react-table';
import { renderingProductDetailAtom } from '../states/productDetailStates';
import { IProduct } from '@/products/types/productTypes';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import {  RecordTableInlineCell, TextOverflowTooltip } from 'erxes-ui';

export const ProductNameCell = ({
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
    <RecordTableInlineCell>
      <div
        onClick={() => {
        setOpen(_id);
        setRenderingProductDetail(false);
        }}
        className="cursor-pointer"
      >
        <TextOverflowTooltip value={cell.getValue() as string} />
      </div>
    </RecordTableInlineCell>
  );
};


