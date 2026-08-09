import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { integrationSchema } from '@/integrations/whatsapp/db/definitions/integrations';
import { IWhatsappIntegrationDocument } from '@/integrations/whatsapp/@types';

export interface IWhatsappIntegrationModel
  extends Model<IWhatsappIntegrationDocument> {
  getIntegration(selector): Promise<IWhatsappIntegrationDocument>;
}

export const loadWhatsappIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegration(selector) {
      const integration = await models.WhatsappIntegrations.findOne(selector);

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
