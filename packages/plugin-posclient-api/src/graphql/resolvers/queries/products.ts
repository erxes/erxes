import { ProductCategories, Products } from '../../../models/Products';
import { IProductCategoryDocument } from '../../../models/definitions/products';
import { PRODUCT_STATUSES } from '../../../models/definitions/constants';
import { escapeRegExp, paginate } from '../../utils/commonUtils';
import { IContext } from '../../types';

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

const generateFilter = async ({
  type,
  categoryId,
  searchValue
}: IProductParams) => {
  const filter: any = { status: { $ne: PRODUCT_STATUSES.DELETED } };

  if (type) {
    filter.type = type;
  }

  if (categoryId) {
    const category = await ProductCategories.getProductCategory({
      _id: categoryId
    });

    const relatedCategoryIds = await ProductCategories.find(
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
    models,
    { type, categoryId, searchValue, ...paginationArgs }: IProductParams
  ) {
    const filter = await generateFilter({ type, categoryId, searchValue });

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
    models,
    { type, categoryId, searchValue }: IProductParams
  ) {
    const filter = await generateFilter({ type, categoryId, searchValue });

    return models.Products.find(filter).countDocuments();
  },

  async poscProductCategories(
    _root,
    models,
    { parentId, searchValue, excludeEmpty }: ICategoryParams,
    {}: IContext
  ) {
    const filter = generateFilterCat({ parentId, searchValue });
    const categories = await ProductCategories.find(filter).sort({ order: 1 });
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
    models,
    { parentId, searchValue }: { parentId: string; searchValue: string }
  ) {
    const filter = await generateFilterCat({ parentId, searchValue });
    return models.ProductCategories.find(filter).countDocuments();
  },

  poscProductDetail(_root, models, { _id }: { _id: string }) {
    return models.Products.findOne({ _id }).lean();
  },

  poscProductCategoryDetail(_root, models, { _id }: { _id: string }) {
    return models.ProductCategories.findOne({ _id }).lean();
  }
};

export default productQueries;
