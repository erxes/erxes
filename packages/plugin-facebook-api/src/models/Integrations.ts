import { Document, Model, Schema } from 'mongoose';

import { IModels } from '../connectionResolver';
import { field } from './definitions/utils';

export interface IIntegration {
  kind: string;
  accountId: string;
  emailScope?: string;
  erxesApiId: string;
  facebookPageIds?: string[];
  facebookPageTokensMap?: { [key: string]: string };
  email: string;
  expiration?: string;
  healthStatus?: string;
  error?: string;
}

export interface IIntegrationDocument extends IIntegration, Document {}

// schema for integration document
export const integrationSchema = new Schema({
  _id: field({ pkey: true }),
  kind: String,
  accountId: String,
  erxesApiId: String,
  emailScope: String,
  facebookPageIds: field({
    type: [String],
    label: 'Facebook page ids',
    optional: true
  }),
  email: String,
  expiration: String,
  facebookPageTokensMap: field({
    type: Object,
    default: {}
  }),
  healthStatus: String,
  error: String
});

export interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(selector): Promise<IIntegrationDocument>;
}

export const loadIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegration(selector) {
      const integration = await models.Integrations.findOne(selector);

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
