import { Cell } from '@tanstack/react-table';
import { renderingProductDetailAtom } from '@/products/states/productDetailStates';
import { IProduct } from '@/products/types/productTypes';
import { useSetAtom } from 'jotai';
import { useSidePanel } from 'ui-modules';
import { RecordTableInlineCell, TextOverflowTooltip, Badge } from 'erxes-ui';

export const ProductNameCell = ({
  cell,
}: {
  cell: Cell<IProduct, unknown>;
}) => {
  const { openRecord } = useSidePanel();
  const setRenderingProductDetail = useSetAtom(renderingProductDetailAtom);
  const { _id } = cell.row.original;

  const setOpen = (productId: string) => {
    openRecord({ contentType: 'core:product', contentId: productId });
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
