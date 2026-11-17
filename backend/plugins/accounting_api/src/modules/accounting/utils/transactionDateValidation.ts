import { getFullDate } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import type { ITransaction } from '../@types/transaction';
import { JOURNALS } from '../@types/constants';

type TAdjustmentModel = Pick<
  IModels,
  | 'AdjustClosings'
  | 'AdjustInventories'
  | 'AdjustFixedAssets'
  | 'AdjustFundRates'
  | 'AdjustDebtRates'
>;

type TDateLock = {
  model: keyof TAdjustmentModel;
  contentType: string;
  statuses: string[];
  label: string;
};

const closingLock: TDateLock = {
  model: 'AdjustClosings',
  contentType: 'accounting:adjustClosing',
  statuses: ['complete', 'publish'],
  label: 'closing',
};

const journalLocks: Record<string, TDateLock> = {};
for (const journal of [
  JOURNALS.INV_INCOME,
  JOURNALS.INV_OUT,
  JOURNALS.INV_JUSTIFY,
  JOURNALS.INV_MOVE,
  JOURNALS.INV_MOVE_IN,
  JOURNALS.INV_SALE,
  JOURNALS.INV_SALE_OUT,
  JOURNALS.INV_SALE_COST,
  JOURNALS.INV_SALE_RETURN,
  JOURNALS.INV_SALE_RETURN_OUT,
  JOURNALS.INV_SALE_RETURN_COST,
]) {
  journalLocks[journal] = {
    model: 'AdjustInventories',
    contentType: 'accounting:adjustInventory',
    statuses: ['publish'],
    label: 'inventory',
  };
}
for (const journal of [
  JOURNALS.FXA_INCOME,
  JOURNALS.FXA_OUT,
  JOURNALS.FXA_MOVE,
  JOURNALS.FXA_MOVE_IN,
  JOURNALS.FXA_SALE,
  JOURNALS.FXA_SALE_OUT,
  JOURNALS.FXA_SALE_COST,
  JOURNALS.FXA_DEP,
  JOURNALS.FXA_DEP_IN,
  JOURNALS.FXA_DEP_OUT,
  JOURNALS.FXA_CAPITAL,
  JOURNALS.FXA_REVALUATION,
  JOURNALS.FXA_REVALUATION_RESULT,
  JOURNALS.FXA_DEFERRED_TAX,
]) {
  journalLocks[journal] = {
    model: 'AdjustFixedAssets',
    contentType: 'accounting:adjustFixedAsset',
    statuses: ['complete', 'publish'],
    label: 'fixed asset',
  };
}
for (const journal of [JOURNALS.CASH, JOURNALS.BANK]) {
  journalLocks[journal] = {
    model: 'AdjustFundRates',
    contentType: 'accounting:adjustFundRate',
    statuses: ['complete'],
    label: 'fund rate',
  };
}
for (const journal of [JOURNALS.RECEIVABLE, JOURNALS.PAYABLE]) {
  journalLocks[journal] = {
    model: 'AdjustDebtRates',
    contentType: 'accounting:adjustDebtRate',
    statuses: ['complete'],
    label: 'debt rate',
  };
}

type TDateFilter = {
  status: { $in: string[] };
  _id?: { $ne: string };
};

const adjustmentReaders: Record<
  keyof TAdjustmentModel,
  (models: IModels, filter: TDateFilter) => Promise<{ date: Date } | null>
> = {
  AdjustClosings: async (models, filter) =>
    models.AdjustClosings.findOne(filter).sort({ date: -1 }).lean(),
  AdjustInventories: async (models, filter) =>
    models.AdjustInventories.findOne(filter).sort({ date: -1 }).lean(),
  AdjustFixedAssets: async (models, filter) =>
    models.AdjustFixedAssets.findOne(filter).sort({ date: -1 }).lean(),
  AdjustFundRates: async (models, filter) =>
    models.AdjustFundRates.findOne(filter).sort({ date: -1 }).lean(),
  AdjustDebtRates: async (models, filter) =>
    models.AdjustDebtRates.findOne(filter).sort({ date: -1 }).lean(),
};

const validateAdjustmentDate = async (
  models: IModels,
  transaction: ITransaction,
  date: Date,
  lock: TDateLock,
): Promise<void> => {
  // Exclude only this workflow, so posting and undo still check later periods.
  const adjustment = await adjustmentReaders[lock.model](models, {
    status: { $in: lock.statuses },
    ...(transaction.contentType === lock.contentType && transaction.contentId
      ? { _id: { $ne: transaction.contentId } }
      : {}),
  });
  if (!adjustment) return;

  const endOfDay = new Date(adjustment.date);
  endOfDay.setHours(23, 59, 59, 999);
  if (date > endOfDay) return;

  const cutoff = getFullDate(adjustment.date).toISOString().slice(0, 10);
  throw new Error(
    `Cancel the ${lock.label} adjustment dated ${cutoff} before changing transactions on or before that date.`,
  );
};

export const validateTransactionDate = async (
  models: IModels,
  transaction: ITransaction,
  oldTransaction?: ITransaction,
): Promise<void> => {
  const date = new Date(transaction.date);
  const oldDate = oldTransaction ? new Date(oldTransaction.date) : date;
  if (!Number.isFinite(date.getTime()) || !Number.isFinite(oldDate.getTime())) {
    throw new Error('Invalid transaction date.');
  }
  if (oldDate < date) date.setTime(oldDate.getTime());

  // Closing locks every journal before any journal-specific lookup.
  await validateAdjustmentDate(models, transaction, date, closingLock);
  const journalLock = journalLocks[transaction.journal];
  if (journalLock) {
    await validateAdjustmentDate(models, transaction, date, journalLock);
  }
};
