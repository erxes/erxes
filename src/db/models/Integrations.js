import mongoose from 'mongoose';
import 'mongoose-type-email';
import Random from 'meteor-random';
import { ConversationMessages, Conversations } from './';
import { Customers } from './';
import {
  KIND_CHOICES,
  FORM_SUCCESS_ACTIONS,
  FORM_LOAD_TYPES,
  MESSENGER_DATA_AVAILABILITY,
} from '../../data/constants';

import { TwitterSchema, FacebookSchema } from '../../social/schemas';

// subdocument schema for MessengerOnlineHours
const MessengerOnlineHoursSchema = mongoose.Schema(
  {
    day: String,
    from: String,
    to: String,
  },
  { _id: false },
);

// subdocument schema for MessengerData
const MessengerDataSchema = mongoose.Schema(
  {
    notifyCustomer: Boolean,
    availabilityMethod: {
      type: String,
      enum: MESSENGER_DATA_AVAILABILITY.ALL,
    },
    isOnline: {
      type: Boolean,
    },
    onlineHours: [MessengerOnlineHoursSchema],
    timezone: String,
    welcomeMessage: String,
    awayMessage: String,
    thankYouMessage: String,
  },
  { _id: false },
);

// subdocument schema for FormData
const FormDataSchema = mongoose.Schema(
  {
    loadType: {
      type: String,
      enum: FORM_LOAD_TYPES.ALL,
    },
    successAction: {
      type: String,
      enum: FORM_SUCCESS_ACTIONS.ALL,
    },
    fromEmail: {
      type: String,
      optional: true,
    },
    userEmailTitle: {
      type: String,
      optional: true,
    },
    userEmailContent: {
      type: String,
      optional: true,
    },
    adminEmails: {
      type: [String],
      optional: true,
    },
    adminEmailTitle: {
      type: String,
      optional: true,
    },
    adminEmailContent: {
      type: String,
      optional: true,
    },
    thankContent: {
      type: String,
      optional: true,
    },
    redirectUrl: {
      type: String,
      optional: true,
    },
  },
  { _id: false },
);

// subdocument schema for messenger UiOptions
const UiOptionsSchema = mongoose.Schema(
  {
    color: String,
    wallpaper: String,
    logo: String,
  },
  { _id: false },
);

// schema for integration document
const IntegrationSchema = mongoose.Schema({
  _id: {
    type: String,
    default: () => Random.id(),
  },
  kind: {
    type: String,
    enum: KIND_CHOICES.ALL,
  },
  name: String,
  brandId: String,
  formId: String,
  formData: FormDataSchema,
  messengerData: MessengerDataSchema,
  twitterData: TwitterSchema,
  facebookData: FacebookSchema,
  uiOptions: UiOptionsSchema,
});

class Integration {
  /**
   * Generate form integration data based on the given form data (formData)
   * and integration data (mainDoc)
   * @param {Integration} mainDoc - Integration doc without subdocuments
   * @param {FormData} formData - Integration forData subdocument
   * @return {Object} returns an integration object
   */
  static generateFormDoc(mainDoc, formData) {
    return {
      ...mainDoc,
      kind: KIND_CHOICES.FORM,
      formData,
    };
  }

  /**
   * Create an integration, intended as a private method
   * @param {Object} doc - Integration doc
   * @return {Promise} returns integration document promise
   */
  static createIntegration(doc) {
    return this.create(doc);
  }

  /**
   * Create a messenger kind integration
   * @param {Object} object - Integration doc
   * @param {string} object.name - Integration name
   * @param {String} object.brandId - Integration brand id
   * @return {Promise} returns integration document promise
   */
  static createMessengerIntegration({ name, brandId }) {
    return this.createIntegration({
      name,
      brandId,
      kind: KIND_CHOICES.MESSENGER,
    });
  }

  /**
   * Create twitter integration
   * @param {Object} doc - Integration doc
   * @return {Promise} returns integration document promise
   */
  static createTwitterIntegration({ name, brandId, twitterData }) {
    return this.createIntegration({
      name,
      brandId,
      kind: KIND_CHOICES.TWITTER,
      twitterData,
    });
  }

  /**
   * Create facebook integration
   * @param {Object} doc - Integration doc
   * @return {Promise} returns integration document promise
   */
  static createFacebookIntegration({ name, brandId, facebookData }) {
    return this.createIntegration({
      name,
      brandId,
      kind: KIND_CHOICES.FACEBOOK,
      facebookData,
    });
  }

  /**
   * Update messenger integration document
   * @param {Object} object - Integration main doc object
   * @param {string} object.name - Integration name
   * @param {string} object.brandId - Integration brand id
   * @return {Promise} returns Promise resolving updated Integration document
   */
  static async updateMessengerIntegration(_id, { name, brandId }) {
    await this.update({ _id }, { $set: { name, brandId } }, { runValidators: true });
    return this.findOne({ _id });
  }

  /**
   * Save messenger appearance data
   * @param {string} _id
   * @param {Object} object - MessengerUiOptions object
   * @return {Promise} returns Promise resolving updated Integration document
   */
  static async saveMessengerAppearanceData(_id, { color, wallpaper, logo }) {
    await this.update(
      { _id },
      { $set: { uiOptions: { color, wallpaper, logo } } },
      { runValdatiors: true },
    );

    return this.findOne({ _id });
  }

  /**
  * Saves messenger data to integration document
  * @param {Object} doc.messengerData - MessengerData object
  * @return {Promise} returns Promise resolving updated Integration document
  */
  static async saveMessengerConfigs(_id, messengerData) {
    await this.update({ _id }, { $set: { messengerData } }, { runValidators: true });
    return this.findOne({ _id });
  }

  /**
   * Create a form kind integration
   * @param {Object} args.formData - FormData object
  * @return {Promise} returns form integration document promise
   * @throws {Exception} throws Exception if formData is notSupplied
   */
  static createFormIntegration({ formData, ...mainDoc }) {
    const doc = this.generateFormDoc(mainDoc, formData);

    if (Object.keys(formData || {}).length === 0) {
      throw new Error('formData must be supplied');
    }

    return this.create(doc);
  }

  /**
   * Update form integration
   * @param {string} _id integration id
   * @param {Object} args.formData - FormData object
   * @return {Promise} returns Promise resolving updated Integration document
   */
  static async updateFormIntegration(_id, { formData, ...mainDoc }) {
    const doc = this.generateFormDoc(mainDoc, formData);

    await this.update({ _id }, { $set: doc }, { runValidators: true });
    return this.findOne({ _id });
  }

  /**
   * Remove integration in addition with its messages, conversations, customers
   * @param {string} id - Integration id
   * @return {Promise}
   */
  static async removeIntegration(_id) {
    const conversations = await Conversations.find({ integrationId: _id }, { _id: true });

    const conversationIds = [];

    conversations.forEach(c => {
      conversationIds.push(c._id);
    });

    // Remove messages
    await ConversationMessages.remove({ conversationId: { $in: conversationIds } });

    // Remove conversations
    await Conversations.remove({ integrationId: _id });

    // Remove customers
    await Customers.remove({ integrationId: _id });

    return this.remove({ _id });
  }
}

IntegrationSchema.loadClass(Integration);

export default mongoose.model('integrations', IntegrationSchema);
