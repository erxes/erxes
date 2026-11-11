import type { IAdjustFxaDetail } from '../@types/adjustFixedAsset';

export const getFxaTaxValues = (
  detail: Pick<
    IAdjustFxaDetail,
    'accumulatedDepreciation' | 'taxAccumulatedDepreciation'
  >,
  taxRate?: number,
) => {
  const temporaryDifference =
    detail.taxAccumulatedDepreciation === undefined
      ? undefined
      : detail.taxAccumulatedDepreciation -
        (detail.accumulatedDepreciation ?? 0);
  const tax =
    temporaryDifference === 0
      ? 0
      : temporaryDifference === undefined || taxRate === undefined
      ? undefined
      : (temporaryDifference * taxRate) / 100;
  return {
    temporaryDifference,
    deferredTaxAsset: tax === undefined ? undefined : Math.max(-tax, 0),
    deferredTaxLiability: tax === undefined ? undefined : Math.max(tax, 0),
  };
};
