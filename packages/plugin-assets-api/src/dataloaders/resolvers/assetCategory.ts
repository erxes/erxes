import { ASSET_STATUSES } from '../../common/constant/asset';
import { IAssetCategoriesDocument } from '../../common/types/asset';
import { IContext } from '../../connectionResolver';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.AssetCategories.findOne({ _id });
  },

  async isRoot(category: IAssetCategoriesDocument, {}) {
    return category.parentId ? false : true;
  },

  async assetCount(
    category: IAssetCategoriesDocument,
    {},
    { models }: IContext
  ) {
    const order = category.order.slice(-1)
      ? category.order.replace(/\\/g, '\\\\')
      : category.order;

    const asset_category_ids = await models.AssetCategories.find(
      { order: { $regex: new RegExp(order) } },
      { _id: 1 }
    );

    return models.Assets.countDocuments({
      categoryId: { $in: asset_category_ids },
      status: { $ne: ASSET_STATUSES.DELETED },
    });
  },
};
