import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { callProIntegrationSchema } from '@/integrations/callpro/db/definitions/integrations';
import { ICallProIntegrationDocument } from '@/integrations/callpro/@types/integrations';

export interface ICallProIntegrationModel
  extends Model<ICallProIntegrationDocument> {
  getIntegration(
    selector: FilterQuery<ICallProIntegrationDocument>,
  ): Promise<ICallProIntegrationDocument>;
}

export const loadCallProIntegrationClass = (models: IModels) => {
  // skipcq: JS-0327
  class Integration {
    public static async getIntegration(
      selector: FilterQuery<ICallProIntegrationDocument>,
    ) {
      const integration = await models.CallProIntegrations.findOne(selector);

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }
  }

  callProIntegrationSchema.loadClass(Integration);

  return callProIntegrationSchema;
};
