import { IOrderItemInput } from '~/modules/posclient/@types/types';

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

const fixAmount = (value: number) => Number.parseFloat(value.toFixed(2));

export const getDiscountBaseAmount = (item: IOrderItemInput) =>
  finiteNumber(item.unitPrice) * finiteNumber(item.count) +
  finiteNumber(item.discountAmount);

export const getDiscountBaseUnitPrice = (item: IOrderItemInput) => {
  const count = finiteNumber(item.count);

  if (count <= 0) {
    return finiteNumber(item.unitPrice);
  }

  return getDiscountBaseAmount(item) / count;
};

export const getDiscountInfoAmount = (item: IOrderItemInput, type: string) =>
  (item.discountInfos || [])
    .filter((info) => info.type === type)
    .reduce((sum, info) => sum + finiteNumber(info.amount), 0);

export const applyStoredHandDiscount = (item: IOrderItemInput) => {
  const count = finiteNumber(item.count);
  const handAmount = getDiscountInfoAmount(item, HAND_TYPE);

  if (count <= 0 || handAmount === 0) {
    return;
  }

  item.unitPrice = fixAmount(finiteNumber(item.unitPrice) - handAmount / count);
};

export const ensureHandDiscountInfo = (
  item: IOrderItemInput,
): IDiscountInfo[] => {
  const discountInfos = [...(item.discountInfos || [])];
  if (discountInfos.length) {
    return discountInfos;
  }

  const manualAmount = finiteNumber(item.discountAmount);
  const manualPercent = finiteNumber(item.discountPercent);

  if (manualAmount > 0 || manualPercent > 0) {
    const baseAmount = getDiscountBaseAmount(item);
    const amount =
      manualAmount > 0
        ? manualAmount
        : fixAmount((baseAmount * manualPercent) / 100);

    discountInfos.push({
      type: HAND_TYPE,
      title: 'Manual discount',
      amount,
      percent:
        manualPercent > 0
          ? manualPercent
          : baseAmount > 0
            ? fixAmount((amount * 100) / baseAmount)
            : 0,
    });
  }

  return discountInfos;
};

export const applyDiscountInfo = (
  item: IOrderItemInput,
  discountInfo: IDiscountInfo,
) => {
  const baseAmount = getDiscountBaseAmount(item);
  const amount = finiteNumber(discountInfo.amount);
  const percent =
    finiteNumber(discountInfo.percent) ||
    (baseAmount > 0 ? fixAmount((amount * 100) / baseAmount) : 0);

  const discountInfos = ensureHandDiscountInfo(item).filter(
    (info) => info.type !== discountInfo.type,
  );

  item.discountInfos =
    amount === 0
      ? discountInfos
      : discountInfos.concat({
          ...discountInfo,
          amount,
          percent,
        });

  recalculateDiscountFields(item);
};

export const recalculateDiscountFields = (item: IOrderItemInput) => {
  const baseAmount = getDiscountBaseAmount(item);
  const discountAmount = fixAmount(
    (item.discountInfos || []).reduce(
      (sum, info) => sum + finiteNumber(info.amount),
      0,
    ),
  );

  item.discountAmount = discountAmount;
  item.discountPercent =
    baseAmount > 0 ? fixAmount((discountAmount * 100) / baseAmount) : 0;
};
