import type { DealProductData } from '@/deals/utils/dealJson';
import { flexRender, Row } from '@tanstack/react-table';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { Button, cn, formatAmount, Input, RecordTable } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductTypeIcon } from '@/deals/cards/components/detail/product/components/product-table/ProductTypeIcon';
import { useProductRowActions } from '@/deals/cards/components/detail/product/productListHandlers';
import { calculateProductValues } from '@/deals/cards/components/detail/product/hooks/useProductCalculations';
import { useUpdateProductRecord } from '@/deals/cards/components/detail/product/hooks/useProductRecord';
import { handDiscountAmount } from '@/deals/cards/components/detail/product/utils/discountInfos';
import {
  getProductUomInfo,
  normalizeProductUom,
} from '@/deals/cards/components/detail/product/utils/productUom';

// Type icon with name, quantity stepper, amount, row menu.
const ROW_GRID =
  'grid grid-cols-[minmax(0,1fr)_auto_minmax(4.5rem,auto)_auto] items-center gap-x-3';

const formatPercent = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

/** − quantity +: steps or takes a typed quantity in the row's own UOM. */
const ProductQuantityStepper = ({ product }: { product: DealProductData }) => {
  const { t } = useTranslation('sales');
  const { updateRecord } = useUpdateProductRecord();
  const info = getProductUomInfo(product);
  const quantity = Number(info.quantity) || 0;
  const [draft, setDraft] = useState<string | null>(null);

  const save = (next: number) => {
    setDraft(null);
    if (!Number.isFinite(next) || next < 0 || next === quantity) return;

    const normalized = normalizeProductUom({
      ...product,
      uomInfo: { ...info, quantity: next },
    });
    if (!Number.isFinite(normalized.quantity)) return;

    updateRecord(product, {
      uomInfo: normalized.uomInfo,
      unitPrice: normalized.unitPrice,
      quantity: normalized.quantity,
      ...calculateProductValues('quantity', normalized),
    });
  };

  return (
    <div className="flex h-7 items-center rounded-md border bg-background">
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 rounded-r-none text-muted-foreground"
        aria-label={t('decrease', 'Decrease')}
        disabled={quantity <= 1}
        onClick={() => save(quantity - 1)}
      >
        <IconMinus className="size-3" />
      </Button>
      <Input
        inputMode="decimal"
        aria-label={t('quantity')}
        className="h-6 w-8 rounded-none border-0 px-0 text-center text-xs tabular-nums shadow-none focus-visible:ring-0"
        value={draft ?? String(quantity)}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={() => draft !== null && save(Number(draft.replace(/,/g, '')))}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') setDraft(null);
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 rounded-l-none text-muted-foreground"
        aria-label={t('increase', 'Increase')}
        onClick={() => save(quantity + 1)}
      >
        <IconPlus className="size-3" />
      </Button>
    </div>
  );
};

const ProductRow = ({ row }: { row: Row<DealProductData> }) => {
  const { t } = useTranslation('sales');
  const actions = useProductRowActions();
  const product = row.original;
  const info = getProductUomInfo(product);
  const discountPercent = Number(product.discountPercent) || 0;
  const handDiscount = handDiscountAmount(product);
  const amount =
    (Number(product.quantity) || 0) *
      (Number(product.unitPrice ?? product.product?.unitPrice) || 0) -
    (Number(product.discount) || 0);
  const moreCell = row
    .getVisibleCells()
    .find((cell) => cell.column.id === 'more');

  return (
    <div className={cn(ROW_GRID, 'px-3 py-2.5')}>
      <div className="flex min-w-0 items-center gap-1">
        <div className="flex w-4 shrink-0 justify-center">
          <ProductTypeIcon type={product.product?.type || ''} compact />
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="min-w-0 truncate text-left text-sm font-medium hover:underline"
              title={product.product?.name || undefined}
              onClick={() => actions?.onEdit(product)}
            >
              {product.product?.name || t('untitled')}
            </button>
            {discountPercent > 0 && (
              <span className="shrink-0 rounded-full bg-green-500/15 px-1.5 py-0.5 text-xs font-medium tabular-nums text-green-600 dark:text-green-400">
                −{formatPercent(Math.round(discountPercent * 10) / 10)}%
              </span>
            )}
          </div>
          <div className="truncate text-xs tabular-nums text-muted-foreground">
            {info.quantity} × {formatAmount(Number(info.unitPrice) || 0)}
            {handDiscount > 0 &&
              ` · ${t('discount')} −${formatAmount(handDiscount)}`}
          </div>
        </div>
      </div>
      <ProductQuantityStepper product={product} />
      <span className="text-right text-sm font-semibold tabular-nums">
        {amount.toLocaleString()}
      </span>
      <div className="w-7">
        {moreCell &&
          flexRender(moreCell.column.columnDef.cell, moreCell.getContext())}
      </div>
    </div>
  );
};

/** The panel's product list: one row per product with an inline quantity stepper. */
export const ProductCardList = () => {
  const { t } = useTranslation('sales');
  const { table } = RecordTable.useRecordTable();

  return (
    <div className="divide-y overflow-hidden rounded-xl border bg-background">
      <div
        className={cn(
          ROW_GRID,
          'px-3 py-2 text-xs font-medium text-muted-foreground',
        )}
      >
        <span>{t('product-service')}</span>
        <span className="text-center">{t('quantity')}</span>
        <span className="text-right">{t('amount')}</span>
        <span className="w-7" />
      </div>
      {table.getRowModel().rows.map((row) => (
        <ProductRow key={row.id} row={row} />
      ))}
    </div>
  );
};
