import { Model, model, Query } from 'mongoose';
import 'mongoose-type-email';
import { ConversationMessages, Conversations, Customers, Forms } from '.';
import { KIND_CHOICES } from './definitions/constants';
import {
  IIntegration,
  IIntegrationDocument,
  ILeadData,
  IMessengerData,
  integrationSchema,
  IUiOptions,
} from './definitions/integrations';

export interface IMessengerIntegration {
  kind: string;
  name: string;
  brandId: string;
  languageCode: string;
}

export interface IExternalIntegrationParams {
  kind: string;
  name: string;
  brandId: string;
  accountId: string;
}

interface IIntegrationBasicInfo {
  name: string;
  brandId: string;
}

export interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(_id: string): IIntegrationDocument;
  findIntegrations(query: any, options?: any): Query<IIntegrationDocument[]>;
  generateLeadDoc(mainDoc: IIntegration, leadData: ILeadData): IIntegration;
  createIntegration(doc: IIntegration, userId: string): Promise<IIntegrationDocument>;
  createMessengerIntegration(doc: IIntegration, userId: string): Promise<IIntegrationDocument>;
  updateMessengerIntegration(_id: string, doc: IIntegration): Promise<IIntegrationDocument>;
  saveMessengerAppearanceData(_id: string, doc: IUiOptions): Promise<IIntegrationDocument>;
  saveMessengerConfigs(_id: string, messengerData: IMessengerData): Promise<IIntegrationDocument>;
  createLeadIntegration(doc: IIntegration, userId: string): Promise<IIntegrationDocument>;
  updateLeadIntegration(_id: string, doc: IIntegration): Promise<IIntegrationDocument>;
  createExternalIntegration(doc: IExternalIntegrationParams, userId: string): Promise<IIntegrationDocument>;
  removeIntegration(_id: string): void;
  updateBasicInfo(_id: string, doc: IIntegrationBasicInfo): Promise<IIntegrationDocument>;
}

export const loadClass = () => {
  class Integration {
    /**
     * Retreives integration
     */
    public static async getIntegration(_id: string) {
      const integration = await Integrations.findOne({ _id });

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }

    /**
     * Find integrations
     */
    public static findIntegrations(query, options) {
      return Integrations.find({ ...query, isActive: { $ne: false } }, options);
    }

    /**
     * Generate lead integration data based on the given lead data (leadData)
     * and integration data (mainDoc)
     */
    public static generateLeadDoc(mainDoc: IIntegration, leadData: ILeadData) {
      return {
        ...mainDoc,
        kind: KIND_CHOICES.LEAD,
        leadData,
      };
    }

    /**
     * Create an integration, intended as a private method
     */
    public static createIntegration(doc: IIntegration, userId: string) {
      return Integrations.create({ ...doc, isActive: true, createdUserId: userId });
    }

    /**
     * Create a messenger kind integration
     */
    public static createMessengerIntegration(doc: IMessengerIntegration, userId: string) {
      return this.createIntegration({ ...doc, kind: KIND_CHOICES.MESSENGER }, userId);
    }

    /**
     * Update messenger integration document
     */
    public static async updateMessengerIntegration(_id: string, doc: IMessengerIntegration) {
      await Integrations.updateOne({ _id }, { $set: doc }, { runValidators: true });

      return Integrations.findOne({ _id });
    }

    /**
     * Save messenger appearance data
     */
    public static async saveMessengerAppearanceData(_id: string, { color, wallpaper, logo }: IUiOptions) {
      await Integrations.updateOne(
        { _id },
        { $set: { uiOptions: { color, wallpaper, logo } } },
        { runValdatiors: true },
      );

      return Integrations.findOne({ _id });
    }

    /**
     * Saves messenger data to integration document
     */
    public static async saveMessengerConfigs(_id: string, messengerData: IMessengerData) {
      await Integrations.updateOne({ _id }, { $set: { messengerData } });
      return Integrations.findOne({ _id });
    }

    /**
     * Create a lead kind integration
     */
    public static createLeadIntegration({ leadData = {}, ...mainDoc }: IIntegration, userId: string) {
      const doc = this.generateLeadDoc({ ...mainDoc }, leadData);

      if (Object.keys(leadData).length === 0) {
        throw new Error('leadData must be supplied');
      }

      return Integrations.createIntegration(doc, userId);
    }

    /**
     * Create external integrations like facebook, twitter integration
     */
    public static createExternalIntegration(
      doc: IExternalIntegrationParams,
      userId: string,
    ): Promise<IIntegrationDocument> {
      return Integrations.createIntegration(doc, userId);
    }

    /**
     * Update lead integration
     */
    public static async updateLeadIntegration(_id: string, { leadData = {}, ...mainDoc }: IIntegration) {
      const doc = this.generateLeadDoc(mainDoc, leadData);

      await Integrations.updateOne({ _id }, { $set: doc }, { runValidators: true });

      return Integrations.findOne({ _id });
    }

    /**
     * Remove integration in addition with its messages, conversations, customers
     */
    public static async removeIntegration(_id: string) {
      const integration = await Integrations.findOne({ _id });

      if (!integration) {
        throw new Error('Integration not found');
      }

      // remove conversations =================
      const conversations = await Conversations.find({ integrationId: _id }, { _id: true });
      const conversationIds = conversations.map(conv => conv._id);

      await ConversationMessages.deleteMany({
        conversationId: { $in: conversationIds },
      });

      await Conversations.deleteMany({ integrationId: _id });

      // Remove customers ==================
      const customers = await Customers.find({ integrationId: _id });
      const customerIds = customers.map(cus => cus._id);

      await Customers.removeCustomers(customerIds);

      // Remove form
      if (integration.formId) {
        await Forms.removeForm(integration.formId);
      }

      return Integrations.deleteMany({ _id });
    }

    public static async updateBasicInfo(_id: string, doc: IIntegrationBasicInfo) {
      const integration = await Integrations.findOne({ _id });

      if (!integration) {
        throw new Error('Integration not found');
      }

      await Integrations.updateOne({ _id }, { $set: doc });

      return Integrations.findOne({ _id });
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};

loadClass();

// tslint:disable-next-line
const Integrations = model<IIntegrationDocument, IIntegrationModel>('integrations', integrationSchema);

export default Integrations;
