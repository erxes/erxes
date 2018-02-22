import { Fields } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const fieldMutations = {
  /**
   * Adds field object
   * @return {Promise}
   */
  fieldsAdd(root, args) {
    return Fields.createField(args);
  },

  /**
   * Updates field object
  * @return {Promise} return Promise(null)
  */
  fieldsEdit(root, { _id, ...doc }) {
    return Fields.updateField(_id, doc);
  },

  /**
   * Remove a channel
   * @return {Promise}
   */
  fieldsRemove(root, { _id }) {
    return Fields.removeField(_id);
  },

  /**
   * Update field orders
   * @param [OrderItem] [{ _id: [field id], order: [order value] }]
   * @return {Promise} updated fields
   */
  fieldsUpdateOrder(root, { orders }) {
    return Fields.updateOrder(orders);
  },

  /**
   * Update field's visible
   * @param {String} _id - Field id to update
   * @param {String} visible - True or false visible value
   * @param {String} lastUpdatedBy - id of user who updated field last
   *
   * @return {Promise} Updated field
   */
  fieldsUpdateVisible(root, { _id, visible, lastUpdatedBy }) {
    return Fields.updateFieldsVisible(_id, visible, lastUpdatedBy);
  },
};

moduleRequireLogin(fieldMutations);

export default fieldMutations;
