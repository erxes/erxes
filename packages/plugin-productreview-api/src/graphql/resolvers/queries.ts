import { requireLogin } from '@erxes/api-utils/src/permissions';

import { Productreviews } from '../../models';

const productreviewQueries = {
  productreviews(_root, productId) {
    return Productreviews.find(productId);
  },
  productreviewsTotalCount(_root, _args) {
    return Productreviews.find({}).countDocuments();
  }
};

// requireLogin(productreviewQueries, 'productreviews');
// requireLogin(productreviewQueries, 'productreviewsTotalCount');

export default productreviewQueries;
