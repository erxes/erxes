import { ProductCategories, Products, Tags } from '../../../db/models';
import { TAG_TYPES } from '../../../db/models/definitions/constants';
import { checkPermission, requireLogin } from '../../permissions/wrappers';
import { IContext } from '../../types';
import { paginate } from '../../utils';

const productQueries = {
  /**
   * Products list
   */
  products(
    _root,
    {
      type,
      categoryId,
      searchValue,
      tag,
      ids,
      ...pagintationArgs
    }: {
      ids: string[];
      type: string;
      categoryId: string;
      searchValue: string;
      tag: string;
      page: number;
      perPage: number;
    },
    { commonQuerySelector }: IContext,
  ) {
    const filter: any = commonQuerySelector;

    if (type) {
      filter.type = type;
    }

    if (categoryId) {
      filter.categoryId = categoryId;
    }

    if (ids) {
      filter._id = { $in: ids };
    }

    if (tag) {
      filter.tagIds = { $in: [tag] };
    }

    // search =========
    if (searchValue) {
      const fields = [
        { name: { $in: [new RegExp(`.*${searchValue}.*`, 'i')] } },
        { code: { $in: [new RegExp(`.*${searchValue}.*`, 'i')] } },
      ];

      filter.$or = fields;
    }

    return paginate(Products.find(filter), pagintationArgs);
  },

  /**
   * Get all products count. We will use it in pager
   */
  productsTotalCount(_root, { type }: { type: string }, { commonQuerySelector }: IContext) {
    const filter: any = commonQuerySelector;

    if (type) {
      filter.type = type;
    }

    return Products.find(filter).countDocuments();
  },

  productCategories(
    _root,
    { parentId, searchValue }: { parentId: string; searchValue: string },
    { commonQuerySelector }: IContext,
  ) {
    const filter: any = commonQuerySelector;

    if (parentId) {
      filter.parentId = parentId;
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return ProductCategories.find(filter).sort({ order: 1 });
  },

  productCategoriesTotalCount(_root) {
    return ProductCategories.find().countDocuments();
  },

  productDetail(_root, { _id }: { _id: string }) {
    return Products.findOne({ _id });
  },

  productCategoryDetail(_root, { _id }: { _id: string }) {
    return ProductCategories.findOne({ _id });
  },

  async productCountByTags() {
    const counts = {};

    // Count products by tag =========
    const tags = await Tags.find({ type: TAG_TYPES.PRODUCT });

    for (const tag of tags) {
      counts[tag._id] = await Products.find({ tagIds: tag._id }).countDocuments();
    }

    return counts;
  },
};

requireLogin(productQueries, 'productsTotalCount');
checkPermission(productQueries, 'products', 'showProducts', []);
checkPermission(productQueries, 'productCategories', 'showProducts', []);
checkPermission(productQueries, 'productCountByTags', 'showProducts', []);

export default productQueries;
