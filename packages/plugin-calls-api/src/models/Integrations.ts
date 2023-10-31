import { Model } from 'mongoose';
import {
  IIntegration,
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
      }).lean();

      if (!integrations) {
        return [];
      }
      const filteredIntegrations = integrations.map(
        (integration: IIntegration) => {
          const filteredOperators = integration.operators.filter(
            operator => operator.userId === userId
          );
          return { ...integration, operators: filteredOperators };
        }
      );

      return filteredIntegrations;
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
