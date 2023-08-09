import { IContext } from '../../../connectionResolver';

const productreviewMutations = {
  productreviewAdd: async (
    _root,
    params,
    { models: { ProductReview } }: IContext
  ) => {
    const { productId, customerId, review } = params;
    const added = await ProductReview.createProductReview({
      productId,
      customerId,
      review: review || 0
    });
    return added;
  },
  productreviewUpdate: async (
    _root,
    params,
    { models: { ProductReview } }: IContext
  ) => {
    const { _id, productId, customerId, review } = params;
    const updated = await ProductReview.updateProductReview(_id, {
      productId,
      customerId,
      review: review || 0
    });
    return updated;
  },
  productreviewRemove: async (
    _root,
    params,
    { models: { ProductReview } }: IContext
  ) => {
    const { _id } = params;
    const removed = await ProductReview.removeProductReview(_id);
    return removed;
  }
};

export default productreviewMutations;
