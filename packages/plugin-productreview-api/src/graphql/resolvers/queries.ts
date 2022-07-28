import { requireLogin } from '@erxes/api-utils/src/permissions';

import { Productreviews } from '../../models';

const productreviewQueries = {
  productreviews(_root, productId) {
    return Productreviews.find(productId);
  }
};

requireLogin(productreviewQueries, 'productreviews');

export default productreviewQueries;
