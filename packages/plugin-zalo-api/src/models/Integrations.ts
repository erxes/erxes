import { Document, Model, Schema } from 'mongoose';

import { IModels } from '.';
import { field } from './definitions/utils';
import { debug } from '../configs';

export interface IIntegration {
  kind: string;
  accountId: string;
  erxesApiId: string;
  oa_id?: string[];
  zaloPageTokensMap?: { [key: string]: string };
  expiration?: string;
  error?: string;
  brandId?: string;
  channelIds?: string[];
}

export interface IIntegrationDocument extends IIntegration, Document {}

// schema for integration document
export const integrationSchema = new Schema({
  _id: field({ pkey: true }),
  kind: String,
  accountId: String,
  erxesApiId: String,
  oa_id: field({
    type: [String],
    label: 'zalo oa ids',
    optional: true
  }),
  expiration: String,
  error: String,
  brandId: String
});

export interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegration(selector): Promise<IIntegrationDocument>;
}

export const loadIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegration(selector) {
      const integration = await models.Integrations.findOne(selector);

      if (!integration) {
        debug.error(
          `Integration not found ${JSON.stringify({ integration, selector })}`
        );
      }

      return integration;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
