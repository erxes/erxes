import { IContext } from '../../../connectionResolver';
import { models } from '../../../connectionResolver';
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
    const { customerId, productIds, skip, limit } = params;

    const filter: any = {};

    if (customerId) {
      filter.customerId = customerId;
    }

    if (productIds) {
      filter.productId = productIds;
    }

    return ProductReview.find(filter)
      .skip(skip || 0)
      .limit(limit || 20);
  },
};
export default productreviewQueries;
