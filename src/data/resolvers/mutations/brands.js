import { Brands } from '../../../db/models';
import { moduleRequireLogin, PERMISSIONS } from '../../permissions';

const brandMutations = {
  /**
   * Create new brand
   * @param {Object} doc - brand fields
   * @return {Promise} brand object
   */
  brandsAdd(root, doc, { user }) {
    return Brands.createBrand({ userId: user._id, ...doc });
  },

  /**
   * Update brand
   * @param {String} _id - brand id
   * @param {Object} fields - brand fields
   * @return {Promise} brand object
   */
  brandsEdit(root, { _id, ...fields }) {
    return Brands.updateBrand(_id, fields);
  },

  /**
   * Delete brand
   * @param {String} _id - brand id
   * @return {Promise}
   */
  brandsRemove(root, { _id }) {
    return Brands.removeBrand(_id);
  },

  /**
   * Update brands email config
   * @param {String} _id - brand id
   * @param {Object} emailConfig - brand email config fields
   * @return {Promise} updated brand object
   */
  async brandsConfigEmail(root, { _id, emailConfig }) {
    return Brands.updateEmailConfig(_id, emailConfig);
  },
};

moduleRequireLogin(brandMutations, [PERMISSIONS.ADMIN]);

export default brandMutations;
