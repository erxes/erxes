import type { ResultOf } from '@graphql-typed-document-node/core';
import { FXA_CAPITAL_VALUATION } from '@/transactions/transaction-form/graphql/queries/fxaCapitalValuation';
import { TTrDoc } from '@/transactions/transaction-form/types/JournalForms';
import { ITransaction } from '@/transactions/types/Transaction';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';

export type TFxaCapitalValuation = ResultOf<
  typeof FXA_CAPITAL_VALUATION
>['fixedAssetCapitalValuation'];

const buildFxaCapitalAssetPreview = (
  trDoc: TTrDoc,
  valuation: TFxaCapitalValuation,
) => {
  if (trDoc.journal !== TrJournalEnum.FXA_CAPITAL) return undefined;
  const info = trDoc.details[0]?.followInfos;
  if (
    !info ||
    !valuation.count ||
    !Number.isFinite(info.originalCost) ||
    info.originalCost <= 0
  )
    return undefined;
  const costDelta = info.originalCost - valuation.originalCost;
  const depreciationDelta =
    (info.preDeprecation ?? valuation.preDeprecation) -
    valuation.preDeprecation;
  const round = (amount: number) =>
    Math.round(Math.abs(amount) * 10000) / 10000;
  const hasSavedLocation = trDoc.details.some((row) =>
    valuation.locations.some(
      (location) =>
        (row.branchId || '') === location.branchId &&
        (row.departmentId || '') === location.departmentId,
    ),
  );
  const details = valuation.locations.map((location, index) => ({
    ...trDoc.details[0],
    _id:
      trDoc.details.find(
        (row) =>
          (row.branchId || '') === location.branchId &&
          (row.departmentId || '') === location.departmentId,
      )?._id ||
      (index === 0 && !hasSavedLocation
        ? trDoc.details[0]._id
        : `${trDoc._id}-${valuation.fixedAssetId}-location:${encodeURIComponent(
            location.branchId,
          )}:${encodeURIComponent(location.departmentId)}`),
    fixedAssetId: valuation.fixedAssetId,
    accountId: valuation.accountId,
    branchId: location.branchId,
    departmentId: location.departmentId,
    count: 0 as const,
    unitPrice: 0,
    amount: round(costDelta * location.count),
    followInfos: info,
  }));
  const decreasesDepreciation = depreciationDelta < 0;
  const originType = decreasesDepreciation
    ? 'fxaCapitalDepOut'
    : 'fxaCapitalDepIn';
  const followDetails = valuation.locations
    .map((location, index) => ({
      _id: `${trDoc._id}-${originType}-${valuation.fixedAssetId}-${index}`,
      fixedAssetId: valuation.fixedAssetId,
      accountId: valuation.depreciationAccountId,
      branchId: location.branchId,
      departmentId: location.departmentId,
      count: 0,
      amount: round(depreciationDelta * location.count),
    }))
    .filter((detail) => detail.amount > 0.005);
  const totalDepreciation = followDetails.reduce(
    (sum, row) => sum + row.amount,
    0,
  );
  const follows: ITransaction[] = followDetails.length
    ? [
        {
          _id: `${trDoc._id}-${originType}`,
          originId: trDoc._id,
          originType,
          journal: decreasesDepreciation
            ? TrJournalEnum.FXA_DEP_OUT
            : TrJournalEnum.FXA_DEP_IN,
          side: decreasesDepreciation ? TR_SIDES.DEBIT : TR_SIDES.CREDIT,
          ptrId: trDoc.ptrId,
          parentId: trDoc.parentId,
          description: trDoc.description,
          details: followDetails,
          sumDt: decreasesDepreciation ? totalDepreciation : 0,
          sumCt: decreasesDepreciation ? 0 : totalDepreciation,
        },
      ]
    : [];
  return {
    details,
    side: costDelta < 0 ? TR_SIDES.CREDIT : TR_SIDES.DEBIT,
    follows,
  };
};

export const buildFxaCapitalPreview = (
  trDoc: TTrDoc,
  valuationInput: TFxaCapitalValuation | TFxaCapitalValuation[],
) => {
  if (trDoc.journal !== TrJournalEnum.FXA_CAPITAL) return undefined;
  const valuations = Array.isArray(valuationInput)
    ? valuationInput
    : [valuationInput];
  const groups = new Map<string, typeof trDoc.details>();
  for (const detail of trDoc.details) {
    const key = detail.fixedAssetId || detail._id;
    const group = groups.get(key);
    if (group) group.push(detail);
    else groups.set(key, [detail]);
  }
  const details: typeof trDoc.details = [];
  const follows = new Map<string, ITransaction>();
  const sides = new Set<string>();
  for (const group of groups.values()) {
    const fixedAssetId = group[0].fixedAssetId;
    if (!fixedAssetId) {
      details.push(...group);
      continue;
    }
    const valuation = valuations.find(
      (value) => value.fixedAssetId === fixedAssetId,
    );
    if (!valuation) return undefined;
    const result = buildFxaCapitalAssetPreview(
      { ...trDoc, details: group },
      valuation,
    );
    if (!result) return undefined;
    details.push(...result.details);
    if (result.details.some((detail) => detail.amount > 0.005))
      sides.add(result.side);
    for (const follow of result.follows) {
      const previous = follows.get(follow.originType || '');
      if (previous) {
        previous.details.push(...follow.details);
        previous.sumDt = (previous.sumDt || 0) + (follow.sumDt || 0);
        previous.sumCt = (previous.sumCt || 0) + (follow.sumCt || 0);
      } else follows.set(follow.originType || '', follow);
    }
  }
  return {
    details,
    follows: [...follows.values()],
    side: [...sides][0] || TR_SIDES.DEBIT,
    mixedDirections: sides.size > 1,
  };
};
