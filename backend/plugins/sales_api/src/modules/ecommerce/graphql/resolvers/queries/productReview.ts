import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

export const productReviewQueries = {
  productReview: async (
    _root,
    params,
    { models: { ProductReview } }: IContext,
  ) => {
    const { productId } = params;

    const reviews = await ProductReview.find({ productId }).lean();

    if (!reviews.length) {
      return {
        productId,
        average: 0,
        length: 0,
      };
    }

    const average =
      reviews.reduce((sum, cur) => sum + (cur.review || 0), 0) / reviews.length;

    return {
      productId,
      average,
      length: reviews.length,
    };
  },

  productReviews: async (
    _root,
    params,
    { models: { ProductReview } }: IContext,
  ) => {
    const { customerId, productIds, ...paginationArgs } = params;

    const filter: Record<string, any> = {};

    if (customerId) {
      filter.customerId = customerId;
    }

    if (productIds) {
      filter.productId = { $in: productIds };
    }

    const result = await cursorPaginate({
      model: ProductReview,
      query: filter,
      params: paginationArgs,
    });

    return result.list;
  },
};

export default productReviewQueries;
