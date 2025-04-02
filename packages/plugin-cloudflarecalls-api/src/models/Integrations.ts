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
  createOrUpdateIntegration(
    _id: string,
    doc: IIntegration,
  ): Promise<IIntegrationDocument>;
}

export const loadIntegrationClass = (models: IModels) => {
  class Integration {
    public static async getIntegrations(
      userId: string,
      integrationId?: string,
    ) {
      let integrations = await models.Integrations.find({
        $or: [
          { 'departments.operators.userId': userId },
          { 'operators.userId': userId },
        ],
        status: 'active',
      }).lean();

      if (!integrations) {
        return [];
      }

      if (integrationId) {
        integrations.map((integration: IIntegration) => {
          return integration.erxesApiId === integrationId;
        });
      }

      const filteredIntegration = integrations.map((item: IIntegration) => {
        let integration = item;

        return { ...integration };
      });

      return filteredIntegration;
    }
    public static async getIntegration(userId: string, integrationId: string) {
      const integration = await models.Integrations.findOne({
        erxesApiId: integrationId,
        'operators.userId': userId,
      });

      return integration;
    }

    public static async createOrUpdateIntegration(
      _id: string,
      doc: IIntegration,
    ) {
      const integration = await models.Integrations.findOne({
        erxesApiId: _id,
      });
      if (integration) {
        await models.Integrations.updateOne(
          { erxesApiId: _id },
          {
            $set: {
              departments: doc.departments,
              status: doc.status,
              header: doc.header,
              description: doc.description,
            },
          },
        );

        return models.Integrations.findOne({ erxesApiId: _id });
      }

      return models.Integrations.create({
        departments: doc.departments,
        erxesApiId: _id,
        status: doc.status,
        header: doc.header,
        description: doc.description,
      });
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
