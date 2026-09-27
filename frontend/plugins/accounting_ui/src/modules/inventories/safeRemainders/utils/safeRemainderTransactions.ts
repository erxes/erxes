import { ISafeRemainderItem } from '../types/SafeRemainder';

export const getSafeRemainderCostDifference = (
  item: ISafeRemainderItem,
) => {
  const targetCost = item.trInfo?.unitCost;
  if (targetCost === undefined) return 0;
  return targetCost - (item.trInfo?.activeCost ?? 0);
};

export const getSafeRemainderIncomeAmount = (item: ISafeRemainderItem) => {
  if (item.count <= item.preCount) return 0;

  const activeCost = item.trInfo?.activeCost ?? 0;
  const targetCost = item.trInfo?.unitCost ?? activeCost;
  const currentValue = Math.max(0, item.preCount * activeCost);
  const targetValue = Math.max(0, item.count * targetCost);

  return Math.max(0, targetValue - currentValue);
};

export const getSafeRemainderCostAdjustmentDifference = (
  item: ISafeRemainderItem,
) => {
  const activeCost = item.trInfo?.activeCost ?? 0;
  const targetCost = item.trInfo?.unitCost;
  if (targetCost === undefined) return 0;

  const currentValue = Math.max(0, item.preCount * activeCost);
  const targetValue = Math.max(0, item.count * targetCost);
  let valueAfterQuantity = currentValue;

  if (item.count > item.preCount) {
    valueAfterQuantity += getSafeRemainderIncomeAmount(item);
  } else if (item.count < item.preCount) {
    valueAfterQuantity = Math.max(0, item.count * activeCost);
  }

  return Math.max(-valueAfterQuantity, targetValue - valueAfterQuantity);
};

export const getSafeRemainderCostAdjustmentAmount = (
  item: ISafeRemainderItem,
) => Math.abs(getSafeRemainderCostAdjustmentDifference(item));

export const getSafeRemainderCostAdjustmentUnitDifference = (
  item: ISafeRemainderItem,
) => {
  if (item.count <= 0) return getSafeRemainderCostDifference(item);
  return getSafeRemainderCostAdjustmentDifference(item) / item.count;
};

export const getSafeRemainderTransactionLabels = (
  item: ISafeRemainderItem,
) => {
  const labels: string[] = [];

  if (item.count > item.preCount) labels.push('Орлого');
  if (item.count < item.preCount) {
    labels.push(item.trInfo?.isSale ? 'Борлуулалт' : 'Зарлага');
  }

  const adjustmentDifference = getSafeRemainderCostAdjustmentDifference(item);
  if (adjustmentDifference > 0) labels.push('Залруулга нэмэх');
  if (adjustmentDifference < 0) labels.push('Залруулга хасах');

  if (
    adjustmentDifference === 0 &&
    labels.length === 0 &&
    getSafeRemainderCostDifference(item) !== 0
  ) {
    labels.push(
      getSafeRemainderCostDifference(item) > 0
        ? 'Залруулга нэмэх'
        : 'Залруулга хасах',
    );
  }

  return labels.length ? labels : ['Гүйлгээ үүсэхгүй'];
};
