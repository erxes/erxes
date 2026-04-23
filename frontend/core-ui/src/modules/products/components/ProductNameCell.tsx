import { Cell } from '@tanstack/react-table';
import { renderingProductDetailAtom } from '../states/productDetailStates';
import { IProduct } from '@/products/types/productTypes';
import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';
import { RecordTableInlineCell, TextOverflowTooltip, Badge } from 'erxes-ui';

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
      <Badge
        onClick={() => {
          setOpen(_id);
          setRenderingProductDetail(false);
        }}
        variant="secondary"
        className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
      >
        <TextOverflowTooltip value={cell.getValue() as string} />
      </Badge>
    </RecordTableInlineCell>
  );
};
