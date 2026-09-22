import { Badge, RecordTableInlineCell, cn } from 'erxes-ui';

import { Cell } from '@tanstack/table-core';
import { IProductData } from 'ui-modules';
import { productRowActionsAtom } from '../../productTableAtom';
import { useAtomValue } from 'jotai';

const DUPLICATE_PRODUCT_CELL_CLASS = 'bg-pink-50/80 dark:bg-pink-950/30';

export const getProductId = (productData: IProductData) =>
  productData.productId || productData.product?._id || '';

export const hasDuplicateProductId = (
  productsData: IProductData[],
  productId: string,
) => {
  if (!productId) {
    return false;
  }

  return (
    productsData.filter(
      (productData) => getProductId(productData) === productId,
    ).length > 1
  );
};

export const ProductNameCell = ({
  cell,
  hasDuplicateProduct,
}: {
  cell: Cell<IProductData, unknown>;
  hasDuplicateProduct: boolean;
}) => {
  const product = cell.row.original.product;
  const actions = useAtomValue(productRowActionsAtom);

  return (
    <RecordTableInlineCell
      className={cn(hasDuplicateProduct && DUPLICATE_PRODUCT_CELL_CLASS)}
      onDoubleClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        actions?.onEdit(cell.row.original);
      }}
    >
      <div className="flex gap-1.5 items-center min-w-0">
        {product?.code && <Badge variant="secondary">{product.code}</Badge>}
        <span>{product?.name}</span>
      </div>
    </RecordTableInlineCell>
  );
};
