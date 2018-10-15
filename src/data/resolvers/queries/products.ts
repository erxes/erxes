import { Products } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const productQueries = {
  /**
   * Products list
   */
  products(
    _root,
    { type, searchValue, ...pagintationArgs }: { type: string; searchValue: string; page: number; perPage: number },
  ) {
    const filter: any = {};

    if (type) {
      filter.type = type;
    }

    // search =========
    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return paginate(Products.find(filter), pagintationArgs);
  },

  /**
   * Get all products count. We will use it in pager
   */
  productsTotalCount(_root, { type }: { type: string }) {
    const filter: any = {};

    if (type) {
      filter.type = type;
    }

    return Products.find(filter).count();
  },
};

moduleRequireLogin(productQueries);

export default productQueries;
