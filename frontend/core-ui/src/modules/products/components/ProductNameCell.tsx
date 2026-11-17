import { Cell } from '@tanstack/react-table';
import { IProduct } from '@/products/types/productTypes';
import { RecordTableInlineCell, TextOverflowTooltip, Badge } from 'erxes-ui';
import { useSidePanel } from 'ui-modules';
import { PRODUCT_CONTENT_TYPE } from '@/products/constants/productQueryKey';

export const ProductNameCell = ({
  cell,
}: {
  cell: Cell<IProduct, unknown>;
}) => {
  const { openRecord } = useSidePanel();
  const { _id } = cell.row.original;

  return (
    <RecordTableInlineCell>
      <Badge
        onClick={() =>
          openRecord({ contentType: PRODUCT_CONTENT_TYPE, contentId: _id })
        }
        variant="secondary"
        className="px-2 py-1 font-medium cursor-pointer hover:bg-accent"
      >
        <TextOverflowTooltip value={cell.getValue() as string} />
      </Badge>
    </RecordTableInlineCell>
  );
};
