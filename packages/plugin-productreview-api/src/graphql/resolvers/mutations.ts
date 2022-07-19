import {
  moduleCheckPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { Productreviews, IProductreview } from '../../models';

const productreviewMutations = {
  /**
   * Creates a new productreview
   */
  async productreviewsAdd(_root, doc: IProductreview) {
    const productreview = await Productreviews.createProductreview(doc);
    return productreview;
  }
};
// requireLogin(productreviewMutations, 'productreviewsAdd');

export default productreviewMutations;
