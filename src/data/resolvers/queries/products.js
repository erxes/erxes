import { Products } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const productQueries = {
  /**
   * Products list
   * @param {Object} args
   * @param {Strign} args.type
   * @return {Promise} filtered product objects by type
   */
  products(root, { type }) {
    return Products.find({ type });
  },
};

moduleRequireLogin(productQueries);

export default productQueries;
