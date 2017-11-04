import { Brands } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const brandQueries = {
  /**
   * Brands list
   * @param {Object} args
   * @param {Integer} args.limit
   * @return {Promise} sorted brands list
   */
  brands(root, { limit }) {
    const brands = Brands.find({});
    const sort = { createdAt: -1 };

    if (limit) {
      return brands.sort(sort).limit(limit);
    }

    return brands.sort(sort);
  },

  /**
   * Get one brand
   * @param {Object} args
   * @param {String} args._id
   * @return {Promise} found brand
   */
  brandDetail(root, { _id }) {
    return Brands.findOne({ _id });
  },

  /**
   * Get all brands count. We will use it in pager
   * @return {Promise} total count
   */
  brandsTotalCount() {
    return Brands.find({}).count();
  },
};

moduleRequireLogin(brandQueries);

export default brandQueries;
