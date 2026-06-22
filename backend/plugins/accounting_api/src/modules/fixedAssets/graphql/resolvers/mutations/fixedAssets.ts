import { IFixedAsset } from '@/fixedAssets/@types/fixedAsset';
import {
  IFixedAssetAccounts,
  IFixedAssetCategory,
} from '@/fixedAssets/@types/fixedAssetCategory';
import { IContext } from '~/connectionResolvers';

const buildAuditFields = (userId?: string, isEdit = false) => ({
  ...(isEdit ? { modifiedBy: userId, updatedAt: new Date() } : { createdBy: userId }),
});

const hasAccountValues = (accounts?: IFixedAssetAccounts) =>
  Object.values(accounts || {}).some(Boolean);

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
      accounts: hasAccountValues(doc.accounts) ? doc.accounts : category?.accounts,
      depreciationMethod:
        doc.depreciationMethod || category?.depreciationMethod,
      usefulLife: doc.usefulLife ?? category?.defaultUsefulLife,
      salvageValue: doc.salvageValue ?? category?.defaultSalvageValue,
      taxDepreciationMethod:
        doc.taxDepreciationMethod || category?.taxDepreciationMethod,
      taxUsefulLife: doc.taxUsefulLife ?? category?.defaultTaxUsefulLife,
      taxSalvageValue:
        doc.taxSalvageValue ?? category?.defaultTaxSalvageValue,
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
};

export default fixedAssetMutations;
