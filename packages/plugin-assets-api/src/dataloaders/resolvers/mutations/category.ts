import { IContext } from '../../../connectionResolver';
import {
  putCreateLog,
  MODULE_NAMES,
  putUpdateLog,
  putDeleteLog
} from '../../../logUtils';
import { IAssetCategories } from '../../../common/types/asset';
import { checkPermission } from '@erxes/api-utils/src';

interface IAssetCategoryEdit extends IAssetCategories {
  _id: string;
}

const assetCategoriesMutations = {
  async assetCategoryAdd(
    _root,
    doc: IAssetCategories,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const assetCategory = await models.AssetCategories.assetCategoryAdd(
      docModifier(doc)
    );

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ASSET_CATEGORIES,
        newData: { ...doc, order: assetCategory.order },
        object: assetCategory
      },
      user
    );

    return assetCategory;
  },

  async assetCategoryEdit(
    _root,
    { _id, ...doc }: IAssetCategoryEdit,
    { user, models, subdomain }: IContext
  ) {
    const assetCategory = await models.AssetCategories.getAssetCategory({
      _id
    });
    const updated = await models.AssetCategories.updateAssetCategory(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ASSET_CATEGORIES,
        object: assetCategory,
        newData: doc,
        updatedDocument: updated
      },
      user
    );

    return updated;
  },

  async assetCategoryRemove(
    _root,
    { _id }: { _id: string },
    { user, models, subdomain }: IContext
  ) {
    const assetCategory = await models.AssetCategories.getAssetCategory({
      _id
    });
    const removed = await models.AssetCategories.assetCategoryRemove(_id);

    await putDeleteLog(
      models,
      subdomain,
      { type: MODULE_NAMES.ASSET_CATEGORIES, object: assetCategory },
      user
    );

    return removed;
  }
};

checkPermission(assetCategoriesMutations, 'assetCategoryAdd', 'manageAssets');
checkPermission(assetCategoriesMutations, 'assetCategoryEdit', 'manageAssets');
checkPermission(
  assetCategoriesMutations,
  'assetCategoryRemove',
  'manageAssets'
);
export default assetCategoriesMutations;
