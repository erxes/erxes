import * as mongoose from 'mongoose';
import 'mongoose-type-email';
import { ConversationMessages, Conversations } from './';
import { Customers, Forms } from './';
import {
  LANGUAGE_CHOICES,
  KIND_CHOICES,
  FORM_SUCCESS_ACTIONS,
  FORM_LOAD_TYPES,
  MESSENGER_DATA_AVAILABILITY,
} from '../../data/constants';

import { TwitterSchema, FacebookSchema } from '../../trackers/schemas';
import { field } from './utils';

// subdocument schema for MessengerOnlineHours
const MessengerOnlineHoursSchema = mongoose.Schema(
  {
    day: field({ type: String }),
    from: field({ type: String }),
    to: field({ type: String }),
  },
  { _id: false },
);

// subdocument schema for MessengerData
const MessengerDataSchema = mongoose.Schema(
  {
    supporterIds: field({ type: [String] }),
    notifyCustomer: field({ type: Boolean }),
    availabilityMethod: field({
      type: String,
      enum: MESSENGER_DATA_AVAILABILITY.ALL,
    }),
    isOnline: field({
      type: Boolean,
    }),
    onlineHours: field({ type: [MessengerOnlineHoursSchema] }),
    timezone: field({
      type: String,
      optional: true,
    }),
    welcomeMessage: field({ type: String, optional: true }),
    awayMessage: field({ type: String, optional: true }),
    thankYouMessage: field({ type: String, optional: true }),
  },
  { _id: false },
);

// subdocument schema for FormData
const FormDataSchema = mongoose.Schema(
  {
    loadType: field({
      type: String,
      enum: FORM_LOAD_TYPES.ALL,
    }),
    successAction: field({
      type: String,
      enum: FORM_SUCCESS_ACTIONS.ALL,
      optional: true,
    }),
    fromEmail: field({
      type: String,
      optional: true,
    }),
    userEmailTitle: field({
      type: String,
      optional: true,
    }),
    userEmailContent: field({
      type: String,
      optional: true,
    }),
    adminEmails: field({
      type: [String],
      optional: true,
    }),
    adminEmailTitle: field({
      type: String,
      optional: true,
    }),
    adminEmailContent: field({
      type: String,
      optional: true,
    }),
    thankContent: field({
      type: String,
      optional: true,
    }),
    redirectUrl: field({
      type: String,
      optional: true,
    }),
  },
  { _id: false },
);

// subdocument schema for messenger UiOptions
const UiOptionsSchema = mongoose.Schema(
  {
    color: field({ type: String }),
    wallpaper: field({ type: String }),
    logo: field({ type: String }),
  },
  { _id: false },
);

// schema for integration document
const IntegrationSchema = mongoose.Schema({
  _id: field({ pkey: true }),

  kind: field({
    type: String,
    enum: KIND_CHOICES.ALL,
  }),

  name: field({ type: String }),
  brandId: field({ type: String }),

  languageCode: field({
    type: String,
    enum: LANGUAGE_CHOICES,
    optional: true,
  }),
  tagIds: field({ type: [String], optional: true }),
  formId: field({ type: String }),
  formData: field({ type: FormDataSchema }),
  messengerData: field({ type: MessengerDataSchema }),
  twitterData: field({ type: TwitterSchema }),
  facebookData: field({ type: FacebookSchema }),
  uiOptions: field({ type: UiOptionsSchema }),
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
  static createMessengerIntegration(doc) {
    return this.createIntegration({
      ...doc,
      kind: KIND_CHOICES.MESSENGER,
    });
  }

  /**
   * Create twitter integration
   * @param {Object} doc - Integration doc
   * @return {Promise} returns integration document promise
   */
  static async createTwitterIntegration({ name, brandId, twitterData }) {
    const prevEntry = await this.findOne({
      twitterData: { $exists: true },
      'twitterData.info.id': twitterData.info.id,
    });

    // check duplication
    if (prevEntry) {
      throw new Error('Already added');
    }

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
  static async updateMessengerIntegration(_id, doc) {
    await this.update({ _id }, { $set: doc }, { runValidators: true });
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
    const integration = await this.findOne({ _id });

    // remove conversations =================
    const conversations = await Conversations.find({ integrationId: _id }, { _id: true });
    const conversationIds = conversations.map(conv => conv._id);

    await ConversationMessages.remove({
      conversationId: { $in: conversationIds },
    });
    await Conversations.remove({ integrationId: _id });

    // Remove customers ==================
    const customers = await Customers.find({ integrationId: _id });
    const customerIds = customers.map(cus => cus._id);

    for (const customerId of customerIds) {
      await Customers.removeCustomer(customerId);
    }

    // Remove form & fields
    if (integration.formId) {
      await Forms.removeForm(integration.formId);
    }

    return this.remove({ _id });
  }
}

IntegrationSchema.loadClass(Integration);

export default mongoose.model('integrations', IntegrationSchema);
