import { useCallback, useEffect, useState } from 'react';
import { IProductData } from 'ui-modules';

export type TotalByCurrency = Record<string, number>;
export type AdjustmentByCurrency = Record<
  string,
  { value: number; percent: number }
>;

export const calculateProductValues = (
  type: string,
  productData: IProductData,
) => {
  const result: Partial<IProductData> = {};
  const amount = (productData.unitPrice || 0) * (productData.quantity || 0);

  let discount = productData.discount || 0;
  let discountPercent = productData.discountPercent || 0;
  let tax = productData.tax || 0;
  let taxPercent = productData.taxPercent || 0;

  if (amount > 0) {
    if (type === 'discountPercent') {
      discount = (amount * discountPercent) / 100;
      result.discount = discount;
    } else if (type === 'discount') {
      discountPercent = (discount * 100) / amount;
      result.discountPercent = discountPercent;
    }

    if (type === 'taxPercent') {
      tax = ((amount - discount) * taxPercent) / 100;
      result.tax = tax;
    } else if (type === 'tax') {
      const taxableAmount = amount - discount;
      if (taxableAmount > 0) {
        taxPercent = (tax * 100) / taxableAmount;
        result.taxPercent = taxPercent;
      }
    } else {
      tax = ((amount - discount) * taxPercent) / 100;
      result.tax = tax;
    }

    const finalAmount = amount - discount + tax;
    result.amount = finalAmount;
  } else {
    result.tax = 0;
    result.discount = 0;
    result.amount = 0;
  }

  return result;
};

export const useProductCalculations = (productsData: IProductData[]) => {
  const [total, setTotal] = useState<TotalByCurrency>({});
  const [unUsedTotal, setUnUsedTotal] = useState<TotalByCurrency>({});
  const [bothTotal, setBothTotal] = useState<TotalByCurrency>({});
  const [tax, setTax] = useState<AdjustmentByCurrency>({});
  const [discount, setDiscount] = useState<AdjustmentByCurrency>({});

  const updateTotal = useCallback((productsData: IProductData[]) => {
    const total: TotalByCurrency = {};
    const unUsedTotal: TotalByCurrency = {};
    const bothTotal: TotalByCurrency = {};
    const tax: AdjustmentByCurrency = {};
    const discount: AdjustmentByCurrency = {};

    productsData.forEach((p) => {
      if (!p.currency) return;

      if (!bothTotal[p.currency]) {
        bothTotal[p.currency] = 0;
      }
      bothTotal[p.currency] += p.amount || 0;

      if (p.tickUsed) {
        if (!total[p.currency]) {
          total[p.currency] = 0;
          tax[p.currency] = { percent: 0, value: 0 };
          discount[p.currency] = { percent: 0, value: 0 };
        }

        discount[p.currency].value += p.discount || 0;
        tax[p.currency].value += p.tax || 0;
        total[p.currency] += p.amount || 0;
      } else {
        if (!unUsedTotal[p.currency]) {
          unUsedTotal[p.currency] = 0;
        }
        unUsedTotal[p.currency] += p.amount || 0;
      }
    });

    for (const currency of Object.keys(discount)) {
      let clearTotal = total[currency] - tax[currency].value;
      tax[currency].percent =
        clearTotal > 0 ? (tax[currency].value * 100) / clearTotal : 0;

      clearTotal = clearTotal + discount[currency].value;
      discount[currency].percent =
        clearTotal > 0 ? (discount[currency].value * 100) / clearTotal : 0;
    }

    setTotal(total);
    setTax(tax);
    setDiscount(discount);
    setBothTotal(bothTotal);
    setUnUsedTotal(unUsedTotal);
  }, []);

  const calculatePerProductAmount = (
    type: string,
    productData: IProductData,
    callUpdateTotal = true,
  ) => {
    const updates = calculateProductValues(type, productData);
    Object.assign(productData, updates);

    if (callUpdateTotal) {
      updateTotal(productsData);
    }
  };

  useEffect(() => {
    if (productsData) {
      updateTotal(productsData);
    }
  }, [productsData, updateTotal]);

  return {
    total,
    unUsedTotal,
    bothTotal,
    tax,
    discount,
    updateTotal,
    calculatePerProductAmount,
  };
};
