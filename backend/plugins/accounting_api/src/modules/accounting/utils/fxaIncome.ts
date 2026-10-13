import { nanoid } from 'nanoid';
import { fixNum } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  FXA_OWNER_RECORD_ACTIONS,
  FXA_OWNER_RECORD_STATUSES,
} from '@/fixedAssets/@types/constants';
import { IFixedAsset } from '@/fixedAssets/@types/fixedAsset';
import {
  ITransaction,
  ITransactionDocument,
  ITrDetail,
} from '../@types/transaction';
import {
  JOURNALS,
  TR_DETAIL_FOLLOW_TYPES,
  TR_FOLLOW_TYPES,
  TR_SIDES,
} from '../@types/constants';
import {
  cleanFxaFollowTr,
  getDetailId,
  assignMissingFxaOwnerRecordSequences,
  getFxaOwnerRecordInputs,
  getUniqueFxaOwnerRecordIds,
  rebuildFixedAssetCurrentCounts,
  TFxaIncomeDetailRemoveOptions,
  TFxaOwnerRecordInput,
} from './fixedAssets';
import { createOrUpdateTr } from './utils';

type TFixedAssetWithId = IFixedAsset & { _id: string };
type TFixedAssetAccountConfig = {
  accountId?: string;
  depreciationAccountId?: string;
};

const FIXED_ASSET_ACCOUNTS_CODE = 'FIXEDASSET_ACCOUNTS';

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getAccountConfigs = async (models: IModels) => {
  const configs = await models.Configs.getConfigs(FIXED_ASSET_ACCOUNTS_CODE);
  const map = new Map<string, TFixedAssetAccountConfig>();

  for (const config of configs) {
    if (config.subId) {
      map.set(config.subId, config.value as TFixedAssetAccountConfig);
    }
  }

  return map;
};

const getCategoryIds = (transaction: ITransactionDocument) =>
  Array.from(
    new Set(
      (transaction.details || [])
        .map((detail) => detail.fixedAssetCategoryId)
        .filter((categoryId): categoryId is string => Boolean(categoryId)),
    ),
  );

const getFixedAssetCodes = (transaction: ITransactionDocument) =>
  Array.from(
    new Set(
      (transaction.details || [])
        .map((detail) => detail.fixedAssetCode)
        .filter((code): code is string => Boolean(code)),
    ),
  );

const getCategoriesById = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  const categories = await models.FixedAssetCategories.find({
    _id: { $in: getCategoryIds(transaction) },
  }).lean();

  return new Map(categories.map((category) => [category._id, category]));
};

const buildFixedAssetDoc = ({
  category,
  date,
  detail,
  transaction,
  userId,
}: {
  category?: {
    depreciationMethod?: string;
    defaultAnnualDepreciationRate?: number;
    defaultSalvageValue?: number;
    taxDepreciationMethod?: string;
    defaultTaxAnnualDepreciationRate?: number;
    defaultTaxSalvageValue?: number;
  };
  date: Date;
  detail: ITrDetail;
  transaction: ITransactionDocument;
  userId: string;
}): IFixedAsset => {
  const count = Math.max(0, Math.trunc(detail.count || 0));
  const totalCount = Math.max(
    0,
    Math.trunc(Number(detail.followInfos?.fixedAssetTotalCount || count)),
  );
  const totalAmount = Number(
    detail.followInfos?.fixedAssetTotalAmount || detail.amount || 0,
  );
  const assetCount = totalCount || count;
  const unitPrice =
    detail.unitPrice || (assetCount ? totalAmount / assetCount : 0);

  return {
    code: detail.fixedAssetCode || '',
    name: detail.fixedAssetName || '',
    categoryId: detail.fixedAssetCategoryId || '',
    status: 'active',
    accountId: detail.accountId,
    count: assetCount,
    currentCount: assetCount,
    originalCost: unitPrice,
    acquisitionDate: date,
    depreciationStartDate: detail.followInfos?.depreciationStartDate || date,
    depreciationMethod: category?.depreciationMethod,
    annualDepreciationRate: category?.defaultAnnualDepreciationRate,
    salvageValue:
      detail.followInfos?.salvageValue ?? category?.defaultSalvageValue,
    taxDepreciationMethod: category?.taxDepreciationMethod,
    taxAnnualDepreciationRate: category?.defaultTaxAnnualDepreciationRate,
    taxSalvageValue: category?.defaultTaxSalvageValue,
    transactionId: transaction._id,
    transactionDetailId: getDetailId(detail),
    createdBy: userId,
  };
};

