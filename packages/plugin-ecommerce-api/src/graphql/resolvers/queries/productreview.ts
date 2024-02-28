import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
const productreviewQueries = {
  productreview: async (
    _root,
    params,
    { models: { ProductReview } }: IContext,
  ) => {
    const { productId } = params;
    const reviews = await ProductReview.find({ productId }).lean();
    if (!reviews.length)
      return {
        productId,
        average: 0,
        length: 0,
      };

    return {
      productId,
      average:
        reviews.reduce((sum, cur) => sum + cur.review, 0) / reviews.length,
      length: reviews.length,
      reviews,
    };
  },
  productreviews: async (
    _root,
    params,
    { models: { ProductReview } }: IContext,
  ) => {
    const { customerId, productIds, ...pagintationArgs } = params;

    const filter: any = {};

    if (customerId) {
      filter.customerId = customerId;
    }

    if (productIds) {
      filter.productId = { $in: productIds };
    }

    return paginate(ProductReview.find(filter), pagintationArgs);
  },
};
export default productreviewQueries;
