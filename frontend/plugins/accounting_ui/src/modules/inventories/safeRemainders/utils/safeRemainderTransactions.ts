import { ISafeRemainderItem } from '../types/SafeRemainder';

export const SAFE_REMAINDER_TRANSACTION_TYPES = {
  INCOME: 'income',
  OUT: 'out',
  SALE: 'sale',
  COST_INCREASE: 'costIncrease',
  COST_DECREASE: 'costDecrease',
} as const;

type TSafeRemainderTransactionType =
  (typeof SAFE_REMAINDER_TRANSACTION_TYPES)[keyof typeof SAFE_REMAINDER_TRANSACTION_TYPES];

const COST_ADJUSTMENT_TOLERANCE = 0.005;

const getTargetCost = (item: ISafeRemainderItem) => {
  const activeCost = Math.max(0, item.trInfo?.activeCost ?? 0);
  const storedTargetCost = item.trInfo?.unitCost;
  const isCostExplicit =
    item.trInfo?.isCostExplicit ??
    (storedTargetCost !== undefined && storedTargetCost !== activeCost);

  if (isCostExplicit && storedTargetCost !== undefined) {
    return Math.max(0, storedTargetCost);
  }

  if (activeCost === 0 && item.count > item.preCount) {
    return (item.count - item.preCount) * (item.trInfo?.lastIncomePrice ?? 0);
  }

  return item.preCount > 0 ? (activeCost / item.preCount) * item.count : 0;
};

const TRANSACTION_LABELS: Record<TSafeRemainderTransactionType, string> = {
  [SAFE_REMAINDER_TRANSACTION_TYPES.INCOME]: 'receipts',
  [SAFE_REMAINDER_TRANSACTION_TYPES.OUT]: 'issues',
  [SAFE_REMAINDER_TRANSACTION_TYPES.SALE]: 'sale',
  [SAFE_REMAINDER_TRANSACTION_TYPES.COST_INCREASE]: 'increase-adjustment',
  [SAFE_REMAINDER_TRANSACTION_TYPES.COST_DECREASE]: 'decrease-adjustment',
};

export const getSafeRemainderCostDifference = (item: ISafeRemainderItem) => {
  const targetCost = getTargetCost(item);
  return targetCost - (item.trInfo?.activeCost ?? 0);
};

export const getSafeRemainderIncomeAmount = (item: ISafeRemainderItem) => {
  if (item.count <= item.preCount) return 0;

  const activeCost = item.trInfo?.activeCost ?? 0;
  const targetCost = getTargetCost(item);
  const currentValue = Math.max(0, activeCost);
  const targetValue = Math.max(0, targetCost);

  return Math.max(0, targetValue - currentValue);
};

export const getSafeRemainderCostAdjustmentDifference = (
  item: ISafeRemainderItem,
) => {
  const activeCost = item.trInfo?.activeCost ?? 0;
  const targetCost = getTargetCost(item);

  const currentValue = Math.max(0, activeCost);
  const targetValue = Math.max(0, targetCost);
  let valueAfterQuantity = currentValue;

  if (item.count > item.preCount) {
    valueAfterQuantity += getSafeRemainderIncomeAmount(item);
  } else if (item.count < item.preCount) {
    const activeUnitCost = item.preCount > 0 ? activeCost / item.preCount : 0;
    valueAfterQuantity = Math.max(
      0,
      currentValue - (item.preCount - item.count) * activeUnitCost,
    );
  }

  const difference = Math.max(
    -valueAfterQuantity,
    targetValue - valueAfterQuantity,
  );

  return Math.abs(difference) <= COST_ADJUSTMENT_TOLERANCE ? 0 : difference;
};

export const getSafeRemainderTransactionTypes = (item: ISafeRemainderItem) => {
  const types: TSafeRemainderTransactionType[] = [];

  if (item.count > item.preCount) {
    types.push(SAFE_REMAINDER_TRANSACTION_TYPES.INCOME);
  }
  if (item.count < item.preCount) {
    types.push(
      item.trInfo?.isSale
        ? SAFE_REMAINDER_TRANSACTION_TYPES.SALE
        : SAFE_REMAINDER_TRANSACTION_TYPES.OUT,
    );
  }

  const adjustmentDifference = getSafeRemainderCostAdjustmentDifference(item);
  if (adjustmentDifference > 0) {
    types.push(SAFE_REMAINDER_TRANSACTION_TYPES.COST_INCREASE);
  }
  if (adjustmentDifference < 0) {
    types.push(SAFE_REMAINDER_TRANSACTION_TYPES.COST_DECREASE);
  }

  return types;
};

export const getSafeRemainderTransactionLabels = (item: ISafeRemainderItem) => {
  const labels = getSafeRemainderTransactionTypes(item).map(
    (type) => TRANSACTION_LABELS[type],
  );

  return labels.length ? labels : ['no-transactions-will-be-generated'];
};
