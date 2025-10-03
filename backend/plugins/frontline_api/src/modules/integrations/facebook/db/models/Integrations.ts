import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { integrationSchema } from '@/integrations/facebook/db/definitions/integrations';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
export interface IFacebookIntegrationModel
  extends Model<IFacebookIntegrationDocument> {
  getIntegration(selector): Promise<IFacebookIntegrationDocument>;
}

export const loadFacebookIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegration(selector) {
      const integration = await models.FacebookIntegrations.findOne(selector);

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
