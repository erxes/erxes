import { IContext } from '../../../connectionResolver';

const assetCategoriesQueries = {
  assetCategories(
    _root,
    { parentId, searchValue, status }: { parentId: string; searchValue: string; status: string },
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
