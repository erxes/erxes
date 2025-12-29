'use client';

import { Button, Input } from 'erxes-ui';
import { IProduct, IProductData, SelectProductsBulk } from 'ui-modules';
import { IconDeviceFloppy, IconPlus } from '@tabler/icons-react';

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
    <div className="flex gap-2">
      {Object.entries(total).map(([currency, value]) => (
        <span key={currency} className="text-primary font-semibold">
          {value.toLocaleString()} {currency}
        </span>
      ))}
    </div>
  );
};

const ProductFooter = ({
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
      if (p.currency !== currency) return p;

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
    const currencyProducts = productsData.filter(
      (p) => p.currency === currency,
    );
    const sumAmount = currencyProducts.reduce(
      (s, p) => s + p.unitPrice * p.quantity,
      0,
    );
    const percent = sumAmount > 0 ? (value * 100) / sumAmount : 0;

    const updated = productsData.map((p) => {
      if (p.currency !== currency) return p;

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

  const parseFormattedNumber = (value: string): number => {
    const parsed = parseInt(value.replace(/,/g, ''), 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  const currencies = Object.keys({ ...total, ...discount, ...tax });

  return (
    <div className="sticky bottom-0 right-0 left-0 p-3 z-10 bg-white border-t space-y-2">
      {showAdvancedView && currencies.length > 0 && (
        <div className="flex flex-wrap gap-4 pb-2 border-b">
          {currencies.map((currency) => (
            <div key={currency} className="flex items-center gap-6">
              {/* Discount */}
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold">
                  Total Discount:
                </span>
                <Input
                  type="number"
                  className="w-32"
                  value={Math.round(discount[currency]?.percent || 0)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      handlePercentChange(currency, val, 'discount');
                    }
                  }}
                  step="1"
                  min="0"
                  max="100"
                />
                <span className="text-sm">%</span>
                <Input
                  type="text"
                  className="w-32"
                  value={Math.round(
                    discount[currency]?.value || 0,
                  ).toLocaleString()}
                  onChange={(e) => {
                    const val = parseFormattedNumber(e.target.value);
                    handleDiscountAmountChange(currency, val);
                  }}
                />
                <span className="text-sm">{currency}</span>
              </div>

              {/* Tax */}
              <div className="flex items-center gap-2">
                <span className="text-primary font-semibold">Total Tax:</span>
                <Input
                  type="number"
                  className="w-32"
                  value={Math.round(tax[currency]?.percent || 0)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 0 && val <= 100) {
                      handlePercentChange(currency, val, 'tax');
                    }
                  }}
                  step="1"
                  min="0"
                  max="100"
                />
                <span className="text-sm">%</span>
                <div className="flex items-center gap-2">
                  {Math.round(tax[currency]?.value || 0).toLocaleString()}{' '}
                  {currency}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Products:</span>
            <span className="text-primary font-semibold">{productsCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Amount:</span>
            {formatTotal(total)}
          </div>
          {Object.keys(unUsedTotal).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Unused:</span>
              <span className="font-medium">{formatTotal(unUsedTotal)}</span>
            </div>
          )}
          {Object.keys(unUsedTotal).length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">{formatTotal(bothTotal)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <SelectProductsBulk
            productIds={[]}
            onSelect={(_, selectedProducts) =>
              onAddProducts(selectedProducts || [])
            }
          >
            <Button variant="secondary">
              <IconPlus className="w-4 h-4 mr-1" />
              Add Products
            </Button>
          </SelectProductsBulk>
          <Button onClick={onSave}>
            <IconDeviceFloppy size={16} />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductFooter;
