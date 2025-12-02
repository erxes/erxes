import { IContext } from '~/connectionResolvers';

const productReviewMutations = {
  productReviewAdd: async (
    _root,
    params,
    { models: { ProductReview } }: IContext,
  ) => {
    const { productId, customerId, review, description, info } = params;
    const added = await ProductReview.createProductReview({
      productId,
      customerId,
      review: review || 0,
      description,
      info,
    });
    return added;
  },
  productReviewUpdate: async (
    _root,
    params,
    { models: { ProductReview } }: IContext,
  ) => {
    const { _id, productId, customerId, review, description, info } = params;
    const updated = await ProductReview.updateProductReview(_id, {
      productId,
      customerId,
      review: review || 0,
      description,
      info,
    });
    return updated;
  },
  productReviewRemove: async (
    _root,
    params,
    { models: { ProductReview } }: IContext,
  ) => {
    const { _id } = params;
    const removed = await ProductReview.removeProductReview(_id);
    return removed;
  },
};

export default productReviewMutations;
