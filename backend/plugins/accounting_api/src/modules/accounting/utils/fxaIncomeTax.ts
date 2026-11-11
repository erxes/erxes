import type { IModels } from '~/connectionResolvers';
import { getFxaSourceTaxDetail } from './fxaTaxValues';
import type { ITransaction, ITransactionDocument } from '../@types/transaction';
import { TR_FOLLOW_TYPES } from '../@types/constants';
import { getFxaDeferredTaxTransactions } from './fxaDeferredTax';
import { assertCanWriteTransactionAccounts } from './trPermissions';
import { createOrUpdateTr } from './utils';

export const validateFxaIncomeTax = (transaction: ITransaction): void => {
  for (const detail of transaction.details) {
    const info = detail.followInfos;
    if (
      info?.hasTaxDepreciation !== undefined &&
      typeof info.hasTaxDepreciation !== 'boolean'
    ) {
      throw new TypeError('Tax depreciation toggle must be a boolean.');
    }
    const rate = info?.incomeTaxRate;
    if (
      (rate !== undefined &&
        (!Number.isFinite(rate) || rate < 0 || rate > 100)) ||
      (info?.hasTaxDepreciation &&
        (detail.count || 0) > 0 &&
        rate === undefined)
    ) {
      throw new Error(
        'Enter an income tax rate between 0 and 100 on the acquisition depreciation rules.',
      );
    }
  }
};

export const getFxaIncomeTaxDocuments = async (
  models: IModels,
  userId: string,
  transaction: ITransaction,
): Promise<{ docs: ITransaction[]; existing: ITransactionDocument[] }> => {
  validateFxaIncomeTax(transaction);
  const details = transaction.details.flatMap((detail) => {
    const info = detail.followInfos;
    if (!info?.hasTaxDepreciation || (detail.count || 0) <= 0) return [];
    const difference =
      (info.taxPreDeprecation ?? 0) - (info.preDeprecation ?? 0);
    if (Math.abs(difference) <= 0.005) return [];
    return [getFxaSourceTaxDetail(detail, transaction)];
  });
  const existing = transaction._id
    ? (
        await models.Transactions.find({
          originId: transaction._id,
          originType: TR_FOLLOW_TYPES.FXA_DEFERRED_TAX,
        }).lean()
      ).filter(
        (row) =>
          row.originId === transaction._id &&
          row.originType === TR_FOLLOW_TYPES.FXA_DEFERRED_TAX,
      )
    : [];
  const docs = details.length
    ? await getFxaDeferredTaxTransactions(
        models,
        { ...transaction, _id: transaction._id || '' },
        details,
        { openingIncome: true },
      )
    : [];
  if (docs.length || existing.length) {
    await assertCanWriteTransactionAccounts({
      models,
      userId,
      docs,
      oldTrs: existing,
    });
  }
  return { docs, existing };
};

export const syncFxaIncomeDeferredTax = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
): Promise<void> => {
  const { docs, existing } = await getFxaIncomeTaxDocuments(
    models,
    userId,
    transaction,
  );
  const retained = new Set<string>();
  for (const doc of docs) {
    const old = existing.find(
      (row) => row.side === doc.side && !retained.has(row._id),
    );
    doc.details = doc.details.map((detail) => ({
      ...detail,
      _id: old?.details.find(
        (row) =>
          row.originId === detail.originId &&
          row.accountId === detail.accountId,
      )?._id,
    }));
    const saved = await createOrUpdateTr(models, userId, doc, old);
    retained.add(saved._id);
  }
  const staleIds = existing
    .filter((row) => !retained.has(row._id))
    .map((row) => row._id);
  if (staleIds.length)
    await models.Transactions.deleteMany({ _id: { $in: staleIds } });
};
