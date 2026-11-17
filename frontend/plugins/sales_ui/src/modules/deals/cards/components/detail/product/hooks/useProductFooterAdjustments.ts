import type { DealProductData } from '@/deals/utils/dealJson';
import { useMemo, useState } from 'react';
import {
  applyFooterDiscountAmount,
  applyFooterDiscountPercent,
  handDiscountAmount,
  productBaseAmount,
} from '../utils/discountInfos';

const isUsedProductForCurrency = (product: DealProductData, currency: string) =>
  product.tickUsed === true && product.currency === currency;

const clearDraftValue = (drafts: Record<string, string>, currency: string) => {
  const remainingDrafts = { ...drafts };
  delete remainingDrafts[currency];

  return remainingDrafts;
};

const parseDraftNumber = (value: string) => {
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const useProductFooterAdjustments = ({
  productsData,
  onChangeProductsData,
  updateTotal,
}: {
  productsData: DealProductData[];
  onChangeProductsData: (data: DealProductData[]) => void;
  updateTotal: (data: DealProductData[]) => void;
}) => {
  const [discountPercentDraft, setDiscountPercentDraft] = useState<
    Record<string, string>
  >({});
  const [discountAmountDraft, setDiscountAmountDraft] = useState<
    Record<string, string>
  >({});
  const rowIdsKey = productsData.map((product) => product._id).join(',');
  const [draftRowIdsKey, setDraftRowIdsKey] = useState(rowIdsKey);

  if (draftRowIdsKey !== rowIdsKey) {
    setDraftRowIdsKey(rowIdsKey);
    setDiscountPercentDraft({});
    setDiscountAmountDraft({});
  }

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

        current.amount += handDiscountAmount(product);
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
      const amount = (newProduct.unitPrice ?? 0) * (newProduct.quantity ?? 0);

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

  return {
    getHandleDiscountPercentInput,
    getHandleDiscountAmountInput,
    handleDiscountPercentDraftChange,
    handleDiscountAmountDraftChange,
    handleTaxPercentChange: (currency: string, percent: number) =>
      handlePercentChange(currency, percent, 'tax'),
  };
};
