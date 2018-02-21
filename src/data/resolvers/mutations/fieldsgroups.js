import { FieldsGroups } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

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
  fieldsGroupsAdd(root, doc) {
    return FieldsGroups.createFieldsGroup(doc);
  },

  /**
   * Update group for fields
   * @param {Object} _id - Id of group to update
   * @param {Object} doc - Graphql input data
   * @param {String} doc.name - Group name
   * @param {String} doc.description - Id of parent group
   *
   * @return {Promise} Newly updated Group
   */
  fieldsGroupsEdit(root, { _id, ...doc }) {
    return FieldsGroups.updateFieldsGroup(_id, doc);
  },

  /**
   * Remove group
   * @param {Object} _id - Id of group to remove
   *
   * @return {Promise} Result
   */
  fieldsGroupsRemove(root, { _id }) {
    return FieldsGroups.removeFieldsGroup(_id);
  },

  /**
   * Update single field group's order number
   * @param {String} _id - Field group id to update
   * @param {String} order - Order number
   *
   * @return {Promise} Updated field group
   */
  fieldsGroupsUpdateOrder(root, { _id, order }) {
    return FieldsGroups.updateFieldsGroupOrder(_id, order);
  },

  /**
   * Update field group's visible
   * @param {String} _id - Field group id to update
   * @param {String} visible - True or false visible value
   *
   * @return {Promise} Updated field group
   */
  fieldsGroupsUpdateVisible(root, { _id, visible }) {
    return FieldsGroups.updateFieldsGroupVisible(_id, visible);
  },
};

moduleRequireLogin(fieldsGroupsMutations);

export default fieldsGroupsMutations;
