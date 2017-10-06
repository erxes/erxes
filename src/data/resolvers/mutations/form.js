import { Forms, FormFields } from '../../../db/models';
export default {
  /**
   * Create a new form
   * @param {Object}
   * @param {String} args.title
   * @param {String} args.description
   * @param {String} args.userId
   * @return {Promise} returns the form
   * @throws {Error} apollo level error based on validation
   */
  formsCreate(root, args) {
    return Forms.createForm(args);
  },

  /**
   * Update form data
   * @param {Object}
   * @param {String} args.id
   * @param {String} args.title
   * @param {String} args.description
   * @return {Promise} returns null
   * @throws {Error} apollo level error based on validation
   */
  async formsUpdate(root, args) {
    await Forms.updateForm(args);
    return;
  },

  /**
   * Remove a form
   * @param {Object}
   * @param {String} id
   * @return {Promise} null
   * @throws apollo level error based on validation
   */
  formsRemove(root, { id }) {
    return Forms.removeForm(id);
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
  formsAddFormField(root, args) {
    const { formId } = args;
    delete args.formId;
    return FormFields.createFormField(formId, args);
  },

  /**
  * @param {String} args.id form field id
  * @param {String} args.type
  * @param {String} args.validation
  * @param {String} args.text
  * @param {String} args.description
  * @param {Array} args.options
  * @param {Boolean} args.isRequired
  * @return {Promise} return Promise(null)
  * @throws {Error} throws apollo error based on validation
  */
  formsUpdateFormField(root, args) {
    const { id } = args;
    delete args.id;
    return FormFields.updateFormField(id, args);
  },

  /**
   * Remove a channel
   * @param {Object}
   * @param {String} id
   * @return {Promise} null
   * @throws {Error} throws apollo error based on validation
   */
  formsRemoveFormField(root, args) {
    const { id } = args;
    return FormFields.removeFormField(id);
  },

  /**
   * Rearranges order based on given value
   * @param {Object}
   * @param {Array} args.orderDics
   * @return {Promise} null
   * @throws {Error} throws apollo error based on validation
   */
  formsUpdateFormFieldsOrder(root, { orderDics }) {
    return Forms.updateFormFieldsOrder(orderDics);
  },

  /**
   * Duplicates the form and its fields
   * @param {Object}
   * @param {String} id
   * @return {Promise} returns form object
   * @throws {Error} throws apollo error based on validation
   */
  formsDuplicate(root, args) {
    const { id } = args;
    return Forms.duplicate(id);
  },
};
