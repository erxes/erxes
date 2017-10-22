/*
 * Extra fields for form, customer, company
 */

import mongoose from 'mongoose';
import Random from 'meteor-random';
import validator from 'validator';
import { FIELD_CONTENT_TYPES } from '../../data/constants';
import { Forms } from './';

const FieldSchema = mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },

  // form, customer, company
  contentType: String,

  // formId when contentType is form
  contentTypeId: String,

  type: String,
  validation: {
    type: String,
    optional: true,
  },
  text: String,
  description: {
    type: String,
    optional: true,
  },
  options: {
    type: [String],
    optional: true,
  },
  isRequired: Boolean,
  order: Number,
});

class Field {
  /* Create new field
   *
   * @param {String} contentType form, customer, company
   * @param {String} contentTypeId when contentType is form, it will be
   * formId
   *
   * @return {Promise} newly created field object
   */
  static async createField({ contentType, contentTypeId, ...fields }) {
    const query = { contentType };

    if (contentTypeId) {
      query.contentTypeId = contentTypeId;
    }

    // form checks
    if (contentType === FIELD_CONTENT_TYPES.FORM) {
      if (!contentTypeId) {
        throw new Error('Content type id is required');
      }

      const form = await Forms.findOne({ _id: contentTypeId });

      if (!form) {
        throw new Error(`Form not found with _id of ${contentTypeId}`);
      }
    }

    // Generate order
    // if there is no field then start with 0
    let order = 0;

    const lastField = await Fields.findOne(query).sort({ order: -1 });

    if (lastField) {
      order = lastField.order + 1;
    }

    return this.create({
      contentType,
      contentTypeId,
      order,
      ...fields,
    });
  }

  /*
   * Update field
   * @param {String} _id field id to update
   * @param {Object} doc field values to update
   * @return {Promise} updated field object
   */
  static async updateField(_id, doc) {
    await this.update({ _id }, { $set: doc });

    return this.findOne({ _id });
  }

  /*
   * Remove field
   * @param {String} _id field id to remove
   * @return {Promise}
   */
  static async removeField(_id) {
    const fieldObj = await this.findOne({ _id });

    if (!fieldObj) throw new Error(`Field not found with id ${_id}`);

    return fieldObj.remove();
  }

  /*
   * Update given fields orders
   *
   * @param [OrderItem] orders
   * [{
   *  _id: {String} field id
   *  order: {Number} order
   * }]
   *
   * @return [Field] updated fields
   */
  static async updateOrder(orders) {
    const ids = [];

    for (let { _id, order } of orders) {
      ids.push(_id);

      // update each fields order
      await this.update({ _id }, { order });
    }

    return this.find({ _id: { $in: ids } }).sort({ order: 1 });
  }

  /*
   * Validate per field according to it's validation and type
   * fixes values if necessary
   *
   * @param {String} _id - Field id
   * @param {String|Date|Number} value - Submitted value
   * @throw Validation error
   * @return {String} - valid indicator
   */
  static async clean(_id, _value) {
    const field = await this.findOne({ _id });

    let value = _value;

    if (!field) {
      throw new Error(`Field not found with the _id of ${_id}`);
    }

    const { type, validation } = field;

    // throw error helper
    const throwError = message => {
      throw new Error(`${field.text}: ${message}`);
    };

    // required
    if (field.isRequired && !value) {
      throwError('required');
    }

    if (value) {
      // email
      if ((type === 'email' || validation === 'email') && !validator.isEmail(value)) {
        throwError('Invalid email');
      }

      // number
      if (validation === 'number' && !validator.isFloat(value.toString())) {
        throwError('Invalid number');
      }

      // date
      if (validation === 'date') {
        if (!validator.isISO8601(value)) {
          throwError('Invalid date');
        }

        value = new Date(value);
      }
    }

    return value;
  }

  /*
   * Validates multiple fields, fixes values if necessary
   *
   * @param {Object} data - field._id, value mapping
   * @return {String} - valid indicator
   */
  static async cleanMulti(data) {
    const ids = Object.keys(data);

    const fixedValues = {};

    // validate individual fields
    for (let _id of ids) {
      fixedValues[_id] = await this.clean(_id, data[_id]);
    }

    return fixedValues;
  }
}

FieldSchema.loadClass(Field);

const Fields = mongoose.model('fields', FieldSchema);

export default Fields;
