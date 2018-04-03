import { Products } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const productQueries = {
  /**
   * Products list
   * @param {Object} args
   * @param {Strign} args.type
   * @param {Object} args.pagintationArgs - Query params
   * @return {Promise} filtered product objects by type
   */
  products(root, { type, searchValue, ...pagintationArgs }) {
    let filter = {};

    if (type) filter.type = type;

    // search =========
    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, 'i');
    }

    return paginate(Products.find(filter), pagintationArgs);
  },

  /**
   * Get all products count. We will use it in pager
   * @return {Promise} total count
   */
  productsTotalCount(root, { type }) {
    const filter = {};

    if (type) filter.type = type;

    return Products.find(filter).count();
  },
};

moduleRequireLogin(productQueries);

export default productQueries;
