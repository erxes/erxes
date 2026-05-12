import { escapeRegExp } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { IProductCategoryDocument } from '~/modules/posclient/@types/products';
import { PRODUCT_STATUSES } from '~/modules/posclient/db/definitions/constants';
import poscProduct from './poscProduct';

export default {
  cpPosProductCategory: {
    productCount: async (
      category: IProductCategoryDocument,
      _args: undefined,
      { models }: IContext,
    ) => {
      const product_category_ids = await models.ProductCategories.find(
        { order: { $regex: new RegExp(`^${escapeRegExp(category.order)}`) } },
        { _id: 1 },
      );
      return models.Products.countDocuments({
        categoryId: { $in: product_category_ids },
        status: { $ne: PRODUCT_STATUSES.DELETED },
      });
    },
  },
  cpPoscProduct: poscProduct,
};
