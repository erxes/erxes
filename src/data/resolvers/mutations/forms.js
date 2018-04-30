import { Forms } from '../../../db/models';
import { requireAdmin } from '../../permissions';

const formMutations = {
  /**
   * Create a new form
   * @param {Object} root
   * @param {Object} doc - Form object
   * @param {string} doc.title - Form title
   * @param {string} doc.description - Form description
   * @param {string} doc.buttonText - Form submit button text
   * @param {string} doc.themeColor - Form theme color
   * @param {Object} doc.callout - Form's callout component detail
   * @param {Object} doc.user - The user who created this form
   * @return {Promise} return Promise resolving Form document
   */
  formsAdd(root, doc, { user }) {
    return Forms.createForm(doc, user);
  },

  /**
   * Update form data
   * @param {Object} root
   * @param {Object} object2 - Form object
   * @param {string} object2._id - Form id
   * @param {string} object2.title - Form title
   * @param {string} object2.description - Form description
   * @param {string} object2.buttonText - Form submit button text
   * @param {string} object2.themeColor - Form theme color
   * @param {Object} object2.callout - Form's callout component detail
   * @param {Object} object3 - The middleware data
   * @param {Object} object3.user - The user who is making this action
   * @return {Promise} return Promise resolving Form document
   */
  formsEdit(root, { _id, ...doc }) {
    return Forms.updateForm(_id, doc);
  },
};

requireAdmin(formMutations, 'formsAdd');
requireAdmin(formMutations, 'formsEdit');

export default formMutations;
