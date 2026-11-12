import type { ITransaction, ITrDetail } from '../@types/transaction';

export type TFxaTaxTotals = {
  accumulatedDepreciation?: number;
  taxAccumulatedDepreciation?: number;
};

export type TFxaTaxDetail = TFxaTaxTotals &
  Partial<
    Pick<ITrDetail, 'fixedAssetId' | 'accountId' | 'branchId' | 'departmentId'>
  > & {
    transactionDetailId?: string;
    incomeTaxRate?: number;
  };

export const getFxaSourceTaxDetail = (
  detail: ITrDetail,
  transaction?: Pick<ITransaction, 'branchId' | 'departmentId'>,
): TFxaTaxDetail => ({
  fixedAssetId: detail.fixedAssetId,
  transactionDetailId: detail._id,
  accountId: detail.accountId,
  branchId: transaction
    ? detail.branchId || transaction.branchId
    : detail.branchId,
  departmentId: transaction
    ? detail.departmentId || transaction.departmentId
    : detail.departmentId,
  accumulatedDepreciation: detail.followInfos?.preDeprecation ?? 0,
  taxAccumulatedDepreciation: detail.followInfos?.taxPreDeprecation ?? 0,
  incomeTaxRate: detail.followInfos?.incomeTaxRate,
});

export const getFxaTaxValues = (detail: TFxaTaxTotals, taxRate?: number) => {
  const temporaryDifference =
    detail.taxAccumulatedDepreciation === undefined
      ? undefined
      : detail.taxAccumulatedDepreciation -
        (detail.accumulatedDepreciation ?? 0);
  let tax: number | undefined;
  if (temporaryDifference === 0) {
    tax = 0;
  } else if (temporaryDifference !== undefined && taxRate !== undefined) {
    tax = (temporaryDifference * taxRate) / 100;
  }
  return {
    temporaryDifference,
    deferredTaxAsset: tax === undefined ? undefined : Math.max(-tax, 0),
    deferredTaxLiability: tax === undefined ? undefined : Math.max(tax, 0),
  };
};
