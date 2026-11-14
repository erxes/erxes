import type { TFxaTaxDetail } from './fxaTaxValues';
import type { IModels } from '~/connectionResolvers';
import { getFxaLedgerAssets } from './fxaLedger';
import { getFxaCorrections, getFxaRulesAtDate } from './fxaRules';

export const getFxaIncomeTaxRates = async (
  models: IModels,
  date: Date,
  details: Pick<
    TFxaTaxDetail,
    'fixedAssetId' | 'accumulatedDepreciation' | 'taxAccumulatedDepreciation'
  >[],
): Promise<Map<string, number | undefined>> => {
  const fixedAssetIds = [
    ...new Set(
      details.flatMap((detail) =>
        detail.fixedAssetId &&
        detail.taxAccumulatedDepreciation !== undefined &&
        detail.taxAccumulatedDepreciation !==
          (detail.accumulatedDepreciation ?? 0)
          ? [detail.fixedAssetId]
          : [],
      ),
    ),
  ];
  if (!fixedAssetIds.length) return new Map();
  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);
  const [assets, corrections] = await Promise.all([
    getFxaLedgerAssets(models, endDate, fixedAssetIds),
    getFxaCorrections(models, endDate, undefined, fixedAssetIds),
  ]);
  return new Map(
    assets.map((asset) => [
      asset._id,
      getFxaRulesAtDate(asset, corrections, endDate).incomeTaxRate,
    ]),
  );
};