const validateIncomeDetails = (transaction: ITransactionDocument) => {
  for (const detail of transaction.details || []) {
    const count = Math.max(0, Math.trunc(detail.count || 0));

    if (!count) {
      continue;
    }

    if (!detail.fixedAssetCategoryId && !detail.fixedAssetId) {
      throw new Error('Fixed asset category is required.');
    }

    if (!detail.fixedAssetId && !detail.fixedAssetCode) {
      throw new Error('Fixed asset code is required.');
    }

    if (!detail.fixedAssetId && !detail.fixedAssetName) {
      throw new Error('Fixed asset name is required.');
    }
  }
};

const syncTransactionFixedAssetIds = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  await models.Transactions.updateOne(
    { _id: transaction._id },
    { $set: { details: transaction.details } },
  );
};

const findIncomeFixedAssets = async (
  models: IModels,
  transaction: ITransactionDocument,
  detailIds?: string[],
) => {
  const filter: Record<string, unknown> = {
    transactionId: transaction._id,
  };

  if (detailIds?.length) {
    filter.transactionDetailId = { $in: detailIds };
  }

  return models.FixedAssets.find(filter).lean();
};

const findFixedAssetsByCodes = async (
  models: IModels,
  transaction: ITransactionDocument,
) => {
  const codes = getFixedAssetCodes(transaction);

  if (!codes.length) {
    return [];
  }

  return models.FixedAssets.find({ code: { $in: codes } }).lean();
};

const removeOpeningAccumulatedDepreciation = async (
  models: IModels,
  transactionId: string,
  detailIds?: string[],
) => {
  const followTransaction = await cleanFxaFollowTr(
    models,
    transactionId,
    TR_FOLLOW_TYPES.FXA_DEP_IN,
  );

  if (!followTransaction?._id) {
    return;
  }

  if (!detailIds?.length) {
    await models.Transactions.deleteMany({ _id: followTransaction._id });
    return;
  }

  const removedDetailIds = new Set(detailIds);
  const details = (followTransaction.details || []).filter(
    (detail) => !removedDetailIds.has(detail.originId || ''),
  );

  if (!details.length) {
    await models.Transactions.deleteMany({ _id: followTransaction._id });
    return;
  }

  await models.Transactions.updateOne(
    { _id: followTransaction._id },
    { $set: { details } },
  );
};

export const removeFxaIncomeDetails = async (
  models: IModels,
  transaction: ITransactionDocument,
  options: TFxaIncomeDetailRemoveOptions = {},
) => {
  const fixedAssets = await findIncomeFixedAssets(
    models,
    transaction,
    options.detailIds,
  );
  const fixedAssetIds = fixedAssets.map((fixedAsset) => fixedAsset._id);
  const selectedDetailIds = options.detailIds?.length
    ? new Set(options.detailIds)
    : undefined;
  const referencedAssetIds = (transaction.details || [])
    .filter(
      (detail) =>
        !selectedDetailIds || selectedDetailIds.has(getDetailId(detail)),
    )
    .map((detail) => detail.fixedAssetId)
    .filter((id): id is string => Boolean(id));
  const protectedAssetIds = getUniqueFxaOwnerRecordIds([
    ...fixedAssetIds,
    ...referencedAssetIds,
  ]);

  if (!protectedAssetIds.length) {
    return;
  }

  const blockingTransaction = await models.Transactions.findOne({
    _id: { $ne: transaction._id },
    'details.fixedAssetId': { $in: protectedAssetIds },
    $nor: [{ originId: transaction._id }],
  }).lean();

  if (blockingTransaction) {
    throw new Error(
      'Cannot remove transaction detail because fixed assets are already used in other transactions',
    );
  }

  if (options.validateOnly || !fixedAssetIds.length) {
    return;
  }

  await models.FxaOwnerRecords.deleteMany({
    fixedAssetId: { $in: fixedAssetIds },
  });
  await models.FixedAssets.deleteMany({ _id: { $in: fixedAssetIds } });
  await removeOpeningAccumulatedDepreciation(
    models,
    transaction._id,
    options.detailIds,
  );
};

