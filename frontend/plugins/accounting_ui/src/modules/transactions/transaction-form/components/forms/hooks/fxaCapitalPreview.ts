import type { IFixedAssetAccountConfig } from '@/settings/fixed-assets/account-config/types/FixedAssetAccountConfig';
import {
  allocateFxaDepreciation,
  getTotalFxaDepreciation,
} from '@/transactions/transaction-form/components/helpers/fxaDepreciation';
import type { ResultOf } from '@graphql-typed-document-node/core';
import { FXA_CAPITAL_VALUATION } from '@/transactions/transaction-form/graphql/queries/fxaCapitalValuation';
import { TTrDoc } from '@/transactions/transaction-form/types/JournalForms';
import { ITransaction, ITrDetail } from '@/transactions/types/Transaction';
import { TrJournalEnum, TR_SIDES } from '@/transactions/types/constants';

export type TFxaCapitalValuation = ResultOf<
  typeof FXA_CAPITAL_VALUATION
>['fixedAssetCapitalValuation'];

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

export type TFxaCapitalTaxAccounts = Record<
  string,
  IFixedAssetAccountConfig['value']
>;
const TAX_ORIGIN = 'fxaDeferredTax';

const buildFxaCapitalTaxPreview = (
  trDoc: TTrDoc,
  valuation: TFxaCapitalValuation,
  details: ITrDetail[],
  taxAccounts?: TFxaCapitalTaxAccounts,
): { follows: ITransaction[]; error?: string } => {
  if (
    trDoc.journal !== TrJournalEnum.FXA_CAPITAL ||
    !valuation.hasTaxDepreciation ||
    !taxAccounts
  )
    return { follows: [] };
  const config = taxAccounts[valuation.accountId];
  const debit: ITrDetail[] = [];
  const credit: ITrDetail[] = [];
  const rate =
    trDoc.details[0]?.followInfos?.incomeTaxRate ?? valuation.incomeTaxRate;
  const money = (amount: number) => Math.round(amount * 10000) / 10000;
  for (const [index, location] of valuation.locations.entries()) {
    const info = details[index].followInfos;
    const difference =
      (info?.taxPreDeprecation ?? 0) - (info?.preDeprecation ?? 0);
    if (Math.abs(difference) > 0.005 && rate == null)
      return { follows: [], error: 'fxa-capital-income-tax-rate-required' };
    const target = (difference * (rate ?? 0)) / 100;
    const assetDelta = money(
      Math.max(-target, 0) - (location.deferredTaxAsset ?? 0),
    );
    const liabilityDelta = money(
      Math.max(target, 0) - (location.deferredTaxLiability ?? 0),
    );
    if (!assetDelta && !liabilityDelta) continue;
    if (
      !config?.TaxExpenseAccountId ||
      (assetDelta && !config.taxAssetAccountId) ||
      (liabilityDelta && !config.taxLiabilityAccountId)
    ) {
      return { follows: [], error: 'fxa-capital-tax-accounts-required' };
    }
    for (const [accountId, amount] of [
      [config.taxAssetAccountId, assetDelta],
      [config.taxLiabilityAccountId, -liabilityDelta],
      [config.TaxExpenseAccountId, liabilityDelta - assetDelta],
    ] as const) {
      if (!accountId || !amount) continue;
      (amount > 0 ? debit : credit).push({
        _id: `${trDoc._id}-${TAX_ORIGIN}-${
          valuation.fixedAssetId
        }-${index}-${accountId}-${amount > 0 ? 'dt' : 'ct'}`,
        originId: details[index]._id,
        originType: TAX_ORIGIN,
        fixedAssetId: valuation.fixedAssetId,
        accountId,
        branchId: location.branchId,
        departmentId: location.departmentId,
        branch: details[index].branch,
        department: details[index].department,
        amount: Math.abs(amount),
        count: 0,
        unitPrice: 0,
      });
    }
  }
  return {
    follows: [
      { side: TR_SIDES.DEBIT, details: debit },
      { side: TR_SIDES.CREDIT, details: credit },
    ]
      .filter((row) => row.details.length)
      .map((row) => ({
        ...row,
        _id: `${trDoc._id}-${TAX_ORIGIN}-${row.side}-${valuation.fixedAssetId}`,
        journal: TrJournalEnum.MAIN,
        originId: trDoc._id,
        originType: TAX_ORIGIN,
        ptrId: trDoc.ptrId,
        parentId: trDoc.parentId,
        description: trDoc.description,
        sumDt:
          row.side === TR_SIDES.DEBIT
            ? row.details.reduce((sum, row) => sum + (row.amount ?? 0), 0)
            : 0,
        sumCt:
          row.side === TR_SIDES.CREDIT
            ? row.details.reduce((sum, row) => sum + (row.amount ?? 0), 0)
            : 0,
      })),
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
  const depreciationDelta =
    ((getTotalFxaDepreciation(trDoc.details) ?? valuation.preDeprecation) -
      valuation.preDeprecation) /
    valuation.count;
  const locationDepreciation = allocateFxaDepreciation(
    getTotalFxaDepreciation(trDoc.details) ?? valuation.preDeprecation,
    valuation.locations.map((location) => location.count),
  );
  const totalTax = valuation.hasTaxDepreciation
    ? getTotalFxaDepreciation(trDoc.details, 'taxPreDeprecation') ??
      valuation.taxPreDeprecation ??
      valuation.preDeprecation
    : getTotalFxaDepreciation(trDoc.details) ?? valuation.preDeprecation;
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
      ...(!revaluation
        ? {
            taxPreDeprecation: locationTax[index],
            incomeTaxRate:
              info.incomeTaxRate ?? valuation.incomeTaxRate ?? undefined,
          }
        : {}),
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
  follows.push(...tax.follows);
  return {
    error: tax.error,
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

// Replace only this source journal's generated depreciation follows.
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
        !(replaceTax && row.originType === TAX_ORIGIN)),
  );
  const next = [
    ...remaining,
    ...follows.map((row) => {
      const saved = previous.find(
        (old) =>
          old.originId === originId &&
          old.originType === row.originType &&
          (row.originType !== TAX_ORIGIN || old.side === row.side),
      );
      return {
        ...saved,
        ...row,
        _id: saved?._id || row._id,
        details: row.details.map((detail) => {
          const savedDetail = saved?.details.find(
            (old) =>
              old.fixedAssetId === detail.fixedAssetId &&
              (row.originType !== TAX_ORIGIN ||
                old.accountId === detail.accountId) &&
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
