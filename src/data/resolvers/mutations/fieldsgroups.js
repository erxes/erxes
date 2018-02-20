import { FieldsGroups } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';

const fieldsGroupsMutations = {
  /**
   * Create a new group for fields
   * @param {Object} args - Graphql input data
   * @param {String} args.name - Group name
   * @param {String} args.nestedUnder - Id of parent group
   * @param {Number} args.order - Group sort order
   *
   * @return {Promise} Newly created Group
   */
  fieldsGroupsAdd(root, args) {
    return FieldsGroups.createFieldsGroup(args);
  },

  /**
   * Update group for fields
   * @param {Object} _id - Id of group to update
   * @param {Object} doc - Graphql input data
   * @param {String} doc.name - Group name
   * @param {String} doc.nestedUnder - Id of parent group
   * @param {Number} doc.order - Group sort order
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