const syncOpeningAccumulatedDepreciation = async ({
  date,
  fixedAssetsByDetailId,
  inputs,
  models,
  transaction,
  userId,
}: {
  date: Date;
  fixedAssetsByDetailId: Map<string, TFixedAssetWithId>;
  inputs: TFxaOwnerRecordInput[];
  models: IModels;
  transaction: ITransactionDocument;
  userId: string;
}) => {
  const openingDate = addDays(date, -1);
  const accountConfigs = await getAccountConfigs(models);
  const oldOpeningDepTr = await cleanFxaFollowTr(
    models,
    transaction._id,
    TR_FOLLOW_TYPES.FXA_DEP_IN,
  );
  const openingDepDetails = inputs
    .map((input) => {
      const detail = (transaction.details || []).find(
        (item) => getDetailId(item) === input.transactionDetailId,
      );
      const fixedAsset = fixedAssetsByDetailId.get(
        input.transactionDetailId || '',
      );
      const preDeprecation = Number(detail?.followInfos?.preDeprecation ?? 0);

      if (!detail || !fixedAsset?._id || preDeprecation <= 0) {
        return;
      }

      const count = Math.max(1, Math.trunc(input.count || detail.count || 1));
      const depreciationAccountId = accountConfigs.get(
        detail.accountId || '',
      )?.depreciationAccountId;

      if (!depreciationAccountId) {
        throw new Error('Accumulated depreciation account config is missing.');
      }

      const oldDetail = oldOpeningDepTr?.details.find(
        (item) => item.originId === input.transactionDetailId,
      );
      const amount = fixNum(preDeprecation * count);

      return {
        ...oldDetail,
        originId: input.transactionDetailId,
        originType: TR_DETAIL_FOLLOW_TYPES.FXA_DEP_IN,
        fixedAssetId: fixedAsset._id,
        accountId: depreciationAccountId,
        branchId: detail.branchId || transaction.branchId,
        departmentId: detail.departmentId || transaction.departmentId,
        count: 1,
        unitPrice: amount,
        amount,
      } as ITrDetail;
    })
    .filter((detail): detail is ITrDetail => Boolean(detail));

  if (!openingDepDetails.length) {
    if (oldOpeningDepTr?._id) {
      await models.Transactions.deleteMany({ _id: oldOpeningDepTr._id });
    }
    return;
  }
  const openingDepTrDoc: ITransaction = {
    ...oldOpeningDepTr,
    originId: transaction._id,
    originType: TR_FOLLOW_TYPES.FXA_DEP_IN,
    ptrId: transaction.ptrId || oldOpeningDepTr?.ptrId || nanoid(),
    parentId: transaction.parentId,
    number: transaction.number,
    date: openingDate,
    description: `Opening accumulated depreciation for fixed asset income ${transaction._id}`,
    status: transaction.status,
    mentionOwnerId: transaction.mentionOwnerId,
    mentionUserIds: transaction.mentionUserIds,
    branchId: transaction.branchId,
    departmentId: transaction.departmentId,
    customerType: transaction.customerType,
    customerId: transaction.customerId,
    journal: JOURNALS.FXA_DEP_IN,
    side: TR_SIDES.CREDIT,
    details: openingDepDetails,
  };

  await createOrUpdateTr(models, userId, openingDepTrDoc, oldOpeningDepTr);
};

const getOwnerInputs = (
  transaction: ITransactionDocument,
  fixedAssetsByDetailId: Map<string, TFixedAssetWithId>,
): TFxaOwnerRecordInput[] => {
  const inputs = getFxaOwnerRecordInputs(transaction);

  if (inputs.length) {
    return inputs;
  }

  return (transaction.details || []).reduce<TFxaOwnerRecordInput[]>(
    (result, detail) => {
      const detailId = getDetailId(detail);
      const fixedAsset = fixedAssetsByDetailId.get(detailId);
      const ownerId =
        transaction.followInfos?.ownerId ||
        transaction.followInfos?.responsibleUserId;

      if (!fixedAsset?._id || !ownerId) {
        return result;
      }

      result.push({
        tempId: nanoid(),
        transactionDetailId: detailId,
        fixedAssetId: fixedAsset._id,
        count: detail.count,
        ownerId,
      });

      return result;
    },
    [],
  );
};

