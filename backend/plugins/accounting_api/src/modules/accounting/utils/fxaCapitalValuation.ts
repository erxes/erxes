import { getFxaLedgerAssets } from './fxaLedger';
import { IUserDocument } from 'erxes-api-shared/core-types';
import { IModels } from '~/connectionResolvers';
import { ADJ_FXA_STATUSES } from '../@types/adjustFixedAsset';
import {
  JOURNALS,
  TR_INVENTORY_STATUS_TYPES,
  TR_SIDES,
} from '../@types/constants';
import { getFxaCorrections, getFxaRulesAtDate } from './fxaJustify';
import { checkPermissionTrs } from './trPermissions';

export const fxaCapitalDate = (value: Date): Date => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime()))
    throw new Error('Invalid capitalization date.');
  date.setHours(0, 0, 0, 0);
  return date;
};

const quantitySign = (journal: string): number => {
  if ([JOURNALS.FXA_INCOME, JOURNALS.FXA_MOVE_IN].includes(journal)) return 1;
  if (
    [JOURNALS.FXA_OUT, JOURNALS.FXA_SALE, JOURNALS.FXA_MOVE].includes(journal)
  )
    return -1;
  return 0;
};

export const getFxaCapitalValuation = async (
  models: IModels,
  fixedAssetId: string,
  date: Date,
  excludeTransactionId?: string,
  user?: IUserDocument,
) => {
  const atDate = fxaCapitalDate(date);
  const endDate = new Date(atDate);
  endDate.setDate(endDate.getDate() + 1);
  const asset = (
    await getFxaLedgerAssets(models, date, [fixedAssetId], excludeTransactionId)
  )[0];
  if (
    !asset?.acquisitionDate ||
    fxaCapitalDate(asset.acquisitionDate) > atDate ||
    !asset.accountId
  ) {
    throw new Error('Select an acquired fixed asset with an asset account.');
  }
  const excluded = excludeTransactionId
    ? await models.Transactions.findOne({ _id: excludeTransactionId }).lean()
    : undefined;
  const transactions = await models.Transactions.find({
    'details.fixedAssetId': fixedAssetId,
    date: { $lt: endDate },
    status: { $in: TR_INVENTORY_STATUS_TYPES.REAL_STATUSES },
    ...(excluded?.parentId
      ? { parentId: { $ne: excluded.parentId } }
      : excludeTransactionId
      ? { _id: { $ne: excludeTransactionId } }
      : {}),
  }).lean();
  if (
    user &&
    (await checkPermissionTrs(models, transactions, user)).some(
      (tr) => tr.permission === 'hidden',
    )
  ) {
    throw new Error('Permission denied for fixed asset valuation accounts.');
  }
  const configs = await models.Configs.getConfigs('FIXEDASSET_ACCOUNTS');
  const value: unknown = configs.find(
    (config) => config.subId === asset.accountId,
  )?.value;
  const depreciationAccountId =
    value &&
    typeof value === 'object' &&
    'depreciationAccountId' in value &&
    typeof value.depreciationAccountId === 'string'
      ? value.depreciationAccountId
      : '';
  if (!depreciationAccountId)
    throw new Error(
      'Configure the accumulated depreciation account for this asset.',
    );
  const locations = new Map<
    string,
    { branchId: string; departmentId: string; count: number }
  >();
  let accumulated = 0;
  for (const transaction of transactions) {
    for (const detail of transaction.details) {
      if (detail.fixedAssetId !== fixedAssetId) continue;
      const branchId = detail.branchId || transaction.branchId || '';
      const departmentId =
        detail.departmentId || transaction.departmentId || '';
      const key = JSON.stringify([branchId, departmentId]);
      const location = locations.get(key) || {
        branchId,
        departmentId,
        count: 0,
      };
      location.count += quantitySign(transaction.journal) * (detail.count || 0);
      locations.set(key, location);
      if (
        detail.accountId === depreciationAccountId &&
        [
          JOURNALS.FXA_DEP,
          JOURNALS.FXA_DEP_IN,
          JOURNALS.FXA_DEP_OUT,
          JOURNALS.FXA_JUSTIFY,
        ].includes(transaction.journal)
      ) {
        accumulated +=
          detail.amount * (transaction.side === TR_SIDES.CREDIT ? 1 : -1);
      }
    }
  }
  if (Array.from(locations.values()).some((location) => location.count < 0)) {
    throw new Error('Fixed asset has negative location quantities.');
  }
  const activeLocations = Array.from(locations.values()).filter(
    (location) => location.count > 0,
  );
  const count = activeLocations.reduce(
    (sum, location) => sum + location.count,
    0,
  );
  const corrections = await getFxaCorrections(
    models,
    endDate,
    excludeTransactionId,
  );
  const rules = getFxaRulesAtDate(asset, corrections, atDate);
  const previous = await models.AdjustFixedAssets.findOne({
    date: { $lt: atDate },
    status: { $in: [ADJ_FXA_STATUSES.COMPLETE, ADJ_FXA_STATUSES.PUBLISH] },
  })
    .sort({ date: -1 })
    .lean();
  const previousDay = new Date(atDate);
  previousDay.setDate(previousDay.getDate() - 1);
  const ready =
    fxaCapitalDate(asset.acquisitionDate).getTime() === atDate.getTime() ||
    Boolean(
      previous &&
        fxaCapitalDate(previous.date).getTime() === previousDay.getTime(),
    );
  return {
    fixedAssetId,
    accountId: asset.accountId,
    depreciationAccountId,
    count,
    originalCost: rules.originalCost ?? asset.originalCost ?? 0,
    preDeprecation: count > 0 ? accumulated / count : 0,
    annualDepreciationRate: rules.annualDepreciationRate || 0,
    depreciationMethod: rules.depreciationMethod || 'straightLine',
    salvageValue: rules.salvageValue || 0,
    depreciationStartDate: rules.depreciationStartDate || asset.acquisitionDate,
    depreciationThrough: previous?.date,
    ready,
    locations: activeLocations,
  };
};

export type TFxaCapitalValuation = Awaited<
  ReturnType<typeof getFxaCapitalValuation>
>;
