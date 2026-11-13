import { buildFxaRevaluationPreview } from '@/transactions/transaction-form/components/forms/hooks/fxaRevaluationPreview';
import {
  allocateFxaDepreciation,
  getTotalFxaDepreciation,
  getFxaRevaluationTaxTotal,
} from '@/transactions/transaction-form/components/helpers/fxaDepreciation';
import { TTrDoc } from '@/transactions/transaction-form/types/JournalForms';
import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';
import {
  buildFxaCapitalTaxPreview,
  type TFxaCapitalValuation,
  type TFxaCapitalTaxAccounts,
} from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalTaxPreview';

export type {
  TFxaCapitalValuation,
  TFxaCapitalTaxAccounts,
} from '@/transactions/transaction-form/components/forms/hooks/fxaCapitalTaxPreview';

export const allocateRevaluationPreview = (
  change: number,
  openingLoss: number,
  openingReserve: number,
) => {
  const money = (value: number) => Math.round(value * 10000) / 10000;
  const increase = money(Math.max(change, 0));
  const decrease = money(Math.max(-change, 0));
  const lossRecovery = money(Math.min(increase, openingLoss));
  const reserveUsed = money(Math.min(decrease, openingReserve));
  return {
    revaluationLoss: money(decrease - reserveUsed - lossRecovery),
    revaluationReserve: money(increase - lossRecovery - reserveUsed),
  };
};

const buildFxaCapitalAssetPreview = (
  trDoc: TTrDoc,
  valuation: TFxaCapitalValuation,
  taxAccounts?: TFxaCapitalTaxAccounts,
) => {
  if (
    trDoc.journal !== TrJournalEnum.FXA_CAPITAL &&
    trDoc.journal !== TrJournalEnum.FXA_REVALUATION
  )
    return undefined;
  const info = trDoc.details[0]?.followInfos;
  if (
    !info ||
    !valuation.count ||
    typeof info.originalCost !== 'number' ||
    !Number.isFinite(info.originalCost) ||
    info.originalCost < 0
  )
    return undefined;
  const revaluation = trDoc.journal === TrJournalEnum.FXA_REVALUATION;
  const sourceDetails: ITrDetail[] = trDoc.details;
  const costDelta = info.originalCost - valuation.originalCost;
  const bookTotal =
    getTotalFxaDepreciation(trDoc.details) ?? valuation.preDeprecation;
  const depreciationDelta =
    (bookTotal - valuation.preDeprecation) / valuation.count;
  const locationDepreciation = allocateFxaDepreciation(
    bookTotal,
    valuation.locations.map((location) => location.count),
  );
  let totalTax = bookTotal;
  if (revaluation) {
    totalTax = getFxaRevaluationTaxTotal(
      bookTotal,
      valuation.preDeprecation,
      valuation.taxPreDeprecation,
    );
  } else if (valuation.hasTaxDepreciation) {
    totalTax =
      getTotalFxaDepreciation(trDoc.details, 'taxPreDeprecation') ??
      valuation.taxPreDeprecation ??
      valuation.preDeprecation;
  }
  const locationTax = allocateFxaDepreciation(
    totalTax,
    valuation.locations.map((row) => row.count),
  );
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
    branch: sourceDetails.find((row) => row.branch?._id === location.branchId)
      ?.branch,
    department: sourceDetails.find(
      (row) => row.department?._id === location.departmentId,
    )?.department,
    count: 0 as const,
    unitPrice: 0,
    amount: round(costDelta * location.count),
    followInfos: {
      ...info,
      preDeprecation: locationDepreciation[index],
      taxPreDeprecation: locationTax[index],
      incomeTaxRate: info.incomeTaxRate ?? valuation.incomeTaxRate ?? undefined,
      revaluationLoss: undefined,
      revaluationReserve: undefined,
      ...(revaluation
        ? {
            ...allocateRevaluationPreview(
              (costDelta - depreciationDelta) * location.count,
              ((valuation.revaluationLoss || 0) * location.count) /
                valuation.count,
              ((valuation.revaluationReserve || 0) * location.count) /
                valuation.count,
            ),
          }
        : {}),
    },
  }));
  const decreasesDepreciation = depreciationDelta < 0;
  const originType = decreasesDepreciation
    ? TrJournalEnum.FXA_DEP_OUT
    : TrJournalEnum.FXA_DEP_IN;
  const followDetails = valuation.locations
    .map((location, index) => ({
      _id: `${trDoc._id}-${originType}-${valuation.fixedAssetId}-${index}`,
      fixedAssetId: valuation.fixedAssetId,
      accountId: valuation.depreciationAccountId,
      branchId: location.branchId,
      departmentId: location.departmentId,
      branch: details.find((row) => row.branchId === location.branchId)?.branch,
      department: details.find(
        (row) => row.departmentId === location.departmentId,
      )?.department,
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
  const tax = buildFxaCapitalTaxPreview(trDoc, valuation, details, taxAccounts);
  const revaluationResult = buildFxaRevaluationPreview(
    trDoc,
    details,
    taxAccounts,
  );
  follows.push(...revaluationResult.follows, ...tax.follows);
  return {
    error: revaluationResult.error || tax.error,
    details,
    side: costDelta < 0 ? TR_SIDES.CREDIT : TR_SIDES.DEBIT,
    follows,
  };
};

export const buildFxaCapitalPreview = (
  trDoc: TTrDoc,
  valuationInput: TFxaCapitalValuation | TFxaCapitalValuation[],
  taxAccounts?: TFxaCapitalTaxAccounts,
) => {
  if (
    trDoc.journal !== TrJournalEnum.FXA_CAPITAL &&
    trDoc.journal !== TrJournalEnum.FXA_REVALUATION
  )
    return undefined;
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
  let error: string | undefined;
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
      taxAccounts,
    );
    if (!result) return undefined;
    details.push(...result.details);
    error = error || result.error;
    if (result.details.some((detail) => detail.amount > 0.005))
      sides.add(result.side);
    for (const follow of result.follows) {
      const key = `${follow.originType}:${follow.side}`;
      const previous = follows.get(key);
      if (previous) {
        previous.details.push(...follow.details);
        previous.sumDt = (previous.sumDt || 0) + (follow.sumDt || 0);
        previous.sumCt = (previous.sumCt || 0) + (follow.sumCt || 0);
      } else follows.set(key, follow);
    }
  }
  return {
    details,
    follows: [...follows.values()],
    side: [...sides][0] || TR_SIDES.DEBIT,
    mixedDirections: sides.size > 1,
    error,
  };
};

