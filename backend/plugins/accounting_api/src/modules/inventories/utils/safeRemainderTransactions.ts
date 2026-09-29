import { fixNum } from 'erxes-api-shared/utils';
import { ITrDetail } from '~/modules/accounting/@types/transaction';
import { ISafeRemainderItemDocument } from '../@types/safeRemainderItems';

interface ISafeRemainderTransactionAccounts {
  incomeAccountId: string;
  outAccountId: string;
  saleAccountId: string;
  costIncreaseAccountId: string;
  costDecreaseAccountId: string;
}

const COST_ADJUSTMENT_TOLERANCE = 0.005;

export interface ISafeRemainderTransactionDetails {
  incomeDetails: ITrDetail[];
  outDetails: ITrDetail[];
  saleDetails: ITrDetail[];
  costIncreaseDetails: ITrDetail[];
  costDecreaseDetails: ITrDetail[];
}

const emptyDetails = (): ISafeRemainderTransactionDetails => ({
  incomeDetails: [],
  outDetails: [],
  saleDetails: [],
  costIncreaseDetails: [],
  costDecreaseDetails: [],
});

export const buildSafeRemainderTransactionDetails = (
  items: ISafeRemainderItemDocument[],
  accounts: ISafeRemainderTransactionAccounts,
) => {
  const result = emptyDetails();

  for (const item of items) {
    const { productId, preCount, count } = item;
    const storedActiveCost = item.trInfo?.activeCost ?? 0;
    const activeCost = fixNum(
      Math.max(0, item.cost ?? storedActiveCost),
      6,
    );
    const targetCost = item.trInfo?.unitCost;
    const currentValue = activeCost;
    const defaultTargetValue = fixNum(
      activeCost === 0 && count > preCount
        ? (count - preCount) * (item.trInfo?.lastIncomePrice ?? 0)
        : preCount > 0
          ? (activeCost / preCount) * count
          : 0,
      6,
    );
    const isCostExplicit =
      item.trInfo?.isCostExplicit ??
      (targetCost !== undefined && targetCost !== storedActiveCost);
    const targetValue = fixNum(
      Math.max(
        0,
        isCostExplicit && targetCost !== undefined
          ? targetCost
          : defaultTargetValue,
      ),
      6,
    );
    const activeUnitCost = preCount > 0 ? fixNum(activeCost / preCount, 6) : 0;
    let valueAfterQuantity = currentValue;

    if (preCount < count) {
      const incomeCount = count - preCount;
      const incomeAmount = fixNum(Math.max(0, targetValue - currentValue), 6);
      result.incomeDetails.push({
        accountId: accounts.incomeAccountId,
        amount: incomeAmount,
        unitPrice: fixNum(incomeAmount / incomeCount, 6),
        productId,
        count: incomeCount,
      });
      valueAfterQuantity = fixNum(currentValue + incomeAmount, 6);
    } else if (preCount > count) {
      const outCount = preCount - count;
      const outAmount = fixNum(outCount * activeUnitCost, 6);
      valueAfterQuantity = fixNum(Math.max(0, currentValue - outAmount), 6);

      if (item.trInfo?.isSale) {
        result.saleDetails.push({
          accountId: accounts.saleAccountId,
          amount: fixNum(outCount * (item.trInfo?.unitPrice ?? 0), 6),
          unitPrice: fixNum(item.trInfo?.unitPrice ?? 0, 6),
          productId,
          count: outCount,
        });
      } else {
        result.outDetails.push({
          accountId: accounts.outAccountId,
          amount: outAmount,
          unitPrice: activeUnitCost,
          productId,
          count: outCount,
        });
      }
    }

    if (targetCost === undefined) continue;

    const adjustmentDifference = fixNum(
      Math.max(-valueAfterQuantity, targetValue - valueAfterQuantity),
      6,
    );
    const adjustmentAmount = Math.abs(adjustmentDifference);
    if (adjustmentAmount <= COST_ADJUSTMENT_TOLERANCE) continue;

    const adjustmentDetail: ITrDetail = {
      accountId:
        adjustmentDifference > 0
          ? accounts.costIncreaseAccountId
          : accounts.costDecreaseAccountId,
      amount: adjustmentAmount,
      unitPrice: count > 0 ? fixNum(adjustmentAmount / count, 6) : 0,
      productId,
      count: 0,
    };

    if (adjustmentDifference > 0) {
      result.costIncreaseDetails.push(adjustmentDetail);
    } else {
      result.costDecreaseDetails.push(adjustmentDetail);
    }
  }

  return result;
};
