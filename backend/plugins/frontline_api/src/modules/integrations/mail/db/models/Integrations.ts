import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { mailIntegrationSchema } from '@/integrations/mail/db/definitions/integrations';
import { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import { MAIL_HEALTH_STATUSES } from '@/integrations/mail/constants';

export interface IMailIntegrationModel extends Model<IMailIntegrationDocument> {
  findByScope(scopeId: string): Promise<IMailIntegrationDocument | null>;
  markUnhealthy(_id: string, error: string): Promise<void>;
  markHealthy(_id: string): Promise<void>;
}

export const loadMailIntegrationClass = (models: IModels) => {
  // skipcq: JS-0327
  class Integration {
    public static async findByScope(scopeId: string) {
      return models.MailIntegrations.findOne({
        $or: [{ inboxId: scopeId }, { _id: scopeId }],
      });
    }

    public static async markUnhealthy(_id: string, error: string) {
      await models.MailIntegrations.updateOne(
        { _id },
        { $set: { healthStatus: MAIL_HEALTH_STATUSES.UNHEALTHY, error } },
      );
    }

    public static async markHealthy(_id: string) {
      await models.MailIntegrations.updateOne(
        { _id, healthStatus: MAIL_HEALTH_STATUSES.UNHEALTHY },
        { $set: { healthStatus: MAIL_HEALTH_STATUSES.HEALTHY, error: '' } },
      );
    }
  }

  mailIntegrationSchema.loadClass(Integration);

  return mailIntegrationSchema;
};
