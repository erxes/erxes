import { Fields } from '../../../db/models';

export default {
  /**
   * Adds field object
   * @return {Promise}
   */
  fieldsAdd(root, args, { user }) {
    if (!user) throw new Error('Login required');

    return Fields.createField(args);
  },

  /**
   * Updates field object
  * @return {Promise} return Promise(null)
  */
  fieldsEdit(root, { _id, ...doc }, { user }) {
    if (!user) throw new Error('Login required');

    return Fields.updateField(_id, doc);
  },

  /**
   * Remove a channel
   * @return {Promise}
   */
  fieldsRemove(root, { _id }, { user }) {
    if (!user) throw new Error('Login required');

    return Fields.removeField(_id);
  },

  /**
   * Update field orders
   * @param [OrderItem] [{ _id: [field id], order: [order value] }]
   * @return {Promise} updated fields
   */
  fieldsUpdateOrder(root, { orders }, { user }) {
    if (!user) throw new Error('Login required');

    return Fields.updateOrder(orders);
  },
};
