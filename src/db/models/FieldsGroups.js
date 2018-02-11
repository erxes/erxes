/*
 * Group for customer and company fields
 */

import mongoose from 'mongoose';
import { field } from './utils';

const FieldGroupSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  name: field({ type: String }),
  nestedUnder: field({ type: String }),
  order: field({ type: Number }),
  description: field({
    type: String,
  }),
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
  static async createFieldsGroup({ name, nestedUnder, order }) {
    return this.create({
      name,
      nestedUnder,
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

    return groupObj.remove();
  }
}

FieldGroupSchema.loadClass(FieldGroup);

const FieldsGroup = mongoose.model('fields_groups', FieldGroupSchema);

export default FieldsGroup;
