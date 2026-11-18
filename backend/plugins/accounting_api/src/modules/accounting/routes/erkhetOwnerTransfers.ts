import type { IModels } from '~/connectionResolvers';
import type { ITransaction } from '../@types/transaction';
import type { TFxaOwnerRecordInput } from '../utils/fixedAssets';
import type { IFxaOwnerRecord } from '@/fixedAssets/@types/fxaOwnerRecord';
import {
  FXA_OWNER_RECORD_ACTIONS,
  FXA_OWNER_RECORD_STATUSES,
} from '@/fixedAssets/@types/constants';
import { JOURNALS } from '../@types/constants';

export const isErkhetOwnerOnly = (doc: ITransaction): boolean =>
  doc.extraData?.fxaOwnerOnly === true;

// Stable ids belong to this source parent, independently of financial transactions.
export const prepareErkhetOwnerTransfers = async (
  models: IModels,
  externalPtrId: string,
  docs: ITransaction[],
  userId: string,
) => {
  const prefix = `erkhet-owner-${Buffer.from(externalPtrId).toString('hex')}-`;
  const ownedFilter = { _id: { $regex: `^${prefix}` } };
  const existing = await models.FxaOwnerRecords.find(ownedFilter).lean();
  const records: (IFxaOwnerRecord & { _id: string })[] = [];
  const ids = new Set<string>();
  for (const doc of docs) {
    if (doc.journal !== JOURNALS.FXA_MOVE || !isErkhetOwnerOnly(doc)) {
      throw new Error(
        'Owner-only migration requires a marked fixed asset movement.',
      );
    }
    if (!Number.isFinite(new Date(doc.date).getTime()))
      throw new Error('Owner transfer date is invalid.');
    const inputs = (doc.extraData?.fxaOwnerRecords ||
      []) as TFxaOwnerRecordInput[];
    for (const detail of doc.details) {
      if (
        !detail._id ||
        !detail.fixedAssetId ||
        (detail.amount || 0) !== 0 ||
        (detail.unitPrice || 0) !== 0 ||
        !Number.isSafeInteger(detail.count) ||
        (detail.count || 0) <= 0 ||
        (doc.followInfos?.moveInBranchId || '') !== (detail.branchId || '') ||
        (doc.followInfos?.moveInDepartmentId || '') !==
          (detail.departmentId || '')
      ) {
        throw new Error(
          'Owner-only movement requires a stable detail, positive quantity and unchanged location.',
        );
      }
      const owners = inputs.filter(
        (input) => input.transactionDetailId === detail._id,
      );
      if (
        !owners.length ||
        owners.reduce((sum, input) => sum + (input.count || 0), 0) !==
          detail.count
      ) {
        throw new Error(
          'Owner-only allocations must cover the detail quantity.',
        );
      }
      owners.forEach((input, index) => {
        if (
          !input.sourceOwnerId ||
          !input.ownerId ||
          input.sourceOwnerId === input.ownerId ||
          !Number.isSafeInteger(input.count) ||
          (input.count || 0) <= 0
        ) {
          throw new Error(
            'Owner transfer requires different mapped source and destination owners and a positive count.',
          );
        }
        const key = `${prefix}${Buffer.from(detail._id || '').toString(
          'hex',
        )}-${index}`;
        if (ids.has(key)) throw new Error('Duplicate owner transfer detail.');
        ids.add(key);
        const base = {
          fixedAssetId: detail.fixedAssetId || '',
          code: input.code || '',
          sequence: input.sequence,
          count: input.count,
          status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
          createdBy: userId,
          createdAt: new Date(doc.date),
        };
        records.push(
          {
            ...base,
            _id: `${key}-out`,
            ownerId: input.sourceOwnerId,
            action: FXA_OWNER_RECORD_ACTIONS.HANDED_OVER,
          },
          {
            ...base,
            _id: `${key}-in`,
            ownerId: input.ownerId,
            action: FXA_OWNER_RECORD_ACTIONS.RECEIVED,
          },
        );
      });
    }
  }
  const assetIds = [
    ...new Set([...existing, ...records].map((row) => row.fixedAssetId)),
  ];
  const ledger = assetIds.length
    ? await models.FxaOwnerRecords.find({
        fixedAssetId: { $in: assetIds },
        status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
        _id: { $nin: existing.map((row) => row._id) },
      }).lean()
    : [];
  const balances = new Map<string, number>();
  const keyOf = (row: IFxaOwnerRecord) =>
    JSON.stringify([row.fixedAssetId, row.ownerId || '']);
  for (const row of ledger) {
    if (!FXA_OWNER_RECORD_ACTIONS.ALL.includes(row.action || '')) continue;
    const sign = row.action === FXA_OWNER_RECORD_ACTIONS.HANDED_OVER ? -1 : 1;
    const key = keyOf(row);
    balances.set(key, (balances.get(key) || 0) + sign * (row.count || 0));
  }
  for (const row of records) {
    const key = keyOf(row);
    const sign = row.action === FXA_OWNER_RECORD_ACTIONS.HANDED_OVER ? -1 : 1;
    const balance = (balances.get(key) || 0) + sign * (row.count || 0);
    if (sign < 0 && balance < 0)
      throw new Error('Source owner does not have enough fixed asset count.');
    balances.set(key, balance);
  }
  // Editing/removing a transfer must not orphan a later handover by its old owner.
  for (const row of [...existing, ...records]) {
    if ((balances.get(keyOf(row)) || 0) < 0) {
      throw new Error('Later owner movements depend on this transfer.');
    }
  }
  return {
    count: records.length,
    save: async () => {
      if (records.length) {
        await models.FxaOwnerRecords.bulkWrite(
          records.map((record) => ({
            updateOne: {
              filter: { _id: record._id },
              update: { $set: record },
              upsert: true,
            },
          })),
        );
      }
      await models.FxaOwnerRecords.deleteMany({
        _id: { $regex: `^${prefix}`, $nin: records.map((row) => row._id) },
      });
    },
  };
};
