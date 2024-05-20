import { Model } from 'mongoose';
import {
  IIntegration,
  IIntegrationDocument,
  integrationSchema,
} from './definitions/integrations';
import { IModels } from '../connectionResolver';

export interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegrations(userId: string): Promise<IIntegrationDocument>;
  getIntegration(
    userId: string,
    integrationId?: string,
  ): Promise<IIntegrationDocument>;
}

export const loadIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegrations(
      userId: string,
      integrationId?: string,
    ) {
      let integrations = await models.Integrations.find({
        'operators.userId': userId,
      }).lean();

      if (!integrations) {
        return [];
      }

      if (integrationId) {
        const a = integrations.map((integration: IIntegration) => {
          return integration.inboxId === integrationId;
        });
      }

      const filteredIntegration = integrations.map((item: IIntegration) => {
        let integration = item;

        const filteredOperators = integration.operators.filter(
          (operator) => operator.userId === userId,
        );

        return { ...integration, operators: filteredOperators };
      });

      return filteredIntegration;
    }
    public static async getIntegration(userId: string, integrationId: string) {
      const integration = await models.Integrations.findOne({
        inboxId: integrationId,
        'operators.userId': userId,
      });

      return integration;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
