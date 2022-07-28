import { requireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const productreviewQueries = {
  productreviews: async (
    _root,
    params,
    { models: { ProductReview } }: IContext
  ) => {
    const { productId } = params;
    return ProductReview.getAllProductReview(productId);
  }
};
//requireLogin(productreviewQueries, 'productreviews');
export default productreviewQueries;
