import mongoose from 'mongoose';
import Random from 'meteor-random';
import { Fields } from './';
import { FIELD_CONTENT_TYPES } from '../../data/constants';
import { field } from './utils';

// schema for form's callout component
const CalloutSchema = mongoose.Schema(
  {
    title: field({ type: String, optional: true }),
    body: field({ type: String, optional: true }),
    buttonText: field({ type: String, optional: true }),
    featuredImage: field({ type: String, optional: true }),
    skip: field({ type: Boolean, optional: true }),
  },
  { _id: false },
);

// schema for form submission details
const SubmissionSchema = mongoose.Schema(
  {
    customerId: field({ type: String }),
    submittedAt: field({ type: Date }),
  },
  { _id: false },
);

// schema for form document
const FormSchema = mongoose.Schema({
  _id: field({ pkey: true }),
  title: field({ type: String }),
  description: field({
    type: String,
    optional: true,
  }),
  buttonText: field({ type: String, optional: true }),
  themeColor: field({ type: String, optional: true }),
  code: field({ type: String }),
  createdUserId: field({ type: String }),
  createdDate: field({
    type: Date,
    default: Date.now,
  }),
  callout: field({ type: CalloutSchema, default: {} }),
  viewCount: field({ type: Number }),
  contactsGathered: field({ type: Number }),
  submissions: field({ type: [SubmissionSchema] }),
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
   * @param {string} doc.buttonText - Form submit button text
   * @param {string} doc.themeColor - Form theme color
   * @param {Object} doc.callout - Form's callout component detail
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
   * @param {string} object.buttonText - Form submit button text
   * @param {string} object.themeColor - Form theme color
   * @param {Object} object.callout - Form's callout component detail
   * @return {Promise} returns Promise resolving updated Form document
   */
  static async updateForm(_id, { title, description, buttonText, themeColor, callout }) {
    await this.update(
      { _id },
      { $set: { title, description, buttonText, themeColor, callout } },
      { runValidators: true },
    );

    return this.findOne({ _id });
  }

  /**
   * Remove a form
   * @param {string} _id - Form document id
   * @return {Promise}
   */
  static async removeForm(_id) {
    // remove fields
    await Fields.remove({ contentType: 'form', contentTypeId: _id });

    return this.remove({ _id });
  }

  /**
   * Duplicates form and form fields of the form
   * @param {string} _id - form id
   * @return {Field} - returns the duplicated copy of the form
   */
  static async duplicate(_id) {
    const form = await this.findOne({ _id });

    // duplicate form ===================
    const newForm = await this.createForm(
      {
        title: `${form.title} duplicated`,
        description: form.description,
      },
      form.createdUserId,
    );

    // duplicate fields ===================
    const fields = await Fields.find({ contentTypeId: _id });

    for (let field of fields) {
      await Fields.createField({
        contentType: FIELD_CONTENT_TYPES.FORM,
        contentTypeId: newForm._id,
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

const Forms = mongoose.model('forms', FormSchema);

export default Forms;
