import { fixNum } from 'erxes-api-shared/utils';
import { IProductData } from '@/sales/@types';

export type DiscountInfoType = 'pricing' | 'voucher' | 'score' | 'hand';

export interface IDiscountInfo {
  type: DiscountInfoType | string;
  title?: string;
  amount?: number;
  percent?: number;
}

const HAND_TYPE = 'hand';

const finiteNumber = (value?: number) =>
  Number.isFinite(Number(value)) ? Number(value) : 0;

const getBaseAmount = (productData: IProductData) =>
  finiteNumber(productData.unitPrice) * finiteNumber(productData.quantity);

export const ensureHandDiscountInfo = (
  productData: IProductData,
): IDiscountInfo[] => {
  const discountInfos = [...(productData.discountInfos || [])];
  if (discountInfos.length) {
    return discountInfos;
  }

  const hasHand = discountInfos.some((info) => info.type === HAND_TYPE);
  const manualAmount = finiteNumber(productData.discount);
  const manualPercent = finiteNumber(productData.discountPercent);

  if (!hasHand && (manualAmount > 0 || manualPercent > 0)) {
    const baseAmount = getBaseAmount(productData);
    const amount =
      manualAmount > 0
        ? manualAmount
        : fixNum((baseAmount * manualPercent) / 100);

    discountInfos.push({
      type: HAND_TYPE,
      title: 'Manual discount',
      amount,
      percent:
        manualPercent > 0
          ? manualPercent
          : baseAmount > 0
            ? fixNum((amount * 100) / baseAmount, 8)
            : 0,
    });
  }

  return discountInfos;
};

const reconcileHandDiscountInfo = (productData: IProductData) => {
  const discountInfos = [...(productData.discountInfos || [])];
  const baseAmount = getBaseAmount(productData);
  const nonHandAmount = discountInfos
    .filter((info) => info.type !== HAND_TYPE)
    .reduce((sum, info) => sum + finiteNumber(info.amount), 0);
  const requestedAmount =
    finiteNumber(productData.discount) ||
    (baseAmount * finiteNumber(productData.discountPercent)) / 100;
  const handAmount = fixNum(requestedAmount - nonHandAmount);

  productData.discountInfos = discountInfos
    .filter((info) => info.type !== HAND_TYPE)
    .concat(
      handAmount !== 0
        ? [
            {
              type: HAND_TYPE,
              title: 'Manual discount',
              amount: handAmount,
              percent:
                baseAmount > 0 ? fixNum((handAmount * 100) / baseAmount, 8) : 0,
            },
          ]
        : [],
    );
};

export const applyDiscountInfo = (
  productData: IProductData,
  discountInfo: IDiscountInfo,
) => {
  const baseAmount = getBaseAmount(productData);
  const amount = finiteNumber(discountInfo.amount);
  const percent =
    finiteNumber(discountInfo.percent) ||
    (baseAmount > 0 ? fixNum((amount * 100) / baseAmount, 8) : 0);

  productData.discountInfos = ensureHandDiscountInfo(productData)
    .filter((info) => info.type !== discountInfo.type)
    .concat({
      ...discountInfo,
      amount,
      percent,
    });

  recalculateProductDiscount(productData);
};

export const recalculateProductDiscount = (productData: IProductData) => {
  const baseAmount = getBaseAmount(productData);
  const discountAmount = fixNum(
    (productData.discountInfos || []).reduce(
      (sum, info) => sum + finiteNumber(info.amount),
      0,
    ),
  );

  productData.discount = discountAmount;
  productData.discountPercent =
    baseAmount > 0 ? fixNum((discountAmount * 100) / baseAmount, 8) : 0;

  const taxPercent = finiteNumber(productData.taxPercent);
  const taxableAmount = Math.max(0, baseAmount - discountAmount);

  if (taxPercent > 0) {
    productData.tax = fixNum((taxableAmount * taxPercent) / 100);
  }

  productData.amount = fixNum(taxableAmount + finiteNumber(productData.tax));
};

export const normalizeProductDiscountInfos = (
  productsData: IProductData[] = [],
) =>
  productsData.map((productData) => {
    if (
      productData.discountInfos?.length ||
      finiteNumber(productData.discount) > 0 ||
      finiteNumber(productData.discountPercent) > 0
    ) {
      if (productData.discountInfos?.length) {
        reconcileHandDiscountInfo(productData);
      } else {
        productData.discountInfos = ensureHandDiscountInfo(productData);
      }
      recalculateProductDiscount(productData);
    }

    return productData;
  });
