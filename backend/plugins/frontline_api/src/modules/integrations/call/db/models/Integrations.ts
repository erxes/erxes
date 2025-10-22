import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

import {
  ICallIntegration,
  ICallIntegrationDocument,
} from '@/integrations/call/@types/integrations';
import { integrationSchema } from '@/integrations/call/db/definitions/integrations';

export interface ICallIntegrationModel extends Model<ICallIntegrationDocument> {
  getIntegrations(userId: string): Promise<ICallIntegrationDocument>;
  getIntegration(
    userId: string,
    integrationId?: string,
  ): Promise<ICallIntegrationDocument>;
}

export const loadCallIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegrations(userId: string) {
      const integrations = await models.CallIntegrations.find({
        'operators.userId': userId,
      }).lean();

      if (!integrations) {
        return [];
      }

      const filteredIntegration = integrations.map((item: ICallIntegration) => {
        const integration = item;

        const filteredOperators = integration.operators.filter(
          (operator) => operator.userId === userId,
        );

        return { ...integration, operators: filteredOperators };
      });

      return filteredIntegration;
    }
    public static async getIntegration(userId: string, integrationId: string) {
      const integration = await models.CallIntegrations.findOne({
        inboxId: integrationId,
        'operators.userId': userId,
      });

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
