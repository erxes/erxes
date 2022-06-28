import { IProductCategoryDocument } from '../../../models/definitions/products';
import { PRODUCT_STATUSES } from '../../../models/definitions/constants';
import { IContext } from '../../types';
import { IModels } from '../../../connectionResolver';
import { escapeRegExp, paginate } from '@erxes/api-utils/src/core';

interface IProductParams {
  type?: string;
  categoryId?: string;
  searchValue?: string;
  page?: number;
  perPage?: number;
}

interface ICategoryParams {
  parentId: string;
  searchValue: string;
  excludeEmpty?: boolean;
}

const generateFilter = async (
  models: IModels,
  { type, categoryId, searchValue }: IProductParams
) => {
  const filter: any = { status: { $ne: PRODUCT_STATUSES.DELETED } };

  if (type) {
    filter.type = type;
  }

  if (categoryId) {
    const category = await models.ProductCategories.getProductCategory({
      _id: categoryId
    });

    const relatedCategoryIds = await models.ProductCategories.find(
      { order: { $regex: new RegExp(category.order) } },
      { _id: 1 }
    );

    filter.categoryId = { $in: relatedCategoryIds };
  }

  // search =========
  if (searchValue) {
    const regex = new RegExp(`.*${escapeRegExp(searchValue)}.*`, 'i');

    filter.$or = [{ name: { $in: [regex] } }, { code: { $in: [regex] } }];
  }
  return filter;
};

const generateFilterCat = ({ parentId, searchValue }) => {
  const filter: any = {};

  if (parentId) {
    filter.parentId = parentId;
  }

  if (searchValue) {
    filter.name = new RegExp(`.*${searchValue}.*`, 'i');
  }

  return filter;
};

const productQueries = {
  async poscProducts(
    _root,
    { type, categoryId, searchValue, ...paginationArgs }: IProductParams,
    { models }: IContext
  ) {
    const filter = await generateFilter(models, {
      type,
      categoryId,
      searchValue
    });

    return paginate(
      models.Products.find(filter)
        .sort('code')
        .lean(),
      paginationArgs
    );
  },

  /**
   * Get all products count. We will use it in pager
   */
  async poscProductsTotalCount(
    _root,
    { type, categoryId, searchValue }: IProductParams,
    { models }: IContext
  ) {
    const filter = await generateFilter(models, {
      type,
      categoryId,
      searchValue
    });

    return models.Products.find(filter).countDocuments();
  },

  async poscProductCategories(
    _root,
    { parentId, searchValue, excludeEmpty }: ICategoryParams,
    { models }: IContext
  ) {
    const filter = generateFilterCat({ parentId, searchValue });
    const categories = await models.ProductCategories.find(filter).sort({
      order: 1
    });
    const list: IProductCategoryDocument[] = [];

    if (excludeEmpty) {
      for (const cat of categories) {
        const product = await models.Products.findOne({
          categoryId: cat._id,
          status: { $ne: PRODUCT_STATUSES.DELETED }
        });

        if (product) {
          list.push(cat);
        }
      }

      return list;
    }

    return categories;
  },

  async poscProductCategoriesTotalCount(
    _root,
    { parentId, searchValue }: { parentId: string; searchValue: string },
    { models }: IContext
  ) {
    const filter = await generateFilterCat({ parentId, searchValue });
    return models.ProductCategories.find(filter).countDocuments();
  },

  poscProductDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Products.findOne({ _id }).lean();
  },

  poscProductCategoryDetail(
    _root,
    { _id }: { _id: string },
    { models }: IContext
  ) {
    return models.ProductCategories.findOne({ _id }).lean();
  }
};

export default productQueries;
