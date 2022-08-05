import { requireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import { models } from '../../../connectionResolver';
const productreviewQueries = {
  productreviews: async (
    _root,
    params,
    { models: { ProductReview } }: IContext
  ) => {
    const { productId } = params;
    return ProductReview.getProductReview(productId);
  },
  allProductreviews: async (_root, params) => {
    const { customerId } = params;
    return models?.ProductReview.getAllProductReview(customerId);
  }
};
//requireLogin(productreviewQueries, 'productreviews');
export default productreviewQueries;