const validateOwnerInputCounts = (
  transaction: ITransactionDocument,
  inputs: TFxaOwnerRecordInput[],
) => {
  const countByDetailId = inputs.reduce<Record<string, number>>(
    (result, input) => {
      const detailId = input.transactionDetailId || '';

      if (!detailId) {
        return result;
      }

      result[detailId] =
        (result[detailId] || 0) + Math.max(0, Math.trunc(input.count || 0));

      return result;
    },
    {},
  );

  for (const detail of transaction.details || []) {
    const expectedCount = Math.max(0, Math.trunc(detail.count || 0));
    const actualCount = countByDetailId[getDetailId(detail)] || 0;

    if (actualCount > expectedCount) {
      throw new Error(
        'Fixed asset owner record count must not exceed detail count',
      );
    }
  }
};

const getDepreciationInputs = (transaction: ITransactionDocument) => {
  return (transaction.details || []).reduce<TFxaOwnerRecordInput[]>(
    (result, detail) => {
      if (!detail.fixedAssetId) {
        return result;
      }

      result.push({
        tempId: getDetailId(detail),
        transactionDetailId: getDetailId(detail),
        fixedAssetId: detail.fixedAssetId,
        count: detail.count,
      });

      return result;
    },
    [],
  );
};

const syncOwnerRecords = async ({
  fixedAssetsByDetailId,
  inputs,
  models,
  transaction,
  userId,
}: {
  fixedAssetsByDetailId: Map<string, TFixedAssetWithId>;
  inputs: TFxaOwnerRecordInput[];
  models: IModels;
  transaction: ITransactionDocument;
  userId: string;
}) => {
  await models.FxaOwnerRecords.deleteMany({ transactionId: transaction._id });

  const ownerInputs = inputs.filter((input) => input.ownerId);

  if (!ownerInputs.length) {
    return;
  }

  validateOwnerInputCounts(transaction, ownerInputs);

  const records = ownerInputs.map((input) => {
    const detailId = input.transactionDetailId || '';
    const fixedAsset = fixedAssetsByDetailId.get(detailId);
    const count = Math.max(1, Math.trunc(input.count || 1));

    return {
      fixedAssetId: fixedAsset?._id || input.fixedAssetId,
      code: input.code || nanoid(8),
      sequence: input.sequence,
      count,
      action: FXA_OWNER_RECORD_ACTIONS.RECEIVED,
      status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
      ownerId: input.ownerId,
      transactionId: transaction._id,
      transactionDetailId: detailId,
      createdBy: userId,
      createdAt: new Date(),
    };
  });

  await models.FxaOwnerRecords.insertMany(
    await assignMissingFxaOwnerRecordSequences(models, records),
  );
};

