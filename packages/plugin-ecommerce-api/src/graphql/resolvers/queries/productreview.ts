import { IContext } from '../../../connectionResolver';
import { models } from '../../../connectionResolver';
const productreviewQueries = {
  productreview: async (
    _root,
    params,
    { models: { ProductReview } }: IContext
  ) => {
    const { productId } = params;
    const reviews = await ProductReview.find({ productId }).lean();
    if (!reviews.length)
      return {
        productId,
        average: 0,
        length: 0
      };

    return {
      productId,
      average:
        reviews.reduce((sum, cur) => sum + cur.review, 0) / reviews.length,
      length: reviews.length
    };
  },
  productreviews: async (
    _root,
    params,
    { models: { ProductReview } }: IContext
  ) => {
    const { customerId, productIds } = params;
    return ProductReview.find({ customerId, productId: { $in: productIds } });
  }
};
export default productreviewQueries;
