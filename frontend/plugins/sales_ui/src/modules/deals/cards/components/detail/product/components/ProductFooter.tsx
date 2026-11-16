'use client';

import { DealAmounts } from '@/deals/components/DealAmounts';
import type { DealProduct, DealProductData } from '@/deals/utils/dealJson';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { Button, Input, Label, NumberInput } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { SelectProductsBulk, usePermissionCheck } from 'ui-modules';
import { useProductFooterAdjustments } from '../hooks/useProductFooterAdjustments';

type TotalByCurrency = { [currency: string]: number };
type TotalWithPercent = {
  [currency: string]: {
    value?: number;
    percent?: number;
  };
};

type ProductFooterProps = {
  productsCount: number;
  total: TotalByCurrency;
  unUsedTotal: TotalByCurrency;
  bothTotal: TotalByCurrency;
  discount: TotalWithPercent;
  tax: TotalWithPercent;
  showAdvancedView: boolean;
  showTaxView: boolean;
  productsData: DealProductData[];
  pipelineId?: string;
  onChangeProductsData: (data: DealProductData[]) => void;
  updateTotal: (data: DealProductData[]) => void;
  onAddProducts: (products: DealProduct[]) => void;
  onSave: () => void;
  saving?: boolean;
  hasUnsavedChanges?: boolean;
};

const roundPercent = (value?: number): number => Math.round(value || 0);

const formatPercent = (value?: number): string => (value || 0).toFixed(4);

const formatDiscountAmount = (value?: number): string =>
  (value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const ProductFooter = ({
  productsCount,
  total,
  unUsedTotal,
  bothTotal,
  discount,
  tax,
  showAdvancedView,
  showTaxView,
  productsData,
  pipelineId,
  onChangeProductsData,
  updateTotal,
  onAddProducts,
  onSave,
  saving,
  hasUnsavedChanges,
}: ProductFooterProps) => {
  const { isLoaded, hasActionPermission } = usePermissionCheck();
  const canEditDiscounts = isLoaded && hasActionPermission('dealsEdit');
  const {
    getHandleDiscountPercentInput,
    getHandleDiscountAmountInput,
    handleDiscountPercentDraftChange,
    handleDiscountAmountDraftChange,
    handleTaxPercentChange,
  } = useProductFooterAdjustments({
    productsData,
    onChangeProductsData,
    updateTotal,
  });

  const currencies = Object.keys({ ...total, ...discount, ...tax });

  const { t } = useTranslation('sales');

  return (
    <div className="@container z-10 shrink-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
      {(showAdvancedView || showTaxView) && currencies.length > 0 && (
        <div className="max-h-44 divide-y overflow-y-auto overscroll-contain border-b bg-muted/15 px-4">
          {currencies.map((currency) => (
            <div
              key={currency}
              className="flex flex-col gap-1.5 py-2 @2xl:flex-row @2xl:flex-wrap @2xl:items-center @2xl:gap-x-5 @2xl:gap-y-2"
            >
              <span className="min-w-12 text-xs font-semibold uppercase tracking-wide text-foreground">
                {currency}
              </span>

              {showAdvancedView && (
                <div className="flex flex-col gap-1.5 @2xl:flex-row @2xl:flex-wrap @2xl:items-center @2xl:gap-2">
                  <div className="flex items-center justify-between gap-2 @2xl:justify-start">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t('set-handle-discount')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Input
                        id={`discount-percent-${currency}`}
                        readOnly={!canEditDiscounts}
                        className="h-8 w-16 text-right tabular-nums @2xl:w-20 @2xl:text-left"
                        inputMode="numeric"
                        placeholder="0"
                        value={getHandleDiscountPercentInput(currency)}
                        onChange={(event) =>
                          handleDiscountPercentDraftChange(
                            currency,
                            event.currentTarget.value,
                          )
                        }
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                      <Input
                        id={`discount-amount-${currency}`}
                        readOnly={!canEditDiscounts}
                        className="h-8 w-28 text-right tabular-nums @2xl:w-32 @2xl:text-left"
                        inputMode="numeric"
                        placeholder={t('set-amount')}
                        value={getHandleDiscountAmountInput(currency)}
                        onChange={(event) =>
                          handleDiscountAmountDraftChange(
                            currency,
                            event.currentTarget.value,
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 @2xl:justify-start">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t('total-discount')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-sm bg-background px-2 py-1 text-xs font-semibold tabular-nums text-foreground shadow-xs">
                        {formatPercent(discount[currency]?.percent)}%
                      </span>
                      <span className="rounded-sm bg-background px-2 py-1 text-xs font-semibold tabular-nums text-foreground shadow-xs">
                        {formatDiscountAmount(discount[currency]?.value)}{' '}
                        {currency}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {showTaxView && (
                <div className="flex flex-col gap-1.5 @2xl:flex-row @2xl:flex-wrap @2xl:items-center @2xl:gap-2">
                  <div className="flex items-center justify-between gap-2 @2xl:justify-start">
                    <Label
                      htmlFor={`tax-percent-${currency}`}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {t('total-tax')}
                    </Label>
                    <div className="flex items-center gap-2">
                      <NumberInput
                        id={`tax-percent-${currency}`}
                        className="h-8 w-16 text-right tabular-nums @2xl:w-20 @2xl:text-left"
                        value={roundPercent(tax[currency]?.percent)}
                        onChange={(value) =>
                          handleTaxPercentChange(
                            currency,
                            Math.min(100, Math.max(0, Math.round(value))),
                          )
                        }
                      />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2 @2xl:justify-start">
                    <span className="text-xs text-muted-foreground">
                      {t('amount')}
                    </span>
                    <span className="font-medium tabular-nums text-muted-foreground text-xs">
                      {Math.round(tax[currency]?.value || 0).toLocaleString()}{' '}
                      {currency}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 py-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
        <div className="flex flex-col gap-2 @2xl:flex-row @2xl:flex-wrap @2xl:items-center @2xl:gap-x-5 @2xl:gap-y-2">
          <div className="flex items-center justify-between gap-4 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 @2xl:justify-start">
            <div className="flex min-w-0 flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wider text-primary">
                {t('amount')}
              </span>
              <DealAmounts amounts={total} size="xl" showZero />
            </div>
            <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground shadow-xs">
              {productsCount} {t('products')}
            </span>
          </div>
          {Object.keys(unUsedTotal).length > 0 && (
            <div className="flex flex-col gap-1 text-sm @2xl:gap-0.5">
              <div className="flex items-baseline justify-between gap-2 @2xl:justify-start">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('unused')}
                </span>
                <DealAmounts amounts={unUsedTotal} showZero />
              </div>
              <div className="flex items-baseline justify-between gap-2 @2xl:justify-start">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {t('total')}
                </span>
                <DealAmounts amounts={bothTotal} showZero />
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full items-center gap-2 @2xl:w-auto">
          <SelectProductsBulk
            productIds={[]}
            pipelineId={pipelineId}
            onSelect={(_, selectedProducts) =>
              onAddProducts(selectedProducts || [])
            }
          >
            <Button variant="secondary" className="flex-1 @2xl:flex-none">
              <IconPlus className="size-4" />
              {t('add-products')}
            </Button>
          </SelectProductsBulk>
          {hasUnsavedChanges && (
            <span className="self-center text-xs text-muted-foreground">
              {t('unsaved-changes')}
            </span>
          )}
          <Button
            onClick={onSave}
            disabled={saving}
            className="flex-1 @2xl:flex-none"
          >
            <IconDeviceFloppy size={16} />
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};
