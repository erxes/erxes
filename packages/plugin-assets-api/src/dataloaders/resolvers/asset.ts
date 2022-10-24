import { ASSET_STATUSES } from '../../common/constant/asset';
import { IAssetDocument } from '../../common/types/asset';
import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Assets.findOne({ _id });
  },

  category(asset: IAssetDocument, _, { dataLoaders }: IContext) {
    return (asset.categoryId && dataLoaders.assetCategories.load(asset.categoryId)) || null;
  },

  parent(asset: IAssetDocument, _, { dataLoaders }: IContext) {
    return (asset.parentId && dataLoaders.asset.load(asset.parentId)) || null;
  },

  isRoot(asset: IAssetDocument, {}) {
    return asset.parentId ? false : true;
  },

  async childAssetCount(asset: IAssetDocument, {}, { models }: IContext) {
    const asset_ids = await models.Assets.find(
      { order: { $regex: new RegExp(asset.order) } },
      { _id: 1 }
    );

    return models.Assets.countDocuments({
      parentId: { $in: asset_ids },
      status: { $ne: ASSET_STATUSES.DELETED }
    });
  },

  vendor(asset: IAssetDocument, _, { dataLoaders }: IContext) {
    return (asset.vendorId && dataLoaders.company.load(asset.vendorId)) || null;
  }
};
