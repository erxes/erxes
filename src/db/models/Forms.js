import mongoose from 'mongoose';
import Random from 'meteor-random';
import Integrations from './Integrations';
import { FORM_FIELDS } from '../../data/constants';

// schema for form document
const FormSchema = mongoose.Schema({
  _id: {
    type: String,
    default: () => Random.id(),
  },
  title: String,
  description: {
    type: String,
    required: false,
  },
  code: String,
  createdUserId: String,
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

class Form {
  /**
   * Generates a random and unique 6 letter code
   * @return {string} random code
   */
  static async generateCode() {
    let code;
    let foundForm = true;

    do {
      code = Random.id().substr(0, 6);
      foundForm = await Forms.findOne({ code });
    } while (foundForm);

    return code;
  }

  /**
   * Creates a form document
   * @param {Object} doc - Form object
   * @param {string} doc.title - Form title
   * @param {string} doc.description - Form description
   * @param {Date} doc.createdDate - Form creation date
   * @param {Object|string} createdUser - The user who is creating this form,
   * can be both user id or user object
   * @return {Promise} returns Form document promise
   * @throws {Error} throws Error if createdUser is not supplied
   */
  static async createForm(doc, createdUserId) {
    if (!createdUserId) {
      throw new Error('createdUser must be supplied');
    }

    doc.code = await this.generateCode();
    doc.createdDate = new Date();
    doc.createdUserId = createdUserId;

    return this.create(doc);
  }

  /**
   * Updates a form document
   * @param {string} _id - Form id
   * @param {Object} object - Form object
   * @param {string} object.title - Form title
   * @param {string} object.description - Form description
   * @return {Promise} returns Promise resolving updated Form document
   */
  static async updateForm(_id, { title, description }) {
    await this.update({ _id }, { $set: { title, description } }, { runValidators: true });
    return this.findOne({ _id });
  }

  /**
   * Remove a form
   * @param {string} _id - Form document id
   * @return {Null} returns null
   * @throws {Error} throws Error if this form has fields or if used in an integration
   */
  static async removeForm(_id) {
    const fieldCount = await FormFields.find({ formId: _id }).count();

    if (fieldCount > 0) {
      throw new Error('You cannot delete this form. This form has some fields.');
    }

    const integrationCount = await Integrations.find({ formId: _id }).count();

    if (integrationCount > 0) {
      throw new Error('You cannot delete this form. This form used in integration.');
    }

    return await this.remove({ _id });
  }

  /**
   * Update order fields of form fields
   * @param {Object[]} orderDics - dictionary containing order values with user ids
   * @param {string} orderDics[]._id - _id of FormField
   * @param {string} orderDics[].order - order of FormField
   * @return {Promise} null
   */
  static async updateFormFieldsOrder(orderDics) {
    // update each field's order
    for (let orderDic of orderDics) {
      await FormFields.updateFormField(orderDic._id, { order: orderDic.order });
    }
  }

  /**
   * Duplicates form and form fields of the form
   * @param {string} _id - form id
   * @return {FormField} - returns the duplicated copy of the form
   */
  static async duplicate(_id) {
    const form = await this.findOne({ _id });

    // duplicate form
    const newForm = await this.createForm(
      {
        title: `${form.title} duplicated`,
        description: form.description,
      },
      form.createdUserId,
    );

    // duplicate fields
    const formFields = await FormFields.find({ formId: _id });

    for (let field of formFields) {
      await FormFields.createFormField(newForm._id, {
        type: field.type,
        validation: field.validation,
        text: field.text,
        description: field.description,
        options: field.options,
        isRequired: field.isRequired,
        order: field.order,
      });
    }

    return newForm;
  }
}

FormSchema.loadClass(Form);
export const Forms = mongoose.model('forms', FormSchema);

// schema for form fields
const FormFieldSchema = mongoose.Schema({
  _id: {
    type: String,
    default: () => Random.id(),
  },
  type: {
    type: String,
    enum: FORM_FIELDS.TYPES.ALL,
  },
  validation: {
    type: String,
    enum: FORM_FIELDS.VALIDATION.ALL,
  },
  text: String,
  description: {
    type: String,
    required: false,
  },
  options: {
    type: [String],
    required: false,
  },
  isRequired: Boolean,
  formId: String,
  order: {
    type: Number,
    required: false,
  },
});

class FormField {
  /**
   * Creates a new form field document
   * @param {string} formId - Form id
   * @param {Object} doc - FormField document object
   * @param {string} doc.type - The type of form field (input, textarea, ...)
   * @param {string} doc.validation - The type of data to validate to (nummber, date, ...)
   * @param {string} doc.text - FormField text
   * @param {string} doc.description - FormField description
   * @param {String[]} doc.options - FormField select options (checkbox, radion buttons, ...)
   * @param {Boolean} doc.isRequired - checks whether value is filled or not on validation
   * @return {Promise} - returns form field document promise
   */
  static async createFormField(formId, doc) {
    const lastField = await FormFields.findOne({}, { order: 1 }, { sort: { order: -1 } });

    doc.formId = formId;

    // If there is no field then start with 0
    doc.order = lastField ? lastField.order + 1 : 0;

    return this.create(doc);
  }

  /**
   * Update a form field document
   * @param {string} _id - id of the form document
   * @param {Object} doc - FormField document or object
   * @param {string} doc.type - The type of form field (input, textarea, etc...)
   * @param {string} doc.validation - The type of data to validate to (nummber, date, ...)
   * @param {Number} doc.order - FormField order value
   * @param {string} doc.text - FormField text
   * @param {string} doc.description - FormField description
   * @param {String[]} doc.options - FormField select options (checkbox, radion buttons, ...)
   * @param {Boolean} doc.isRequired checks whether value is filled or not on validation
   * @return {Promise}
   */
  static updateFormField(_id, doc) {
    return this.update({ _id }, { $set: doc }, { runValidators: true });
  }

  /**
   * Remove form field
   * @param {string} _id - FormField id
   * @return {Promise}
   */
  static removeFormField(_id) {
    return this.remove({ _id });
  }
}

FormFieldSchema.loadClass(FormField);
export const FormFields = mongoose.model('form_fields', FormFieldSchema);