// Replace this source journal's generated depreciation and loaded tax follows.
export const mergeFxaDepreciationFollows = (
  previous: ITransaction[],
  follows: ITransaction[],
  originId: string,
  replaceTax = false,
): ITransaction[] => {
  const remaining = previous.filter(
    (row) =>
      row.originId !== originId ||
      (row.originType !== TrJournalEnum.FXA_DEP_IN &&
        row.originType !== TrJournalEnum.FXA_DEP_OUT &&
        !(
          replaceTax &&
          (row.originType === TrJournalEnum.FXA_DEFERRED_TAX ||
            row.originType === TrJournalEnum.FXA_REVALUATION_RESULT)
        )),
  );
  const next = [
    ...remaining,
    ...follows.map((row) => {
      const saved = previous.find(
        (old) =>
          old.originId === originId &&
          old.originType === row.originType &&
          old.side === row.side,
      );
      return {
        ...saved,
        ...row,
        _id: saved?._id || row._id,
        details: row.details.map((detail) => {
          const savedDetail = saved?.details.find(
            (old) =>
              old.fixedAssetId === detail.fixedAssetId &&
              old.accountId === detail.accountId &&
              (old.branchId || '') === (detail.branchId || '') &&
              (old.departmentId || '') === (detail.departmentId || ''),
          );
          return {
            ...savedDetail,
            ...detail,
            _id: savedDetail?._id || detail._id,
          };
        }),
      };
    }),
  ];
  return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
};
