import { Brands } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { paginate } from './utils';

const brandQueries = {
  /**
   * Brands list
   * @param {Object} args - Query params
   * @return {Promise} sorted brands list
   */
  brands(root, args) {
    const brands = paginate(Brands.find({}), args);
    return brands.sort({ createdAt: -1 });
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

  /**
  * Get last brand
  */
  brandsGetLast() {
    return Brands.findOne({}).sort({ createdAt: -1 });
  },
};

moduleRequireLogin(brandQueries);

export default brandQueries;
