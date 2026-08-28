import { IFixedAsset } from '@/fixedAssets/@types/fixedAsset';
import { IFixedAssetCategory } from '@/fixedAssets/@types/fixedAssetCategory';
import { IFxaOwnerRecord } from '@/fixedAssets/@types/fxaOwnerRecord';
import {
  FXA_OWNER_RECORD_ACTIONS,
  FXA_OWNER_RECORD_STATUSES,
} from '@/fixedAssets/@types/constants';
import { IContext } from '~/connectionResolvers';

const buildAuditFields = (userId?: string, isEdit = false) => ({
  ...(isEdit
    ? { modifiedBy: userId, updatedAt: new Date() }
    : { createdBy: userId }),
});

const normalizeCount = (count?: number) => Math.max(0, Math.trunc(count || 0));

const getOwnerRecordSign = (action?: string) => {
  if (action === FXA_OWNER_RECORD_ACTIONS.RECEIVED) {
    return 1;
  }

  if (action === FXA_OWNER_RECORD_ACTIONS.HANDED_OVER) {
    return -1;
  }

  return 0;
};

const getOwnerBalance = async (
  models: IContext['models'],
  fixedAssetId: string,
  ownerId: string,
) => {
  const records = await models.FxaOwnerRecords.find({
    fixedAssetId,
    ownerId,
    status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
  }).lean();

  return records.reduce(
    (sum, record) =>
      sum + getOwnerRecordSign(record.action) * normalizeCount(record.count),
    0,
  );
};

const validateOwnerRecordInput = async (
  models: IContext['models'],
  doc: IFxaOwnerRecord,
) => {
  if (!doc.fixedAssetId) {
    throw new Error('Fixed asset is required');
  }

  if (!doc.ownerId) {
    throw new Error('Owner is required');
  }

  const count = normalizeCount(doc.count);

  if (count <= 0) {
    throw new Error('Count must be greater than zero');
  }

  if (!FXA_OWNER_RECORD_ACTIONS.ALL.includes(doc.action || '')) {
    throw new Error('Owner record action is invalid');
  }

  const fixedAsset = await models.FixedAssets.findOne({
    _id: doc.fixedAssetId,
    status: { $ne: 'deleted' },
  }).lean();

  if (!fixedAsset) {
    throw new Error('Fixed asset not found');
  }

  if (doc.action === FXA_OWNER_RECORD_ACTIONS.HANDED_OVER) {
    const balance = await getOwnerBalance(models, doc.fixedAssetId, doc.ownerId);

    if (balance < count) {
      throw new Error('Owner does not have enough fixed asset count');
    }
  }
};

const buildOwnerRecordDoc = (
  doc: IFxaOwnerRecord,
  userId?: string,
): IFxaOwnerRecord => ({
  fixedAssetId: doc.fixedAssetId,
  code: doc.code || '',
  sequence: doc.sequence,
  count: normalizeCount(doc.count),
  action: doc.action,
  status: doc.status || FXA_OWNER_RECORD_STATUSES.ACTIVE,
  ownerId: doc.ownerId,
  createdBy: userId,
  createdAt: new Date(),
});

const fixedAssetMutations = {
  async fixedAssetCategoriesAdd(
    _root: undefined,
    doc: IFixedAssetCategory,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccounts');

    return models.FixedAssetCategories.create({
      ...doc,
      status: doc.status || 'active',
      ...buildAuditFields(user?._id),
    });
  },

  async fixedAssetCategoriesEdit(
    _root: undefined,
    { _id, ...doc }: { _id: string } & IFixedAssetCategory,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccounts');

    await models.FixedAssetCategories.updateOne(
      { _id },
      {
        $set: {
          ...doc,
          status: doc.status || 'active',
          ...buildAuditFields(user?._id, true),
        },
      },
    );

    return models.FixedAssetCategories.findOne({ _id }).lean();
  },

  async fixedAssetCategoriesRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccounts');

    await models.FixedAssetCategories.updateOne(
      { _id },
      {
        $set: {
          status: 'deleted',
          ...buildAuditFields(user?._id, true),
        },
      },
    );

    return { _id };
  },

  async fixedAssetsAdd(
    _root: undefined,
    doc: IFixedAsset,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccounts');

    const category = await models.FixedAssetCategories.findOne({
      _id: doc.categoryId,
    }).lean();

    return models.FixedAssets.create({
      ...doc,
      status: doc.status || 'active',
      depreciationMethod:
        doc.depreciationMethod || category?.depreciationMethod,
      usefulLife: doc.usefulLife ?? category?.defaultUsefulLife,
      salvageValue: doc.salvageValue ?? category?.defaultSalvageValue,
      taxDepreciationMethod:
        doc.taxDepreciationMethod || category?.taxDepreciationMethod,
      taxUsefulLife: doc.taxUsefulLife ?? category?.defaultTaxUsefulLife,
      taxSalvageValue: doc.taxSalvageValue ?? category?.defaultTaxSalvageValue,
      ...buildAuditFields(user?._id),
    });
  },

  async fixedAssetsEdit(
    _root: undefined,
    { _id, ...doc }: { _id: string } & IFixedAsset,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccounts');

    await models.FixedAssets.updateOne(
      { _id },
      {
        $set: {
          ...doc,
          status: doc.status || 'active',
          ...buildAuditFields(user?._id, true),
        },
      },
    );

    return models.FixedAssets.findOne({ _id }).lean();
  },

  async fixedAssetsRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccounts');

    await models.FixedAssets.updateOne(
      { _id },
      {
        $set: {
          status: 'deleted',
          ...buildAuditFields(user?._id, true),
        },
      },
    );

    return { _id };
  },

  async fixedAssetOwnerRecordsAdd(
    _root: undefined,
    doc: IFxaOwnerRecord,
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccounts');
    await validateOwnerRecordInput(models, doc);

    return models.FxaOwnerRecords.create(buildOwnerRecordDoc(doc, user?._id));
  },

  async fixedAssetOwnerRecordsTransfer(
    _root: undefined,
    {
      fixedAssetId,
      code,
      sequence,
      count,
      fromOwnerId,
      toOwnerId,
    }: {
      fixedAssetId: string;
      code?: string;
      sequence?: number;
      count: number;
      fromOwnerId: string;
      toOwnerId: string;
    },
    { models, user, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccounts');

    if (fromOwnerId === toOwnerId) {
      throw new Error('Transfer owners must be different');
    }

    const handOverDoc = {
      fixedAssetId,
      code: code || '',
      sequence,
      count,
      action: FXA_OWNER_RECORD_ACTIONS.HANDED_OVER,
      ownerId: fromOwnerId,
      status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
    };

    await validateOwnerRecordInput(models, handOverDoc);

    const docs = [
      buildOwnerRecordDoc(handOverDoc, user?._id),
      buildOwnerRecordDoc(
        {
          fixedAssetId,
          code: code || '',
          sequence,
          count,
          action: FXA_OWNER_RECORD_ACTIONS.RECEIVED,
          ownerId: toOwnerId,
          status: FXA_OWNER_RECORD_STATUSES.ACTIVE,
        },
        user?._id,
      ),
    ];

    return models.FxaOwnerRecords.insertMany(docs);
  },

  async fixedAssetOwnerRecordsRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('manageAccounts');
    await models.FxaOwnerRecords.deleteOne({ _id });

    return { _id };
  },
};

export default fixedAssetMutations;
