import { Companies } from '../../../db/models';

export default {
  /**
   * Create new company
   * @return {Promise} company object
   */
  companiesAdd(root, doc, { user }) {
    if (!user) throw new Error('Login required');

    return Companies.createCompany(doc);
  },

  /**
   * Update company
   * @return {Promise} company object
   */
  async companiesEdit(root, { _id, ...doc }, { user }) {
    if (!user) throw new Error('Login required');

    return Companies.updateCompany(_id, doc);
  },

  /**
   * Delete company
   * @return {Promise}
   */
  async companiesRemove(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    return Companies.removeCompany(_id);
  },
};
