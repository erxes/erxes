import { Model, model } from "mongoose";
import "mongoose-type-email";
import { ConversationMessages, Conversations, Customers, Forms } from ".";
import { KIND_CHOICES } from "../../data/constants";

import {
  IIntegrationDocument,
  integrationSchema
} from "./definitions/integrations";

interface IIntegrationModel extends Model<IIntegrationDocument> {
  generateFormDoc(mainDoc: any, formData: any): any;
  createIntegration(doc: any): Promise<IIntegrationDocument>;
}

class Integration {
  /**
   * Generate form integration data based on the given form data (formData)
   * and integration data (mainDoc)
   * @param {Integration} mainDoc - Integration doc without subdocuments
   * @param {FormData} formData - Integration forData subdocument
   * @return {Object} returns an integration object
   */
  public static generateFormDoc(mainDoc, formData) {
    return {
      ...mainDoc,
      kind: KIND_CHOICES.FORM,
      formData
    };
  }

  /**
   * Create an integration, intended as a private method
   * @param {Object} doc - Integration doc
   * @return {Promise} returns integration document promise
   */
  public static createIntegration(doc) {
    return Integrations.create(doc);
  }

  /**
   * Create a messenger kind integration
   * @param {Object} object - Integration doc
   * @param {string} object.name - Integration name
   * @param {String} object.brandId - Integration brand id
   * @return {Promise} returns integration document promise
   */
  public static createMessengerIntegration(doc) {
    return this.createIntegration({
      ...doc,
      kind: KIND_CHOICES.MESSENGER
    });
  }

  /**
   * Create twitter integration
   * @param {Object} doc - Integration doc
   * @return {Promise} returns integration document promise
   */
  public static async createTwitterIntegration({ name, brandId, twitterData }) {
    const prevEntry = await Integrations.findOne({
      twitterData: { $exists: true },
      "twitterData.info.id": twitterData.info.id
    });

    // check duplication
    if (prevEntry) {
      throw new Error("Already added");
    }

    return this.createIntegration({
      name,
      brandId,
      kind: KIND_CHOICES.TWITTER,
      twitterData
    });
  }

  /**
   * Create facebook integration
   * @param {Object} doc - Integration doc
   * @return {Promise} returns integration document promise
   */
  public static createFacebookIntegration({ name, brandId, facebookData }) {
    return this.createIntegration({
      name,
      brandId,
      kind: KIND_CHOICES.FACEBOOK,
      facebookData
    });
  }

  /**
   * Update messenger integration document
   * @param {Object} object - Integration main doc object
   * @param {string} object.name - Integration name
   * @param {string} object.brandId - Integration brand id
   * @return {Promise} returns Promise resolving updated Integration document
   */
  public static async updateMessengerIntegration(_id, doc) {
    await Integrations.update({ _id }, { $set: doc }, { runValidators: true });

    return Integrations.findOne({ _id });
  }

  /**
   * Save messenger appearance data
   * @param {string} _id
   * @param {Object} object - MessengerUiOptions object
   * @return {Promise} returns Promise resolving updated Integration document
   */
  public static async saveMessengerAppearanceData(
    _id,
    { color, wallpaper, logo }
  ) {
    await Integrations.update(
      { _id },
      { $set: { uiOptions: { color, wallpaper, logo } } },
      { runValdatiors: true }
    );

    return Integrations.findOne({ _id });
  }

  /**
   * Saves messenger data to integration document
   * @param {Object} doc.messengerData - MessengerData object
   * @return {Promise} returns Promise resolving updated Integration document
   */
  public static async saveMessengerConfigs(_id, messengerData) {
    await Integrations.update(
      { _id },
      { $set: { messengerData } },
      { runValidators: true }
    );

    return Integrations.findOne({ _id });
  }

  /**
   * Create a form kind integration
   * @param {Object} args.formData - FormData object
   * @return {Promise} returns form integration document promise
   * @throws {Exception} throws Exception if formData is notSupplied
   */
  public static createFormIntegration({ formData, ...mainDoc }) {
    const doc = this.generateFormDoc(mainDoc, formData);

    if (Object.keys(formData || {}).length === 0) {
      throw new Error("formData must be supplied");
    }

    return Integrations.create(doc);
  }

  /**
   * Update form integration
   * @param {string} _id integration id
   * @param {Object} args.formData - FormData object
   * @return {Promise} returns Promise resolving updated Integration document
   */
  public static async updateFormIntegration(_id, { formData, ...mainDoc }) {
    const doc = this.generateFormDoc(mainDoc, formData);

    await Integrations.update({ _id }, { $set: doc }, { runValidators: true });

    return Integrations.findOne({ _id });
  }

  /**
   * Remove integration in addition with its messages, conversations, customers
   * @param {string} id - Integration id
   * @return {Promise}
   */
  public static async removeIntegration(_id) {
    const integration = await Integrations.findOne({ _id });

    // remove conversations =================
    const conversations = await Conversations.find(
      { integrationId: _id },
      { _id: true }
    );

    const conversationIds = conversations.map(conv => conv._id);

    await ConversationMessages.remove({
      conversationId: { $in: conversationIds }
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

    return Integrations.remove({ _id });
  }
}

integrationSchema.loadClass(Integration);

const Integrations = model<IIntegrationDocument, IIntegrationModel>(
  "integrations",
  integrationSchema
);

export default Integrations;
