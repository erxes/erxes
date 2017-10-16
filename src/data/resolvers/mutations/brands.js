import { Brands } from '../../../db/models';

export default {
  /**
   * Create new brand
   * @param {Object} doc - brand fields
   * @return {Promise} brand object
   */
  brandsAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    return Brands.createBrand({ userId: user._id, ...doc });
  },

  /**
   * Update brand
   * @param {String} _id - brand id
   * @param {Object} fields - brand fields
   * @return {Promise} brand object
   */
  brandsEdit(root, { _id, ...fields }, { user }) {
    if (!user) throw new Error('Login required');

    return Brands.updateBrand(_id, fields);
  },

  /**
   * Delete brand
   * @param {String} _id - brand id
   * @return {String}
   */
  brandsRemove(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    return Brands.removeBrand(_id);
  },

  /**
   * Update brands email config
   * @param {String} _id - brand id
   * @param {Object} emailConfig - brand email config fields
   * @return {Promise} brand object
   */
  async brandsConfigEmail(root, { _id, emailConfig }, { user }) {
    if (!user) throw new Error('Login required');

    return Brands.updateEmailConfig(_id, emailConfig);
  },
};
