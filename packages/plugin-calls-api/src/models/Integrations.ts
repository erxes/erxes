import { Model } from 'mongoose';
import {
  IIntegrationDocument,
  integrationSchema
} from './definitions/integrations';
import { IModels } from '../connectionResolver';

export interface IIntegrationModel extends Model<IIntegrationDocument> {
  getIntegrations(userId: string): Promise<IIntegrationDocument>;
}

export const loadIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegrations(userId: string) {
      const integrations = await models.Integrations.find({
        'operators.userId': userId
      });

      if (!integrations) {
        return [];
      }
      const filteredIntegrations = integrations.map(integration => {
        const filteredOperators = integration.operators.filter(
          operator => operator.userId === userId
        );
        return { ...integration, operators: filteredOperators };
      });

      return filteredIntegrations;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
