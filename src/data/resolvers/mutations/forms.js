import { Forms } from '../../../db/models';

export default {
  /**
   * Create a new form
   * @param {Object} root
   * @param {Object} doc - Form object
   * @param {string} doc.title - Form title
   * @param {string} doc.description - Form description
   * @param {Object} doc.user - The user who created this form
   * @return {Promise} return Promise resolving Form document
   * @throws {Error} throws Error('Login required') if user is not logged in
   */
  formsAdd(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Forms.createForm(doc, user);
  },

  /**
   * Update form data
   * @param {Object} root
   * @param {Object} object2 - Form object
   * @param {string} object2._id - Form id
   * @param {string} object2.title - Form title
   * @param {string} object2.description - Form description
   * @param {Object} object3 - The middleware data
   * @param {Object} object3.user - The user who is making this action
   * @return {Promise} return Promise resolving Form document
   * @throws {Error} throws Error('Login required') if user is not logged in
   */
  formsEdit(root, { _id, ...doc }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Forms.updateForm(_id, doc);
  },

  /**
   * Remove a form
   * @param {Object} root
   * @param {string} object2 - Graphql input data
   * @param {string} object2._id - Form id
   * @param {Object} object3 - The middleware data
   * @param {Object} object3.user - The user making this action
   * @return {Promise}
   * @throws {Error} throws Error('Login required') if user is not logged in
   */
  formsRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Forms.removeForm(_id);
  },

  /**
   * Duplicates the form and its fields
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {string} object2._id - Form id
   * @param {Object} object3 - Middleware data
   * @param {Object} object3.user - The user making this action
   * @return {Promise} return Promise resolving the new duplication Form document
   * @throws {Error} throws Error('Login required') if user is not logged in
   */
  formsDuplicate(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Forms.duplicate(_id);
  },
};
