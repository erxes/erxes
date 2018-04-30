import { Fields, FieldsGroups } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const fieldMutations = {
  /**
   * Adds field object
   * @return {Promise}
   */
  fieldsAdd(root, args, { user }) {
    return Fields.createField({ ...args, lastUpdatedUserId: user._id });
  },

  /**
   * Updates field object
  * @return {Promise} return Promise(null)
  */
  fieldsEdit(root, { _id, ...doc }, { user }) {
    return Fields.updateField(_id, { ...doc, lastUpdatedUserId: user._id });
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
   * @param {String} isVisible - True or false visible value
   *
   * @return {Promise} Updated field
   */
  fieldsUpdateVisible(root, { _id, isVisible }, { user }) {
    return Fields.updateFieldsVisible(_id, isVisible, user._id);
  },
};

const fieldsGroupsMutations = {
  /**
   * Create a new group for fields
   * @param {Object} doc - Graphql input data
   * @param {String} doc.name - Group name
   * @param {String} doc.contentType - Group type customer or company
   * @param {String} doc.description - Group description
   *
   * @return {Promise} Newly created Group
   */
  fieldsGroupsAdd(root, doc, { user }) {
    return FieldsGroups.createGroup({ ...doc, lastUpdatedUserId: user._id });
  },

  /**
   * Update group for fields
   * @param {Object} _id - Id of group to update
   * @param {Object} doc - Graphql input data
   * @param {String} doc.name - Group name
   * @param {String} doc.description - Description of group
   *
   * @return {Promise} Updated Group
   */
  fieldsGroupsEdit(root, { _id, ...doc }, { user }) {
    return FieldsGroups.updateGroup(_id, { ...doc, lastUpdatedUserId: user._id });
  },

  /**
   * Remove group
   * @param {Object} _id - Id of group to remove
   *
   * @return {Promise} Result
   */
  fieldsGroupsRemove(root, { _id }) {
    return FieldsGroups.removeGroup(_id);
  },

  /**
   * Update field group's visible
   * @param {String} _id - Field group id to update
   * @param {String} isVisible - True or false visible value
   *
   * @return {Promise} Updated field group
   */
  fieldsGroupsUpdateVisible(root, { _id, isVisible }, { user }) {
    return FieldsGroups.updateGroupVisible(_id, isVisible, user._id);
  },
};

moduleRequireLogin(fieldMutations);
moduleRequireLogin(fieldsGroupsMutations);

export { fieldsGroupsMutations, fieldMutations };
