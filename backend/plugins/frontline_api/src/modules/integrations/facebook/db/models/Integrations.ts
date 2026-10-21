import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { debugError } from '@/integrations/facebook/debuggers';
import { notifyIntegrationBroken } from '@/integrations/healthNotification';
import { integrationSchema } from '@/integrations/facebook/db/definitions/integrations';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';

export type TFacebookUnhealthyStatus = 'page-token' | 'account-token';

export interface IFacebookIntegrationModel
  extends Model<IFacebookIntegrationDocument> {
  getIntegration(selector): Promise<IFacebookIntegrationDocument>;
  markUnhealthy(
    selector: FilterQuery<IFacebookIntegrationDocument>,
    healthStatus: TFacebookUnhealthyStatus,
    error: string,
  ): Promise<void>;
}

export const loadFacebookIntegrationClass = (
  models: IModels,
  subdomain: string,
) => {
  class Integration {
    public static async getIntegration(selector) {
      const integration = await models.FacebookIntegrations.findOne(selector);

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    }

    public static async markUnhealthy(
      selector: FilterQuery<IFacebookIntegrationDocument>,
      healthStatus: TFacebookUnhealthyStatus,
      error: string,
    ) {
      // Notify only on the healthy → broken transition; repeat failures stay quiet
      const newlyBroken = await models.FacebookIntegrations.find({
        ...selector,
        healthStatus: { $in: [null, 'healthy'] },
      }).lean();

      await models.FacebookIntegrations.updateMany(selector, {
        $set: { healthStatus, error },
      });

      for (const integration of newlyBroken) {
        try {
          await notifyIntegrationBroken(models, subdomain, {
            provider: 'Facebook',
            integrationId: integration.erxesApiId,
            error,
          });
        } catch (e) {
          // a failed notification must not mask the original Facebook error
          debugError(
            `Failed to notify about facebook integration ${integration.erxesApiId}: ${e.message}`,
          );
        }
      }
    }
  }

  integrationSchema.loadClass(Integration);

  return integrationSchema;
};
