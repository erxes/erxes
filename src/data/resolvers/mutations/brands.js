import { Brands } from '../../../db/models';

export default {
  /**
   * Create new brand
   * @return {Promise} brand object
   */
  brandsAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    if (!doc.code) throw new Error('Code is required field');

    return Brands.createBrand({ userId: user._id, ...doc });
  },

  /**
   * Update brand
   * @return {Promise} brand object
   */
  async brandsEdit(root, { _id, ...fields }, { user }) {
    if (!user) throw new Error('Login required');

    await Brands.update({ _id }, { ...fields });
    return Brands.findOne({ _id });
  },

  /**
   * Delete brand
   * @return {Promise}
   */
  async brandsRemove(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    const brandObj = await Brands.findOne({ _id });

    if (!brandObj) throw new Error(`Brand not found with id ${_id}`);

    return brandObj.remove();
  },

  /**
   * Update brands email config
   * @return {Promise} brand object
   */
  async brandsConfigEmail(root, { _id, emailConfig }, { user }) {
    if (!user) throw new Error('Login required');

    await Brands.update({ _id }, { emailConfig });
    return Brands.findOne({ _id });
  },
};
