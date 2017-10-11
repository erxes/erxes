import mongoose from 'mongoose';
import Random from 'meteor-random';
import Integrations from './Integrations';

// schema for form document
const FormSchema = mongoose.Schema({
  _id: {
    type: String,
    default: () => Random.id(),
  },
  title: String,
  description: String,
  code: String,
  createdUserId: String,
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

class Form {
  /**
   * Generates a randomly generated and unique 6 letter code
   * @return {String} random code
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
   * @param {String} doc.title
   * @param {String} doc.description
   * @param {Date} doc.createdDate
   * @param {String} createdUserId
   * @return {Object} returns Form document
   * @throws {Error} throws Error if createdUserId is not supplied
   */
  static async createForm(doc, createdUserId) {
    if (!createdUserId) {
      throw new Error('createdUserId must be supplied');
    }

    doc.code = await this.generateCode();

    doc.createdDate = new Date();

    return this.create(doc);
  }

  /**
   * Updates a form document
   * @param {String} _id
   * @param {String} args.title
   * @param {String} args.description
   * @return {Object} returns Form document
   * @throws {Error}
   */
  static updateForm(_id, { title, description }) {
    return this.update({ _id }, { $set: { title, description } }, { runValidators: true });
  }

  /**
   * Remove a form
   * @param {String} _id
   * @return {Promise}
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

    return this.remove({ _id });
  }

  /**
   * Update order fields of form fields
   * @param {String} orderDics[]._id
   * @param {String} orderDics[].order
   * @return {Null}
   */
  static async updateFormFieldsOrder(orderDics) {
    // update each field's order
    for (let orderDic of orderDics) {
      await FormFields.updateFormField(orderDic._id, { order: orderDic.order });
    }
  }

  /**
   * Duplicates form and form fields of the form
   * @param {String} _id form id
   * @return {Object} returns the duplicated copy of the form
   */
  static async duplicate(_id) {
    const form = await this.findOne({ _id });

    // duplicate form
    const newForm = await this.createForm({
      title: `${form.title} duplicated`,
      description: form.description,
      createdUserId: form.createdUserId,
    });

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
  type: String, // TODO: change to enum
  validation: String, // TODO: check if can be enum
  text: String,
  description: String,
  options: [String],
  isRequired: Boolean,
  formId: String,
  order: Number,
});

class FormField {
  /**
   * Creates a new form field document
   * @param {String} formId id of the form document
   * @param {String} doc.type
   * @param {String} doc.validation
   * @param {String} doc.text
   * @param {String} doc.description
   * @param {Array} doc.options
   * @param {Boolean} doc.isRequired
   * @return {Promise} returns form document promise
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
   * @param {String} _id id of the form document
   * @param {String} doc.type
   * @param {String} doc.validation
   * @param {String} doc.text
   * @param {String} doc.description
   * @param {Array} doc.options
   * @param {Boolean} doc.isRequired
   * @return {Promise}
   */
  static updateFormField(_id, doc) {
    return this.update({ _id }, { $set: doc }, { runValidators: true });
  }

  /**
   * Remove form field
   * @param {String} _id
   * @return {Promise}
   */
  static removeFormField(_id) {
    return this.remove({ _id });
  }
}

FormFieldSchema.loadClass(FormField);
export const FormFields = mongoose.model('form_fields', FormFieldSchema);
