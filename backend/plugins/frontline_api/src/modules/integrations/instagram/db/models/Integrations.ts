import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import { debugError } from '@/integrations/instagram/debuggers';
import { notifyIntegrationBroken } from '@/integrations/healthNotification';
import { integrationSchema } from '../definitions/integrations';

export interface IInstagramIntegrationModel extends Model<IInstagramIntegrationDocument> {
  getIntegration(selector): Promise<IInstagramIntegrationDocument>;
  markUnhealthy(
    selector: FilterQuery<IInstagramIntegrationDocument>,
    healthStatus: 'page-token' | 'account-token',
    error: string,
  ): Promise<void>;
}

export const loadInstagramIntegrationClass = (
  models: IModels,
  subdomain: string,
) => {
  class Integration {
    public static async getIntegration(selector) {
      const integration = await models.InstagramIntegrations.findOne(selector);

      if (!integration) {
        throw new Error('Instagram Integration not found ');
      }

      return integration;
    }

    public static async markUnhealthy(
      selector: FilterQuery<IInstagramIntegrationDocument>,
      healthStatus: 'page-token' | 'account-token',
      error: string,
    ) {
      // Notify only on the healthy → broken transition; repeat failures stay quiet
      const newlyBroken = await models.InstagramIntegrations.find({
        ...selector,
        healthStatus: { $in: [null, 'healthy'] },
      }).lean();

      await models.InstagramIntegrations.updateMany(selector, {
        $set: { healthStatus, error },
      });

      for (const integration of newlyBroken) {
        try {
          await notifyIntegrationBroken(models, subdomain, {
            provider: 'Instagram',
            integrationId: integration.erxesApiId,
            error,
          });
        } catch (e) {
          // a failed notification must not mask the original Instagram error
          debugError(
            `Failed to notify about instagram integration ${integration.erxesApiId}: ${e.message}`,
          );
        }
      }
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
