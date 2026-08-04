'use client';

import { Button, CurrencyField, Label, NumberInput } from 'erxes-ui';
import { IProduct, IProductData, SelectProductsBulk } from 'ui-modules';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

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

const formatEditablePercent = (value?: number): number =>
  Math.round(value || 0);

export const ProductFooter = ({
  productsCount,
  total,
  unUsedTotal,
  bothTotal,
  discount,
  tax,
  showAdvancedView,
  productsData,
  onChangeProductsData,
  updateTotal,
  onAddProducts,
  onSave,
}: ProductFooterProps) => {
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
        newProduct.discountPercent = percent;
        newProduct.discount = (amount * percent) / 100;
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
      (s, p) => s + p.unitPrice * p.quantity,
      0,
    );
    const percent = sumAmount > 0 ? (value * 100) / sumAmount : 0;

    const updated = productsData.map((p) => {
      if (!isUsedProductForCurrency(p, currency)) return p;

      const newProduct = { ...p };
      const amount = newProduct.unitPrice * newProduct.quantity;
      newProduct.discountPercent = percent;
      newProduct.discount = sumAmount > 0 ? (amount / sumAmount) * value : 0;
      newProduct.tax =
        ((amount - newProduct.discount) * (newProduct.taxPercent || 0)) / 100;
      newProduct.amount = amount - newProduct.discount + (newProduct.tax || 0);
      return newProduct;
    });

    onChangeProductsData(updated);
    updateTotal(updated);
  };

  const currencies = Object.keys({ ...total, ...discount, ...tax });

  const { t } = useTranslation('sales');

  return (
    <div className="z-10 shrink-0 border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/85">
      {showAdvancedView && currencies.length > 0 && (
        <div className="max-h-44 divide-y overflow-y-auto overscroll-contain border-b bg-muted/15 px-4">
          {currencies.map((currency) => (
            <div
              key={currency}
              className="flex flex-wrap items-center gap-x-5 gap-y-2 py-2"
            >
              <span className="min-w-12 text-xs font-semibold uppercase tracking-wide text-foreground">
                {currency}
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <Label
                  htmlFor={`discount-percent-${currency}`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  {t('total-discount')}
                </Label>
                <NumberInput
                  id={`discount-percent-${currency}`}
                  className="h-8 w-20 tabular-nums"
                  value={formatEditablePercent(discount[currency]?.percent)}
                  onChange={(value) =>
                    handlePercentChange(
                      currency,
                      Math.min(100, Math.max(0, Math.round(value))),
                      'discount',
                    )
                  }
                />
                <span className="text-xs text-muted-foreground">%</span>
                <Label
                  htmlFor={`discount-amount-${currency}`}
                  className="text-xs text-muted-foreground"
                >
                  {t('amount')}
                </Label>
                <CurrencyField.ValueInput
                  id={`discount-amount-${currency}`}
                  className="h-8 w-32 tabular-nums"
                  value={Math.round(discount[currency]?.value || 0)}
                  onChange={(value) =>
                    handleDiscountAmountChange(currency, Math.max(0, value))
                  }
                />
                <span className="text-xs text-muted-foreground">
                  {currency}
                </span>
              </div>

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
                  value={formatEditablePercent(tax[currency]?.percent)}
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
