import mongoose from 'mongoose';
import 'mongoose-type-email';
import Random from 'meteor-random';
import { Messages, Conversations } from './Conversations';
import { Customers } from './Customers';
import {
  KIND_CHOICES,
  FORM_SUCCESS_ACTIONS,
  FORM_LOAD_TYPES,
  MESSENGER_DATA_AVAILABILITY,
} from '../../data/constants';

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
  kind: {
    type: String,
    enum: KIND_CHOICES.ALL,
  },
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
   * @param {Integration} mainDoc - Integration object without subdocuments
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
   * @param {Object} doc - Integration object
   * @param {string} doc.kind - Integration kind
   * @param {string} doc.name - Integration name
   * @param {string} doc.brandId - Brand id of the related Brand
   * @param {string} doc.formId - Form id (used in form integrations)
   * @param {string} doc.formData.loadType - Load types for the embedded form
   * @param {string} doc.formData.successAction - TODO: need more elaborate documentation
   * @param {string} doc.formData.formEmail - TODO: need more elaborate documentation
   * @param {string} doc.formData.userEmailTitle - TODO: need more elaborate documentation
   * @param {string} doc.formData.userEmailContent - TODO: need more elaborate documentation
   * @param {Array} doc.formData.adminEmails - TODO: need more elaborate documentation
   * @param {string} doc.formData.adminEmailTitle - TODO: need more elaborate documentation
   * @param {string} doc.formData.adminEmailContent - TODO: need more elaborate documentation
   * @param {string} doc.formData.thankContent - TODO: need more elaborate documentation
   * @param {string} doc.formData.redirectUrl - Form redirectUrl on submit
   *    TODO: need more elaborate documentation
   * @param {Object} doc.messengerData - MessengerData object
   * @param {Boolean} doc.messengerData.notifyCustomer - Identicates whether
   *    customer should be notified or not TODO: need more elaborate documentation
   * @param {string} doc.messengerData.availabilityMethod - Sets messenger
   *    availability method as auto or manual TODO: need more elaborate documentation
   * @param {Boolean} doc.messengerData.isOnline - Identicates whether messenger in online or not
   * @param {Object[]} doc.messengerData.onlineHours - OnlineHours object array
   * @param {string} doc.messengerData.onlineHours.day - OnlineHours day
   * @param {string} doc.messengerData.onlineHours.from - OnlineHours from
   * @param {string} doc.messengerData.onlineHours.to  - OnlineHours to
   * @param {string} doc.messengerData.timezone - Timezone
   * @param {string} doc.messengerData.welcomeMessage - Message displayed on welcome
   *    TODO: need more elaborate documentation
   * @param {string} doc.messengerData.awayMessage - Message displayed when status becomes away
   *    TODO: need more elaborate documentation
   * @param {string} doc.messengerData.thankYouMessage - Thank you message
   *    TODO: need more elaborate documentation
   * @param {string} doc.messengerData.uiOptions.color - Color of messenger
   * @param {string} doc.messengerData.uiOptions.wallpaper - Wallpaper image for messenger
   * @param {string} doc.messengerData.uiOptions.logo - Logo used in the embedded messenger
   * @param {Object} doc.twitterData - Twitter data
   *    TODO: need more elaborate documentation
   * @param {Object} doc.facebookData - Facebook data
   *    TODO: need more elaborate documentation
   * @return {Promise} returns integration document promise
   */
  static createIntegration(doc) {
    return this.create(doc);
  }

  /**
   * Create a messenger kind integration
   * @param {Object} object - Integration object
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
   * Update messenger integration document
   * @param {Object} object - Integration main doc object
   * @param {string} object.name - Integration name
   * @param {string} object.brandId - Integration brand id
   * @return {Promise} returns Promise resolving updated Integration documetn
   */
  static async updateMessengerIntegration(_id, { name, brandId }) {
    await this.update({ _id }, { $set: { name, brandId } }, { runValidators: true });
    return this.findOne({ _id });
  }

  /**
   * Save messenger appearance data
   * @param {string} _id
   * @param {Object} object - MessengerUiOptions object TODO: need more elaborate documentation
   * @param {string} object.color - MessengerUiOptions color TODO: need more elaborate documentation
   * @param {string} object.wallpaper - MessengerUiOptions wallpaper
   * @param {string} object.logo - Messenger logo TODO: need more elaborate documentation
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
  * @param {Boolean} doc.messengerData.notifyCustomer - Identicates whether
  *    customer should be notified or not TODO: need more elaborate documentation
  * @param {string} doc.messengerData.availabilityMethod - Sets messenger
  *    availability method as auto or manual TODO: need more elaborate documentation
  * @param {Boolean} doc.messengerData.isOnline - Identicates whether messenger in online or not
  * @param {Object[]} doc.messengerData.onlineHours - OnlineHours object array
  * @param {string} doc.messengerData.onlineHours.day - OnlineHours day
  * @param {string} doc.messengerData.onlineHours.from - OnlineHours from
  * @param {string} doc.messengerData.onlineHours.to  - OnlineHours to
  * @param {string} doc.messengerData.timezone - Timezone
  * @param {string} doc.messengerData.welcomeMessage - Message displayed on welcome
  *    TODO: need more elaborate documentation
  * @param {string} doc.messengerData.awayMessage - Message displayed when status becomes away
  *    TODO: need more elaborate documentation
  * @param {string} doc.messengerData.thankYouMessage - Thank you message
  *    TODO: need more elaborate documentation
  * @param {string} doc.messengerData.uiOptions.color - Color of messenger
  * @param {string} doc.messengerData.uiOptions.wallpaper - Wallpaper image for messenger
  * @param {string} doc.messengerData.uiOptions.logo - Logo used in the embedded messenger
  * @return {Promise} returns Promise resolving updated Integration document
  */
  static async saveMessengerConfigs(_id, messengerData) {
    await this.update({ _id }, { $set: { messengerData } }, { runValidators: true });
    return this.findOne({ _id });
  }

  /**
   * Create a form kind integration
   * @param {Object} args.formData - FormData object
   * @param {string} doc.formData.loadType - Load types for the embedded form
   * @param {string} doc.formData.successAction - TODO: need more elaborate documentation
   * @param {string} doc.formData.formEmail - TODO: need more elaborate documentation
   * @param {string} doc.formData.userEmailTitle - TODO: need more elaborate documentation
   * @param {string} doc.formData.userEmailContent - TODO: need more elaborate documentation
   * @param {Email[]} doc.formData.adminEmails - TODO: need more elaborate documentation
   * @param {string} doc.formData.adminEmailTitle - TODO: need more elaborate documentation
   * @param {string} doc.formData.adminEmailContent - TODO: need more elaborate documentation
   * @param {string} doc.formData.thankContent - TODO: need more elaborate documentation
   * @param {string} doc.formData.redirectUrl - Form redirectUrl on submit
   * @param {string} args.mainDoc - Integration main document object
   * @param {string} args.mainDoc.name - Integration name
   * @param {string} args.mainDoc.brandId - Integration brand id
   * @param {string} args.mainDoc.formId - Form id related to this integration
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
   * @param {string} doc.formData.loadType - Load types for the embedded form
   * @param {string} doc.formData.successAction - TODO: need more elaborate documentation
   * @param {string} doc.formData.formEmail - TODO: need more elaborate documentation
   * @param {string} doc.formData.userEmailTitle - TODO: need more elaborate documentation
   * @param {string} doc.formData.userEmailContent - TODO: need more elaborate documentation
   * @param {Email[]} doc.formData.adminEmails - TODO: need more elaborate documentation
   * @param {string} doc.formData.adminEmailTitle - TODO: need more elaborate documentation
   * @param {string} doc.formData.adminEmailContent - TODO: need more elaborate documentation
   * @param {string} doc.formData.thankContent - TODO: need more elaborate documentation
   * @param {string} doc.formData.redirectUrl - Form redirectUrl on submit
   * @param {string} args.mainDoc - Integration main document object
   * @param {string} args.mainDoc.name - Integration name
   * @param {string} args.mainDoc.brandId - Integration brand id
   * @param {string} args.mainDoc.formId - Form id related to this integration
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
    await Messages.remove({ conversationId: { $in: conversationIds } });

    // Remove conversations
    await Conversations.remove({ integrationId: _id });

    // Remove customers
    await Customers.remove({ integrationId: _id });

    return this.remove({ _id });
  }
}

IntegrationSchema.loadClass(Integration);
export default mongoose.model('integrations', IntegrationSchema);
