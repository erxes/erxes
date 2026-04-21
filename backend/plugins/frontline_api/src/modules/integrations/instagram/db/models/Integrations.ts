import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import { integrationSchema } from '../definitions/integrations';

export interface IInstagramIntegrationModel extends Model<IInstagramIntegrationDocument> {
  getIntegration(selector): Promise<IInstagramIntegrationDocument>;
}

export const loadInstagramIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegration(selector) {
      const integration = await models.InstagramIntegrations.findOne(selector);

      if (!integration) {
        throw new Error('Instagram Integration not found ');
      }

      return integration;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
