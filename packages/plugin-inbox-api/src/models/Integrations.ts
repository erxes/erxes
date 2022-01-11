import { Model, model, Query } from 'mongoose';

import {
  ConversationMessages,
  Conversations,
} from '.';
import { Customers } from '../apiCollections';

import {
  IIntegration,
  IIntegrationDocument,
  integrationSchema,
} from './definitions/integrations';

export interface IMessengerIntegration {
  kind: string;
  name: string;
  brandId: string;
  languageCode: string;
  channelIds?: string[];
}

export interface IExternalIntegrationParams {
  kind: string;
  name: string;
  brandId: string;
  accountId: string;
  channelIds?: string[];
}

interface IIntegrationBasicInfo {
  name: string;
  brandId: string;
}

/**
 * Extracts hour & minute from time string formatted as "HH:mm am|pm".
 * Time string is defined as constant in modules/settings/integrations/constants.
 */

export interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(doc: { [key: string]: any }): IIntegrationDocument;
  findIntegrations(query: any, options?: any): Query<IIntegrationDocument[]>;
  findAllIntegrations(query: any, options?: any): Query<IIntegrationDocument[]>;
  findLeadIntegrations(query: any, args: any): Query<IIntegrationDocument[]>;
  createIntegration(
    doc: IIntegration,
    userId: string
  ): Promise<IIntegrationDocument>;
  removeIntegration(_id: string): void;
  updateBasicInfo(
    _id: string,
    doc: IIntegrationBasicInfo
  ): Promise<IIntegrationDocument>;
}

export const loadClass = () => {
  class Integration {
    /**
     * Retreives integration
     */
    public static async getIntegration(doc: any) {
      const integration = await Integrations.findOne(doc);

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

    public static findAllIntegrations(query: any, options: any) {
      return Integrations.find({ ...query }, options);
    }

    /**
     * Create external integrations like facebook, twitter integration
     */
    public static createExternalIntegration(
      doc: IExternalIntegrationParams,
      userId: string
    ): Promise<IIntegrationDocument> {
      return Integrations.createIntegration(doc, userId);
    }

    /**
     * Remove integration in addition with its messages, conversations, customers
     */
    public static async removeIntegration(_id: string) {
      const integration = await Integrations.getIntegration({ _id });

      // remove conversations =================
      const conversations = await Conversations.find(
        { integrationId: _id },
        { _id: true }
      );
      const conversationIds = conversations.map(conv => conv._id);

      await ConversationMessages.deleteMany({
        conversationId: { $in: conversationIds }
      });

      await Conversations.deleteMany({ integrationId: _id });

      // Remove customers ==================
      const customers = await Customers().find({ integrationId: _id });
      const customerIds = customers.map(cus => cus._id);

      await Customers().removeCustomers(customerIds);

      return Integrations.deleteMany({ _id });
    }

    public static async updateBasicInfo(
      _id: string,
      doc: IIntegrationBasicInfo
    ) {
      await Integrations.updateOne({ _id }, { $set: doc });

      return Integrations.findOne({ _id });
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};

loadClass();

// tslint:disable-next-line
const Integrations = model<IIntegrationDocument, IIntegrationModel>(
  'integrations',
  integrationSchema
);

export default Integrations;
