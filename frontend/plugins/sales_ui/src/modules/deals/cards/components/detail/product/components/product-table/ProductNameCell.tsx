import { Badge, Input, Popover, RecordTableInlineCell, cn } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';

import { Cell } from '@tanstack/table-core';
import { IProductData } from 'ui-modules';
import { productRowActionsAtom } from '../../productTableAtom';
import { useAtomValue } from 'jotai';
import { useUpdateProductRecord } from '../../hooks/useProductRecord';

const DUPLICATE_PRODUCT_CELL_CLASS = 'bg-pink-50/80 dark:bg-pink-950/30';
const SINGLE_CLICK_DELAY_MS = 200;

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
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(cell.getValue() as string);
  const singleClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const cancelledRef = useRef(false);
  const { updateRecord } = useUpdateProductRecord();
  const actions = useAtomValue(productRowActionsAtom);

  const clearSingleClickTimeout = () => {
    if (singleClickTimeoutRef.current) {
      clearTimeout(singleClickTimeoutRef.current);
      singleClickTimeoutRef.current = null;
    }
  };

  useEffect(
    () => () => {
      if (singleClickTimeoutRef.current) {
        clearTimeout(singleClickTimeoutRef.current);
      }
    },
    [],
  );

  const onSave = () => {
    clearSingleClickTimeout();
    const trimmedName = name.trim();
    if (trimmedName && trimmedName !== cell.getValue() && product) {
      updateRecord(cell.row.original, {
        product: { ...product, name: trimmedName },
      });
    }
    setOpen(false);
  };

  const cancelEdit = () => {
    cancelledRef.current = true;
    setName(cell.getValue() as string);
    setOpen(false);
  };

  const openEditSheet = () => {
    clearSingleClickTimeout();
    setOpen(false);
    actions?.onEdit(cell.row.original);
  };

  const scheduleInlineEdit = () => {
    clearSingleClickTimeout();
    singleClickTimeoutRef.current = setTimeout(() => {
      singleClickTimeoutRef.current = null;
      // Re-seed the draft: the product may have been replaced or renamed
      // since this cell's state was initialized.
      setName(cell.getValue() as string);
      setOpen(true);
    }, SINGLE_CLICK_DELAY_MS);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSave();
    }
    if (event.key === 'Escape') {
      cancelEdit();
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          return;
        }
        if (cancelledRef.current) {
          cancelledRef.current = false;
          return;
        }
        onSave();
      }}
    >
      <RecordTableInlineCell.Trigger
        className={cn(hasDuplicateProduct && DUPLICATE_PRODUCT_CELL_CLASS)}
        onClick={scheduleInlineEdit}
        onDoubleClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          openEditSheet();
        }}
      >
        <div className="flex gap-1.5 items-center min-w-0">
          {product?.code && (
            <Badge
              variant="secondary"
              onClick={(event) => {
                event.stopPropagation();
                scheduleInlineEdit();
              }}
            >
              {product.code}
            </Badge>
          )}
          <span>{product?.name}</span>
        </div>
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content
        onEscapeKeyDown={() => {
          cancelledRef.current = true;
          setName(cell.getValue() as string);
        }}
      >
        <Input
          value={name}
          onChange={(event) => setName(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
        />
      </RecordTableInlineCell.Content>
    </Popover>
  );
};
