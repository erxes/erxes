import { Fields, FieldsGroups } from '../../../db/models';
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
   * @param {String} isVisible - True or false visible value
   * @param {String} lastUpdatedUserId - id of user who updated field last
   *
   * @return {Promise} Updated field
   */
  fieldsUpdateVisible(root, { _id, isVisible, lastUpdatedUserId }) {
    return Fields.updateFieldsVisible(_id, isVisible, lastUpdatedUserId);
  },
};

const fieldsGroupsMutations = {
  /**
   * Create a new group for fields
   * @param {Object} doc - Graphql input data
   * @param {String} doc.name - Group name
   * @param {String} doc.contentType - Group type customer or company
   * @param {String} doc.description - Group description
   * @param {String} doc.lastUpdatedUserId - Id of user who updated the group last
   *
   * @return {Promise} Newly created Group
   */
  fieldsGroupsAdd(root, doc) {
    return FieldsGroups.createGroup(doc);
  },

  /**
   * Update group for fields
   * @param {Object} _id - Id of group to update
   * @param {Object} doc - Graphql input data
   * @param {String} doc.name - Group name
   * @param {String} doc.description - Id of parent group
   * @param {String} doc.lastUpdatedUserId - Id of user who updated the group last
   *
   * @return {Promise} Newly updated Group
   */
  fieldsGroupsEdit(root, { _id, ...doc }) {
    return FieldsGroups.updateGroup(_id, doc);
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
   * @param {String} lastUpdatedUserId - id of a User who updated the visible last
   *
   * @return {Promise} Updated field group
   */
  fieldsGroupsUpdateVisible(root, { _id, isVisible, lastUpdatedUserId }) {
    return FieldsGroups.updateGroupVisible(_id, isVisible, lastUpdatedUserId);
  },
};

moduleRequireLogin(fieldMutations);
moduleRequireLogin(fieldsGroupsMutations);

export { fieldsGroupsMutations, fieldMutations };
