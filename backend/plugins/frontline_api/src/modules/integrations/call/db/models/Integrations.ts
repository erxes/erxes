import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

import {
  ICallIntegration,
  ICallIntegrationDocument,
} from '@/integrations/call/@types/integrations';
import { integrationSchema } from '@/integrations/call/db/definitions/integrations';

export interface ICallIntegrationModel extends Model<ICallIntegrationDocument> {
  getIntegrations(
    userId: string,
  ): Promise<ICallIntegrationDocument>;
  getIntegration(
    userId: string,
    integrationId: string,
  ): Promise<ICallIntegrationDocument>;
  getIntegrationQueuesByUser(
    userId: string,
  ): Promise<string[]>;
}

export const loadCallIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegrations(userId: string, isAdmin?: boolean) {
      const integrations = isAdmin
        ? await models.CallIntegrations.find().lean()
        : await models.CallIntegrations.find({
            'operators.userId': userId,
          }).lean();

      if (!integrations?.length) {
        return [];
      }

      if (isAdmin) {
        return integrations;
      }

      return integrations.map((item: ICallIntegration) => ({
        ...item,
        operators: item.operators.filter(
          (operator) => operator.userId === userId,
        ),
      }));
    }

    public static async getIntegration(
      userId: string,
      integrationId: string,
      isAdmin?: boolean,
    ) {
      const query = isAdmin
        ? { inboxId: integrationId }
        : { inboxId: integrationId, 'operators.userId': userId };

      const integration = await models.CallIntegrations.findOne(query);

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }
    public static async getIntegrationQueuesByUser(userId: string) {
      const integrations = await models.CallIntegrations.find({
        'operators.userId': userId,
      }).lean();

      if (!integrations.length) {
        throw new Error('Integration not found');
      }
      return integrations.flatMap((integration) => integration.queues || []);
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
