import { Forms, FormFields } from '../../../db/models';

export default {
  /**
   * Create a new form
   * @param {Object} root
   * @param {Object} doc - Form object
   * @param {string} doc.title - Form title
   * @param {string} doc.description - Form description
   * @param {Object} doc.user - The user who created this form
   * @return {Promise} returns the form promise
   * @throws {Error} throws error if user is not logged in
   */
  formsCreate(root, doc, { user }) {
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
   * @return {Promise} returns null
   * @throws {Error} throws error if user is not logged in
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
   * @return {Promise} null
   * @throws {Error} throws error if user is not logged in
   */
  formsRemove(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Forms.removeForm(_id);
  },

  /**
   * Adds a form field to the form
   * @param {Object} root
   * @param {Object} object2 - Form object
   * @param {string} object2.formId - Form id
   * @param {string} object2.type - Form field type
   * @param {string} object2.validation - Form field data validation type
   * @param {string} object2.text - Form field text
   * @param {string} object2.description - Form field description
   * @param {Array} object2.options - Form field options
   * @param {Boolean} object2.isRequired - Shows whether the field is required or not
   * @param {Object} object3 - Middleware data
   * @param {Object} object3.user - The user making this action
   * @return {Promise} return Promise(null)
   * @throws {Error} throws error if user is not logged in
   */
  formsAddFormField(root, { formId, ...formFieldDoc }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return FormFields.createFormField(formId, formFieldDoc);
  },

  /**
  * @param {Object} root
  * @param {string} object2 - Form field object
  * @param {string} object2._id - Form field id
  * @param {string} object2.type - Form field type
  * @param {string} object2.validation - Form field data validation type
  * @param {string} object2.text - Form field text
  * @param {string} object2.description - Form field description
  * @param {Array} object2.options - Form field options for select type
  * @param {Boolean} object2.isRequired
  * @param {Object} object3 - Middleware data
  * @param {Object} object3.user - The user making this action
  * @return {Promise} return Promise(null)
  * @throws {Error} throws error if user is not logged in
  */
  formsEditFormField(root, { _id, ...formFieldDoc }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return FormFields.updateFormField(_id, formFieldDoc);
  },

  /**
   * Remove a form field
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {string} object2._id - Form field id
   * @param {Object} object3 - Middleware data
   * @param {Object} object3.user - The user making this action
   * @return {Promise} null
   * @throws {Error} throws error if user is not logged in
   */
  formsRemoveFormField(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return FormFields.removeFormField(_id);
  },

  /**
   * Rearranges order based on given value
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {Object} object2.orderDics - Dictionary containing order values for form fields
   * @param {Object} object3 - The middleware data
   * @param {Object} object3.user - The user making this action
   * @return {Promise} null
   * @throws {Error} throws error if user is not logged in
   */
  formsUpdateFormFieldsOrder(root, { orderDics }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Forms.updateFormFieldsOrder(orderDics);
  },

  /**
   * Duplicates the form and its fields
   * @param {Object} root
   * @param {Object} object2 - Graphql input data
   * @param {string} object2._id - Form id
   * @param {Object} object3 - Middleware data
   * @param {Object} object3.user - The user making this action
   * @return {Promise} returns form object
   * @throws {Error} throws error if user is not logged in
   */
  formsDuplicate(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Forms.duplicate(_id);
  },
};
