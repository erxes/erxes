import { IProductData } from 'ui-modules';
import { Input } from 'erxes-ui';

type TotalKind = { value: number; percent?: number };

type ProductTotalProps = {
  kindTxt: 'discount' | 'tax' | 'total' | 'bothTotal' | 'unUsedTotal';
  total: { [currency: string]: TotalKind | number };
  productsData?: IProductData[];
  onChangeProductsData?: (data: IProductData[]) => void;
  updateTotal?: (data: IProductData[]) => void;
};

const ProductTotal = ({
  kindTxt,
  total,
  productsData = [],
  onChangeProductsData,
  updateTotal,
}: ProductTotalProps) => {
  if (!total || Object.keys(total).length === 0) {
    return <span className="text-primary">0</span>;
  }

  const isEditable = ['discount', 'tax'].includes(kindTxt);

  const taxAmountLogic = (amount: number, pData: IProductData) => {
    if (amount > 0) {
      pData.tax =
        ((amount - (pData.discount || 0)) * (pData.taxPercent || 0)) / 100;
      pData.amount = amount - (pData.discount || 0) + (pData.tax || 0);
    } else {
      pData.amount = 0;
      pData.discount = 0;
      pData.tax = 0;
    }
    return pData;
  };

  const handlePercentChange = (currency: string, percent: number) => {
    if (!onChangeProductsData || !updateTotal) return;

    const updated = productsData.map((p) => {
      if (p.currency !== currency) return p;
      const pData = { ...p };
      const amount = pData.unitPrice * pData.quantity;

      if (kindTxt === 'discount') {
        pData.discountPercent = percent;
        pData.discount = (amount * percent) / 100;
      } else if (kindTxt === 'tax') {
        pData.taxPercent = percent;
      }
      return taxAmountLogic(amount, pData);
    });

    onChangeProductsData(updated);
    updateTotal(updated);
  };

  const handleAmountChange = (currency: string, value: number) => {
    if (!onChangeProductsData || !updateTotal || kindTxt !== 'discount') return;

    const currencyProducts = productsData.filter(
      (p) => p.currency === currency,
    );
    const sumAmount = currencyProducts.reduce(
      (sum, p) => sum + p.unitPrice * p.quantity,
      0,
    );
    const tmpPercent = sumAmount > 0 ? (value * 100) / sumAmount : 0;

    const updated = productsData.map((p) => {
      if (p.currency !== currency) return p;
      const pData = { ...p };
      const amount = pData.unitPrice * pData.quantity;
      pData.discount = sumAmount > 0 ? (amount / sumAmount) * value : 0;
      pData.discountPercent = tmpPercent;
      return taxAmountLogic(amount, pData);
    });

    onChangeProductsData(updated);
    updateTotal(updated);
  };

  return (
    <div className="flex gap-4">
      {Object.entries(total).map(([currency, data]) => {
        const totalKind = typeof data === 'number' ? { value: data } : data;
        const { value, percent } = totalKind;

        // Simple display for total types
        if (!isEditable) {
          return (
            <span key={currency} className="text-primary font-medium">
              {(value || 0).toLocaleString()} <b>{currency}</b>
            </span>
          );
        }

        // Editable for discount/tax
        return (
          <div key={currency} className="flex items-center gap-2">
            {/* Percent input */}
            <div className="flex items-center gap-1">
              <Input
                type="number"
                min={0}
                max={100}
                className="w-20"
                value={percent ? Number.parseFloat(percent.toFixed(3)) : ''}
                onChange={(e) =>
                  handlePercentChange(currency, Number(e.target.value))
                }
              />
              <span className="text-muted-foreground">%</span>
            </div>

            {/* Amount - editable for discount, display for tax */}
            {kindTxt === 'discount' ? (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  className="w-28"
                  value={value ? Number.parseFloat(value.toFixed(3)) : 0}
                  onChange={(e) =>
                    handleAmountChange(currency, Number(e.target.value))
                  }
                />
                <span className="text-muted-foreground">{currency}</span>
              </div>
            ) : (
              <span className="text-primary font-medium">
                {(value || 0).toLocaleString()} <b>{currency}</b>
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProductTotal;
