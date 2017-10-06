import { Forms, FormFields } from '../../../db/models';
export default {
  /**
   * Create a new form
   * @param {Object}
   * @param {String} doc.title
   * @param {String} doc.description
   * @param {String} doc.userId
   * @return {Promise} returns the form
   * @throws {Error} apollo level error based on validation
   */
  formsCreate(root, doc) {
    return Forms.createForm(doc);
  },

  /**
   * Update form data
   * @param {Object}
   * @param {String} doc._id
   * @param {String} doc.title
   * @param {String} doc.description
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
   */
  formsEdit(root, { _id, ...doc }) {
    return Forms.updateForm(_id, doc);
  },

  /**
   * Remove a form
   * @param {Object}
   * @param {String} _id
   * @return {Promise} null
   * @throws apollo level error based on validation
   */
  formsRemove(root, { _id }) {
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
   */
  formsAddFormField(root, { formId, ...formFieldDoc }) {
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
  */
  formsEditFormField(root, { _id, ...formFieldDoc }) {
    return FormFields.updateFormField(_id, formFieldDoc);
  },

  /**
   * Remove a channel
   * @param {Object}
   * @param {String} _id
   * @return {Promise} null
   * @throws {Error} throws apollo error based on validation
   */
  formsRemoveFormField(root, { _id }) {
    return FormFields.removeFormField(_id);
  },

  /**
   * Rearranges order based on given value
   * @param {Object}
   * @param {String} args.orderDics.id
   * @param {String} args.orderDics.order
   * @return {Promise} null
   * @throws {Error} throws apollo error based on validation
   */
  formsUpdateFormFieldsOrder(root, { orderDics }) {
    return Forms.updateFormFieldsOrder(orderDics);
  },

  /**
   * Duplicates the form and its fields
   * @param {Object}
   * @param {String} args._id
   * @return {Promise} returns form object
   * @throws {Error} throws apollo error based on validation
   */
  formsDuplicate(root, { _id }) {
    return Forms.duplicate(_id);
  },
};
