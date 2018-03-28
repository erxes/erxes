import mongoose from 'mongoose';
import Random from 'meteor-random';
import { field } from './utils';

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
  featuredImage: field({ type: String, optional: true }),
  code: field({ type: String }),
  createdUserId: field({ type: String }),
  createdDate: field({
    type: Date,
    default: Date.now,
  }),
  viewCount: field({ type: Number }),
  contactsGathered: field({ type: Number }),
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
   * @param {string} doc.featuredImage - Form featured image
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
   * @param {string} object.featuredImage - Form featured image
   * @return {Promise} returns Promise resolving updated Form document
   */
  static async updateForm(_id, { title, description, buttonText, themeColor, featuredImage }) {
    await this.update(
      { _id },
      { $set: { title, description, buttonText, themeColor, featuredImage } },
      { runValidators: true },
    );

    return this.findOne({ _id });
  }
}

FormSchema.loadClass(Form);

const Forms = mongoose.model('forms', FormSchema);

export default Forms;
