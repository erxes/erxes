import { Forms, FormFields } from '../../../db/models';

export default {
  /**
   * Create a new form
   * @param {Object}
   * @param {String} args2.title
   * @param {String} args2.description
   * @param {String} args3.user
   * @return {Promise} returns the form
   * @throws {Error} apollo level error based on validation
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
   * @param {Object}
   * @param {String} doc._id
   * @param {String} doc.title
   * @param {String} doc.description
   * @param {String} args3.user
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
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
   * @param {Object}
   * @param {String} _id
   * @return {Promise} null
   * @throws {Error} apollo level error based on validation
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
   * @param {Object}
   * @param {String} args.formId
   * @param {String} args.type
   * @param {String} args.validation
   * @param {String} args.text
   * @param {String} args.description
   * @param {Array} args.options
   * @param {Boolean} args.isRequired
   * @return {Promise} return Promise(null)
   * @throws {Error} throws apollo error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  formsAddFormField(root, { formId, ...formFieldDoc }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return FormFields.createFormField(formId, formFieldDoc);
  },

  /**
  * @param {String} args._id form field id
  * @param {String} args.type
  * @param {String} args.validation
  * @param {String} args.text
  * @param {String} args.description
  * @param {Array} args.options
  * @param {Boolean} args.isRequired
  * @return {Promise} return Promise(null)
  * @throws {Error} throws apollo error based on validation
  * @throws {Error} throws error if user is not logged in
  */
  formsEditFormField(root, { _id, ...formFieldDoc }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return FormFields.updateFormField(_id, formFieldDoc);
  },

  /**
   * Remove a channel
   * @param {Object}
   * @param {String} _id
   * @return {Promise} null
   * @throws {Error} throws apollo error based on validation
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
   * @param {Object}
   * @param {String} args.orderDics.id
   * @param {String} args.orderDics.order
   * @return {Promise} null
   * @throws {Error} throws apollo error based on validation
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
   * @param {Object}
   * @param {String} args._id
   * @return {Promise} returns form object
   * @throws {Error} throws apollo error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  formsDuplicate(root, { _id }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Forms.duplicate(_id);
  },
};
