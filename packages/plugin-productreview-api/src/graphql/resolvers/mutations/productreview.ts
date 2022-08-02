import { requireLogin } from '@erxes/api-utils/src/permissions';
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
      review
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
      review
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
// requireLogin(productreviewMutations, 'productreviewsAdd');

export default productreviewMutations;
