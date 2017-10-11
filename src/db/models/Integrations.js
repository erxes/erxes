import mongoose from 'mongoose';
import 'mongoose-type-email';
import Random from 'meteor-random';
import { Messages, Conversations } from './Conversations';
import { Customers } from './Customers';
import { KIND_CHOICES, FORM_SUCCESS_ACTIONS, FORM_LOAD_TYPES } from '../../data/constants';

// subdocument schema for MessengerOnlineHours
const MessengerOnlineHoursSchema = mongoose.Schema(
  {
    day: String,
    from: String,
    to: String,
  },
  { _id: false },
);

// messenger data availability constants
export const MESSENGER_DATA_AVAILABILITY_CONSTANTS = {
  MANUAL: 'manual',
  AUTO: 'auto',
  ALL: ['manual', 'auto'],
};

// subdocument schema for MessengerData
const MessengerDataSchema = mongoose.Schema(
  {
    notifyCustomer: Boolean,
    // manual, auto
    availabilityMethod: {
      type: String,
      enum: MESSENGER_DATA_AVAILABILITY_CONSTANTS.ALL,
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
      enum: FORM_LOAD_TYPES.ALL_LIST,
    },
    successAction: {
      type: String,
      enum: FORM_SUCCESS_ACTIONS.ALL_LIST,
    },
    fromEmail: mongoose.SchemaTypes.Email,
    userEmailTitle: String,
    userEmailContent: String,
    adminEmails: [mongoose.SchemaTypes.Email],
    adminEmailTitle: String,
    adminEmailContent: String,
    thankContent: String,
    redirectUrl: String,
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
  kind: String,
  name: String,
  brandId: String,
  formId: String,
  formData: FormDataSchema,
  messengerData: MessengerDataSchema,
  twitterData: Object,
  facebookData: Object,
  uiOptions: UiOptionsSchema,
});

class Integration {
  /**
   * Generate form integration data based on the given form data (formData)
   * and integration data (mainDoc)
   * @param {Object} mainDoc
   * @param {Object} formData
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
   * @param {String} doc.kind
   * @param {String} doc.name
   * @param {String} doc.brandId
   * @param {String} doc.formId
   * @param {String} doc.formData.loadType
   * @param {String} doc.formData.successAction
   * @param {String} doc.formData.formEmail
   * @param {String} doc.formData.userEmailTitle
   * @param {String} doc.formData.userEmailContent
   * @param {Array} doc.formData.adminEmails
   * @param {String} doc.formData.adminEmailTitle
   * @param {String} doc.formData.adminEmailContent
   * @param {String} doc.formData.thankContent
   * @param {String} doc.formData.redirectUrl
   * @param {Boolean} doc.messengerData.notifyCustomer
   * @param {String} doc.messengerData.availabilityMethod
   * @param {Boolean} doc.messengerData.isOnline
   * @param {String} doc.messengerData.onlineHours.day
   * @param {String} doc.messengerData.onlineHours.from
   * @param {String} doc.messengerData.onlineHours.to
   * @param {String} doc.messengerData.timezone
   * @param {String} doc.messengerData.welcomeMessage
   * @param {String} doc.messengerData.awayMessage
   * @param {String} doc.messengerData.thankYouMessage
   * @param {String} doc.messengerData.uiOptions.color
   * @param {String} doc.messengerData.uiOptions.wallpaper
   * @param {String} doc.messengerData.uiOptions.logo
   * @param {Object} doc.twitterData
   * @param {Object} doc.facebookData
   * @return {Promise} returns integration document promise
   */
  static createIntegration(doc) {
    return this.create(doc);
  }

  /**
   * Create a messenger kind integration
   * @param {String} args.name
   * @param {String} args.brandId
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
   * Update a messenger integration
   * @param {String} args.name
   * @param {String} args.brandId
   * @return {Promise}
   */
  static updateMessengerIntegration(_id, { name, brandId }) {
    return this.update({ _id }, { $set: { name, brandId } }, { runValidators: true });
  }

  /**
   * Save messenger appearance data
   * @param {String} _id
   * @param {String} args.color
   * @param {String} args.wallpaper
   * @param {String} args.logo
   * @return {Promise}
   */
  static saveMessengerAppearanceData(_id, { color, wallpaper, logo }) {
    return this.update(
      { _id },
      { $set: { uiOptions: { color, wallpaper, logo } } },
      { runValdatiors: true },
    );
  }

  /**
  * Saves messenger data to integration document
  * @param {Boolean} messengerData.notifyCustomer
  * @param {String} messengerData.availabilityMethod
  * @param {Boolean} messengerData.isOnline
  * @param {String} messengerData.onlineHours.day
  * @param {String} messengerData.onlineHours.from
  * @param {String} messengerData.onlineHours.to
  * @param {String} messengerData.timezone
  * @param {String} messengerData.welcomeMessage
  * @param {String} messengerData.awayMessage
  * @param {String} messengerData.thankYouMessage
  * @param {String} messengerData.uiOptions.color
  * @param {String} messengerData.uiOptions.wallpaper
  * @param {String} messengerData.uiOptions.logo
  * @return {Promise}
  */
  static saveMessengerConfigs(_id, messengerData) {
    return this.update({ _id }, { $set: { messengerData } }, { runValidators: true });
  }

  /**
   * Create a form kind integration
   * @param {String} args.formData.loadType
   * @param {String} args.formData.successAction
   * @param {String} args.formData.formEmail
   * @param {String} args.formData.userEmailTitle
   * @param {String} args.formData.userEmailContent
   * @param {Array} args.formData.adminEmails
   * @param {String} args.formData.adminEmailTitle
   * @param {String} args.formData.adminEmailContent
   * @param {String} args.formData.thankContent
   * @param {String} args.formData.redirectUrl
   * @param {String} args.mainDoc.name
   * @param {String} args.mainDoc.brandId
   * @param {String} args.mainDoc.formId
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
   * Update a form kind integration
   * @param {String} _id integration id
   * @param {String} args.formData.loadType
   * @param {String} args.formData.successAction
   * @param {String} args.formData.formEmail
   * @param {String} args.formData.userEmailTitle
   * @param {String} args.formData.userEmailContent
   * @param {Array} args.formData.adminEmails
   * @param {String} args.formData.adminEmailTitle
   * @param {String} args.formData.adminEmailContent
   * @param {String} args.formData.thankContent
   * @param {String} args.formData.redirectUrl
   * @param {String} args.mainDoc.name
   * @param {String} args.mainDoc.brandId
   * @param {String} args.mainDoc.formId
   * @return {Promise}
   */
  static updateFormIntegration(_id, { formData, ...mainDoc }) {
    const doc = this.generateFormDoc(mainDoc, formData);

    return this.update({ _id }, { $set: doc }, { runValidators: true });
  }

  /**
   * Removes an integration plus its messages, conversations, customers
   * @param {String} id
   * @return {Promise}
   */
  static async removeIntegration(id) {
    const conversations = await Conversations.find({ integrationId: id }, { _id: true });

    const conversationIds = [];

    conversations.forEach(c => {
      conversationIds.push(c._id);
    });

    // Remove messages
    await Messages.remove({ conversationId: { $in: conversationIds } });

    // Remove conversations
    await Conversations.remove({ integrationId: id });

    // Remove customers
    await Customers.remove({ integrationId: id });

    return this.remove(id);
  }
}

IntegrationSchema.loadClass(Integration);
export default mongoose.model('integrations', IntegrationSchema);