export const syncFxaIncomeDetails = async (
  models: IModels,
  userId: string,
  transaction: ITransactionDocument,
) => {
  validateIncomeDetails(transaction);

  const date = transaction.date || new Date();
  const categoriesById = await getCategoriesById(models, transaction);
  const existingFixedAssets = await findIncomeFixedAssets(models, transaction);
  const existingFixedAssetsByCode = await findFixedAssetsByCodes(
    models,
    transaction,
  );
  const existingByDetailId = new Map<string, TFixedAssetWithId>(
    existingFixedAssets.map((fixedAsset) => [
      fixedAsset.transactionDetailId || '',
      fixedAsset as unknown as TFixedAssetWithId,
    ]),
  );
  const existingByCode = new Map<string, TFixedAssetWithId>(
    existingFixedAssetsByCode.map((fixedAsset) => [
      fixedAsset.code || '',
      fixedAsset as unknown as TFixedAssetWithId,
    ]),
  );
  const detailIds = new Set(
    (transaction.details || []).map((detail) => getDetailId(detail)),
  );
  const removedFixedAssetIds = existingFixedAssets
    .filter(
      (fixedAsset) => !detailIds.has(fixedAsset.transactionDetailId || ''),
    )
    .map((fixedAsset) => fixedAsset._id);
  const fixedAssetsByDetailId = new Map<string, TFixedAssetWithId>();

  if (removedFixedAssetIds.length) {
    await models.FxaOwnerRecords.deleteMany({
      fixedAssetId: { $in: removedFixedAssetIds },
    });
    await models.FixedAssets.deleteMany({ _id: { $in: removedFixedAssetIds } });
  }

  for (const detail of transaction.details || []) {
    const detailId = getDetailId(detail);
    const count = Math.max(0, Math.trunc(detail.count || 0));

    if (!count) {
      continue;
    }

    const fixedAssetCode = detail.fixedAssetCode || '';
    const existing =
      existingByDetailId.get(detailId) || existingByCode.get(fixedAssetCode);
    const category = detail.fixedAssetCategoryId
      ? categoriesById.get(detail.fixedAssetCategoryId)
      : undefined;
    const doc = buildFixedAssetDoc({
      category,
      date,
      detail,
      transaction,
      userId,
    });

    if (existing?._id) {
      // Нэг income_info code нь хэд хэдэн location/detail дээр салж ирсэн ч
      // master fixedAsset нэг л байх ёстой. Detail-ээрээ олдсон үед acquisition
      // эх сурвалжийг шинэчилж, code-оороо олдсон үед master identity-г хадгална.
      const detailOwnsAsset = existing.transactionDetailId === detailId;

      await models.FixedAssets.updateOne(
        { _id: existing._id },
        {
          $set: {
            ...(detailOwnsAsset
              ? doc
              : {
                  code: doc.code || existing.code,
                  name: doc.name || existing.name,
                  categoryId: doc.categoryId || existing.categoryId,
                  accountId: doc.accountId || existing.accountId,
                  count: doc.count,
                  currentCount: doc.currentCount,
                  originalCost: doc.originalCost,
                  depreciationMethod:
                    doc.depreciationMethod || existing.depreciationMethod,
                  annualDepreciationRate:
                    doc.annualDepreciationRate ??
                    existing.annualDepreciationRate,
                  salvageValue: doc.salvageValue ?? existing.salvageValue,
                  taxDepreciationMethod:
                    doc.taxDepreciationMethod || existing.taxDepreciationMethod,
                  taxAnnualDepreciationRate:
                    doc.taxAnnualDepreciationRate ??
                    existing.taxAnnualDepreciationRate,
                  taxSalvageValue:
                    doc.taxSalvageValue ?? existing.taxSalvageValue,
                }),
            modifiedBy: userId,
            updatedAt: new Date(),
          },
        },
      );
      detail.fixedAssetId = existing._id;
      fixedAssetsByDetailId.set(detailId, {
        ...existing,
        ...doc,
        _id: existing._id,
      });
      continue;
    }

    const fixedAsset = await models.FixedAssets.create(doc);
    detail.fixedAssetId = fixedAsset._id;
    fixedAssetsByDetailId.set(detailId, fixedAsset);

    if (fixedAssetCode) {
      existingByCode.set(fixedAssetCode, { ...doc, _id: fixedAsset._id });
    }
  }

  await syncTransactionFixedAssetIds(models, transaction);

  const ownerInputs = getOwnerInputs(transaction, fixedAssetsByDetailId);
  const depreciationInputs = getDepreciationInputs(transaction);

  await syncOwnerRecords({
    fixedAssetsByDetailId,
    inputs: ownerInputs,
    models,
    transaction,
    userId,
  });

  await syncOpeningAccumulatedDepreciation({
    date,
    fixedAssetsByDetailId,
    inputs: depreciationInputs,
    models,
    transaction,
    userId,
  });

  await models.Transactions.updateOne(
    { _id: transaction._id },
    { $set: { 'extraData.fxaOwnerRecords': ownerInputs } },
  );

  const syncedFixedAssetIds = getUniqueFxaOwnerRecordIds(
    Array.from(fixedAssetsByDetailId.values()).map(
      (fixedAsset) => fixedAsset._id,
    ),
  );

  await rebuildFixedAssetCurrentCounts(models, syncedFixedAssetIds);
};
