import { IContext } from '../../../connectionResolver';

const assetCategoriesQueries = {
  async assetCategories(
    _root,
    {
      parentId,
      searchValue,
      status,
      withKbOnly
    }: {
      parentId: string;
      searchValue: string;
      status: string;
      withKbOnly: boolean;
    },
    { commonQuerySelector, models }: IContext
  ) {
    const filter: any = commonQuerySelector;

    filter.status = { $nin: ['disabled', 'archived'] };

    if (status && status !== 'active') {
      filter.status = status;
    }

    if (parentId) {
      filter.parentId = parentId;
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    if (withKbOnly) {
      const assetsWithKb = await models.Assets.find(
        { 'kbArticleIds.0': { $exists: true } },
        { categoryId: 1 }
      );
      const categoryIds = assetsWithKb
        .filter(asset => asset.categoryId)
        .map(asset => asset.categoryId);

      filter._id = { $in: categoryIds };
    }

    return models.AssetCategories.find(filter)
      .sort({ order: 1 })
      .lean();
  },
  assetCategoryDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.AssetCategories.findOne({ _id }).lean();
  },
  assetCategoriesTotalCount(_root, _params, { models }: IContext) {
    return models.AssetCategories.find().countDocuments();
  }
};

export default assetCategoriesQueries;
