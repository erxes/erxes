import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { integrationSchema } from '@/integrations/whatsapp/db/definitions/integrations';
import { IWhatsappIntegrationDocument } from '@/integrations/whatsapp/@types';

export interface IWhatsappIntegrationModel
  extends Model<IWhatsappIntegrationDocument> {
  getIntegration(
    selector: FilterQuery<IWhatsappIntegrationDocument>,
  ): Promise<IWhatsappIntegrationDocument>;
}

/** Builds the WhatsApp integration model class bound to this tenant's models. */
export const loadWhatsappIntegrationClass = (models: IModels) => {
  /** A connected WhatsApp Business phone number and its Meta credentials. */
  class Integration {
    /** Finds one integration, throwing when there is none. */
    public static async getIntegration(
      selector: FilterQuery<IWhatsappIntegrationDocument>,
    ) {
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
