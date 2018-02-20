/*
 * Group for customer and company fields
 */

import mongoose from 'mongoose';
import { field } from './utils';

const FieldGroupSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  contentType: field({ type: String }),
  order: field({ type: Number }),
  isDefinedByErxes: field({ type: Boolean, default: false }),
  description: field({
    type: String,
  }),
  visible: field({ type: Boolean, default: true }),
});

class FieldGroup {
  /** Create new field group
   *
   * @param {String} name - Group name to be created with
   * @param {String} nestedUnder - Id of parent group
   * @param {Number} order - Order number of groups
   *
   * @return {Promise} - Newly created Group
   */
  static async createFieldsGroup({ name, contentType, description, visible, order }) {
    return this.create({
      name,
      contentType,
      description,
      visible,
      order,
    });
  }

  /**
   * Update field group
   * @param {String} _id - Field group id to update
   * @param {Object} doc - Field values to update
   *
   * @return {Promise} Updated field object
   */
  static async updateFieldsGroup(_id, doc) {
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

    groupObj.remove();

    return _id;
  }

  /**
   * Update field group's visible
   * @param {String} _id - Field group id to update
   * @param {Boolean} visible - True or false to be shown
   *
   * @return {Promise} Result
   */
  static async updateFieldsGroupVisible(_id, visible) {
    // Updating visible
    await this.update({ _id }, { $set: { visible } });

    return this.findOne({ _id });
  }

  /**
   * Update single field group's order
   * @param {String} _id - Field group id to update
   * @param {Number} order - Order number
   *
   * @return {Promise} Result
   */
  static async updateFieldsGroupOrder(_id, order) {
    // Updating order
    await this.update({ _id }, { $set: { order } });

    return this.findOne({ _id });
  }
}

FieldGroupSchema.loadClass(FieldGroup);

const FieldsGroup = mongoose.model('fields_groups', FieldGroupSchema);

export default FieldsGroup;
