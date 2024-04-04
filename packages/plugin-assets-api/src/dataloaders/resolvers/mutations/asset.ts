import { checkPermission } from '@erxes/api-utils/src';
import { IAsset, IAssetDocument } from '../../../common/types/asset';
import { IContext } from '../../../connectionResolver';
import {
  MODULE_NAMES,
  putCreateLog,
  putDeleteLog,
  putUpdateLog
} from '../../../logUtils';
import { generateCommonAssetFilter } from '../queries/asset';

interface IAssetsEdit extends IAsset {
  _id: string;
}

const assetMutations = {
  async assetsAdd(
    _root,
    doc: IAsset,
    { user, docModifier, models, subdomain }: IContext
  ) {
    const asset = await models.Assets.createAsset(docModifier(doc));

    await putCreateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ASSET,
        newData: {
          ...doc,
          categoryId: asset.categoryId,
          customFieldsData: asset.customFieldsData
        },
        object: asset
      },
      user
    );

    return asset;
  },

  /**
   * Edits a asset
   * @param {string} param2._id Asset id
   * @param {Object} param2.doc Asset info
   */
  async assetsEdit(
    _root,
    { _id, ...doc }: IAssetsEdit,
    { user, models, subdomain }: IContext
  ) {
    const asset = await models.Assets.getAssets({ _id });
    const updated = await models.Assets.updateAsset(_id, doc);

    await putUpdateLog(
      models,
      subdomain,
      {
        type: MODULE_NAMES.ASSET,
        object: asset,
        newData: { ...doc, customFieldsData: updated.customFieldsData },
        updatedDocument: updated
      },
      user
    );

    return updated;
  },
  async assetsRemove(
    _root,
    { assetIds }: { assetIds: string[] },
    { user, models, subdomain }: IContext
  ) {
    const assets: IAssetDocument[] = await models.Assets.find({
      _id: { $in: assetIds }
    }).lean();

    const response = await models.Assets.removeAssets(assetIds);

    for (const asset of assets) {
      await putDeleteLog(
        models,
        subdomain,
        { type: MODULE_NAMES.ASSET, object: asset },
        user
      );
    }

    return response;
  },

  async assetsMerge(
    _root,
    { assetIds, assetFields }: { assetIds: string[]; assetFields: IAsset },
    { models }: IContext
  ) {
    return await models.Assets.mergeAssets(assetIds, { ...assetFields });
  },

  async assetsAssignKbArticles(_root, args, { models }: IContext) {
    const { ids, articleIds, action } = args;

    if (!ids?.length) {
      throw new Error('Please provide some IDs to assign articles');
    }

    if (action === 'add') {
      return await models.Assets.updateMany(
        { _id: { $in: ids } },
        {
          $addToSet: { kbArticleIds: articleIds }
        }
      );
    }
    return await models.Assets.updateMany(
      { _id: { $in: ids } },
      { $pull: { kbArticleIds: { $in: articleIds } } }
    );
  }
};

checkPermission(assetMutations, 'assetsAdd', 'manageAssets');
checkPermission(assetMutations, 'assetsEdit', 'manageAssets');
checkPermission(assetMutations, 'assetsRemove', 'manageAssets');
checkPermission(assetMutations, 'assetsMerge', 'assetsMerge');
checkPermission(
  assetMutations,
  'assetsAssignKbArticles',
  'assetsAssignKbArticles'
);

export default assetMutations;
