'use client';

import { Button, Input, Label, NumberInput } from 'erxes-ui';
import { IProduct, IProductData, SelectProductsBulk } from 'ui-modules';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  applyFooterDiscountAmount,
  applyFooterDiscountPercent,
  productBaseAmount,
} from '../utils/discountInfos';

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
  productsData: IProductData[];
  onChangeProductsData: (data: IProductData[]) => void;
  updateTotal: (data: IProductData[]) => void;
  onAddProducts: (products: IProduct[]) => void;
  onSave: () => void;
};

const formatTotal = (total: TotalByCurrency) => {
  if (!total || Object.keys(total).length === 0) {
    return <span className="text-primary font-semibold">0</span>;
  }

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-1">
      {Object.entries(total).map(([currency, value]) => (
        <span
          key={currency}
          className="font-semibold tabular-nums text-foreground"
        >
          {value.toLocaleString()} {currency}
        </span>
      ))}
    </div>
  );
};

const isUsedProductForCurrency = (product: IProductData, currency: string) =>
  product.tickUsed === true && product.currency === currency;

const roundPercent = (value?: number): number => Math.round(value || 0);

const formatPercent = (value?: number): string => (value || 0).toFixed(4);

const formatDiscountAmount = (value?: number): string =>
  (value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

type ProductWithDiscountInfos = IProductData & {
  discountInfos?: { type: string; amount?: number }[];
};

const getHandDiscountAmount = (product: IProductData): number =>
  ((product as ProductWithDiscountInfos).discountInfos || [])
    .filter((discountInfo) => discountInfo.type === 'hand')
    .reduce((sum, discountInfo) => sum + (Number(discountInfo.amount) || 0), 0);

const clearDraftValue = (drafts: Record<string, string>, currency: string) => {
  const { [currency]: _clearedDraft, ...remainingDrafts } = drafts;

  return remainingDrafts;
};

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
  onChangeProductsData,
  updateTotal,
  onAddProducts,
  onSave,
}: ProductFooterProps) => {
  const [discountPercentDraft, setDiscountPercentDraft] = useState<
    Record<string, string>
  >({});
  const [discountAmountDraft, setDiscountAmountDraft] = useState<
    Record<string, string>
  >({});

  const parseDraftNumber = (value: string) => {
    const parsed = Number(value.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleDiscountByCurrency = useMemo(
    () =>
      productsData.reduce<
        Record<string, { amount: number; baseAmount: number }>
      >((totals, product) => {
        if (!product.tickUsed || !product.currency) {
          return totals;
        }

        const currency = product.currency;
        const current = totals[currency] || { amount: 0, baseAmount: 0 };
        const baseAmount = productBaseAmount(product);

        current.amount += getHandDiscountAmount(product);
        current.baseAmount += baseAmount;
        totals[currency] = current;

        return totals;
      }, {}),
    [productsData],
  );

  const getHandleDiscountAmountInput = (currency: string) =>
    discountAmountDraft[currency] ??
    (handleDiscountByCurrency[currency]?.amount
      ? handleDiscountByCurrency[currency].amount.toString()
      : '');

  const getHandleDiscountPercentInput = (currency: string) => {
    if (discountPercentDraft[currency] !== undefined) {
      return discountPercentDraft[currency];
    }

    const handleDiscount = handleDiscountByCurrency[currency];

    if (!handleDiscount?.baseAmount || !handleDiscount.amount) {
      return '';
    }

    return String((handleDiscount.amount * 100) / handleDiscount.baseAmount);
  };

  const handlePercentChange = (
    currency: string,
    percent: number,
    type: 'discount' | 'tax',
  ) => {
    const updated = productsData.map((p) => {
      if (!isUsedProductForCurrency(p, currency)) return p;

      const newProduct = { ...p };
      const amount = newProduct.unitPrice * newProduct.quantity;

      if (type === 'discount') {
        return applyFooterDiscountPercent(newProduct, percent);
      } else {
        newProduct.taxPercent = percent;
      }

      newProduct.tax =
        ((amount - (newProduct.discount || 0)) * (newProduct.taxPercent || 0)) /
        100;
      newProduct.amount =
        amount - (newProduct.discount || 0) + (newProduct.tax || 0);
      return newProduct;
    });

    onChangeProductsData(updated);
    updateTotal(updated);
  };

  const handleDiscountAmountChange = (currency: string, value: number) => {
    const currencyProducts = productsData.filter((p) =>
      isUsedProductForCurrency(p, currency),
    );
    const sumAmount = currencyProducts.reduce(
      (s, p) => s + productBaseAmount(p),
      0,
    );

    const updated = productsData.map((p) => {
      if (!isUsedProductForCurrency(p, currency)) return p;

      return applyFooterDiscountAmount({ ...p }, sumAmount, value);
    });

    onChangeProductsData(updated);
    updateTotal(updated);
  };

  const handleDiscountPercentDraftChange = (
    currency: string,
    value: string,
  ) => {
    const percent = Math.min(100, Math.max(0, parseDraftNumber(value)));

    setDiscountPercentDraft((current) => ({
      ...current,
      [currency]: value,
    }));
    setDiscountAmountDraft((current) => clearDraftValue(current, currency));
    handlePercentChange(currency, percent, 'discount');
  };

  const handleDiscountAmountDraftChange = (currency: string, value: string) => {
    const amount = Math.max(0, parseDraftNumber(value));

    setDiscountAmountDraft((current) => ({
      ...current,
      [currency]: value,
    }));
    setDiscountPercentDraft((current) => clearDraftValue(current, currency));
    handleDiscountAmountChange(currency, amount);
  };

  const currencies = Object.keys({ ...total, ...discount, ...tax });

  const { t } = useTranslation('sales');

  return (
    <div className="z-10 shrink-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
      {(showAdvancedView || showTaxView) && currencies.length > 0 && (
        <div className="max-h-44 divide-y overflow-y-auto overscroll-contain border-b bg-muted/15 px-4">
          {currencies.map((currency) => (
            <div
              key={currency}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 py-2"
            >
              <span className="min-w-12 text-xs font-semibold uppercase tracking-wide text-foreground">
                {currency}
              </span>

              {showAdvancedView && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('set-handle-discount', 'Set handle discount')}
                  </span>
                  <Input
                    id={`discount-percent-${currency}`}
                    className="h-8 w-20 tabular-nums"
                    inputMode="numeric"
                    placeholder={t('set-percent', 'Set percent')}
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
                    className="h-8 w-32 tabular-nums"
                    inputMode="numeric"
                    placeholder={t('set-amount', 'Set amount')}
                    value={getHandleDiscountAmountInput(currency)}
                    onChange={(event) =>
                      handleDiscountAmountDraftChange(
                        currency,
                        event.currentTarget.value,
                      )
                    }
                  />
                  <span className="text-xs font-medium text-muted-foreground">
                    {t('total-discount')}
                  </span>
                  <span className="rounded-sm bg-background px-2 py-1 text-xs font-semibold tabular-nums text-foreground shadow-xs">
                    {formatPercent(discount[currency]?.percent)}%
                  </span>
                  <span className="rounded-sm bg-background px-2 py-1 text-xs font-semibold tabular-nums text-foreground shadow-xs">
                    {formatDiscountAmount(discount[currency]?.value)} {currency}
                  </span>
                </div>
              )}

              {showTaxView && (
                <div className="flex flex-wrap items-center gap-2">
                  <Label
                    htmlFor={`tax-percent-${currency}`}
                    className="text-xs font-medium text-muted-foreground"
                  >
                    {t('total-tax')}
                  </Label>
                  <NumberInput
                    id={`tax-percent-${currency}`}
                    className="h-8 w-20 tabular-nums"
                    value={roundPercent(tax[currency]?.percent)}
                    onChange={(value) =>
                      handlePercentChange(
                        currency,
                        Math.min(100, Math.max(0, Math.round(value))),
                        'tax',
                      )
                    }
                  />
                  <span className="text-xs text-muted-foreground">%</span>
                  <span className="text-xs text-muted-foreground">
                    {t('amount')}
                  </span>
                  <span className="font-medium tabular-nums text-muted-foreground text-xs">
                    {Math.round(tax[currency]?.value || 0).toLocaleString()}{' '}
                    {currency}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('products')}
            </span>
            <span className="font-semibold tabular-nums">{productsCount}</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t('amount')}
            </span>
            {formatTotal(total)}
          </div>
          {Object.keys(unUsedTotal).length > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('unused')}
              </span>
              {formatTotal(unUsedTotal)}
            </div>
          )}
          {Object.keys(unUsedTotal).length > 0 && (
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t('total')}
              </span>
              {formatTotal(bothTotal)}
            </div>
          )}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <SelectProductsBulk
            productIds={[]}
            onSelect={(_, selectedProducts) =>
              onAddProducts(selectedProducts || [])
            }
          >
            <Button variant="secondary" className="flex-1 sm:flex-none">
              <IconPlus className="size-4" />
              {t('add-products')}
            </Button>
          </SelectProductsBulk>
          <Button onClick={onSave} className="flex-1 sm:flex-none">
            <IconDeviceFloppy size={16} />
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
};
