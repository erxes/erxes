/*
 * Group for customer and company fields
 */

import mongoose from 'mongoose';
import { Fields } from './';
import { field } from './utils';

const FieldGroupSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  // customer, company
  contentType: field({ type: String }),
  order: field({ type: Number }),
  isDefinedByErxes: field({ type: Boolean, default: false }),
  description: field({
    type: String,
  }),
  // Id of user who updated the gorup
  lastUpdatedBy: { type: String },
  visible: field({ type: Boolean, default: true }),
});

class FieldGroup {
  /** Check if Group is defined by erxes by default
   *
   * @param {String} _id - Id of group object to check
   *
   * @return {Promise} Newly created Group
   */
  static async checkIsDefinedByErxes(_id) {
    const groupObj = await this.findOne({ _id });

    // Checking if the group is defined by the erxes
    if (groupObj.isDefinedByErxes) throw new Error('Cant update this group');
  }

  /** Create new field group
   *
   * @param {String} doc.name - Group name to be created with
   * @param {String} doc.contentType - Content type customer or company
   * @param {String} doc.description - Group description
   * @param {String} doc.lastUpdatedBy - Id of user who updated the group last
   * @param {Boolean} doc.isDefinedByErxes - If true you cant edit fieldgroup
   *
   * @return {Promise} Newly created Group
   */
  static async createFieldsGroup(doc) {
    // Newly created group must be visible
    const visible = true;

    const { contentType } = doc;

    // Automatically setting order of group to the bottom
    const order = (await this.count({ contentType })) + 1;

    return this.create({ ...doc, visible, order });
  }

  /**
   * Update field group
   * @param {String} _id - Field group id to update
   * @param {Object} doc - Field values to update
   * @param {String} doc.name - Field group name
   * @param {String} doc.description - Field group description
   * @param {String} doc.lastUpdatedBy - Id of user who updated the group last
   *
   * @return {Promise} Updated field object
   */
  static async updateFieldsGroup(_id, doc) {
    // Can not edit group that is defined by erxes
    await this.checkIsDefinedByErxes(_id);

    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /**
   * Remove field group
   * @param {String} _id - Field group id to remove
   *
   * @return {Promise} Result
   */
  static async removeFieldsGroup(_id) {
    const groupObj = await this.findOne({ _id });

    if (!groupObj) throw new Error(`Group not found with id of ${_id}`);

    // Deleting fields that are associated with this group
    const fields = await Fields.find({ groupId: _id });

    for (let field of fields) {
      await Fields.removeField(field._id);
    }

    // Can not delete group that is defined by erxes
    await this.checkIsDefinedByErxes(_id);

    groupObj.remove();

    return _id;
  }

  /**
   * Update field group's visible
   * @param {String} _id - Field group id to update
   * @param {Boolean} visible - True or false to be shown
   * @param {Boolean} lastUpdatedBy - id of User who updated group last
   *
   * @return {Promise} Result
   */
  static async updateFieldsGroupVisible(_id, visible, lastUpdatedBy) {
    // Can not update group that is defined by erxes
    await this.checkIsDefinedByErxes(_id);

    // Updating visible
    await this.update({ _id }, { $set: { visible, lastUpdatedBy } });

    return this.findOne({ _id });
  }
}

FieldGroupSchema.loadClass(FieldGroup);

const FieldsGroup = mongoose.model('fields_groups', FieldGroupSchema);

export default FieldsGroup;
