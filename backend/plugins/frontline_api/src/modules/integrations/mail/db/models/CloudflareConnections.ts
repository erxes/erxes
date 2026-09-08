import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { mailCloudflareSchema } from '@/integrations/mail/db/definitions/cloudflare';
import {
  IMailCloudflare,
  IMailCloudflareDocument,
  TMailProvisionState,
} from '@/integrations/mail/@types/cloudflare';
import { MAIL_CLOUDFLARE_STATUSES } from '@/integrations/mail/constants';

const MAIL_CLOUDFLARE_SINGLETON_ID = 'mail-cloudflare';

export interface IMailCloudflareModel extends Model<IMailCloudflareDocument> {
  current(): Promise<IMailCloudflareDocument | null>;
  currentOrThrow(): Promise<IMailCloudflareDocument>;
  upsert(doc: IMailCloudflare): Promise<IMailCloudflareDocument>;
  markStep(
    name: string,
    state: TMailProvisionState,
    error?: string,
  ): Promise<void>;
  markConnected(
    patch: Partial<IMailCloudflare>,
  ): Promise<IMailCloudflareDocument>;
  markFailed(error: string): Promise<IMailCloudflareDocument>;
  clear(): Promise<void>;
}

export const loadMailCloudflareClass = (models: IModels) => {
  // skipcq: JS-0327
  class CloudflareConnection {
    public static async current() {
      return await models.MailCloudflare.findOne({});
    }

    public static async currentOrThrow() {
      const connection = await models.MailCloudflare.findOne({});

      if (!connection) {
        throw new Error('No Cloudflare account is connected to this workspace');
      }

      return connection;
    }

    public static async upsert(doc: IMailCloudflare) {
      await models.MailCloudflare.updateOne(
        { _id: MAIL_CLOUDFLARE_SINGLETON_ID },
        { $set: { ...doc, updatedAt: new Date() } },
        { upsert: true },
      );

      return await models.MailCloudflare.currentOrThrow();
    }

    public static async markStep(
      name: string,
      state: TMailProvisionState,
      error?: string,
    ) {
      const connection = await models.MailCloudflare.currentOrThrow();
      const steps = (connection.steps ?? []).filter(
        (step) => step.name !== name,
      );

      steps.push({ name, state, error, ranAt: new Date() });

      await models.MailCloudflare.updateOne(
        { _id: connection._id },
        { $set: { steps, updatedAt: new Date() } },
      );
    }

    public static async markConnected(patch: Partial<IMailCloudflare>) {
      const connection = await models.MailCloudflare.currentOrThrow();

      await models.MailCloudflare.updateOne(
        { _id: connection._id },
        {
          $set: {
            ...patch,
            status: MAIL_CLOUDFLARE_STATUSES.CONNECTED,
            error: '',
            connectedAt: new Date(),
            updatedAt: new Date(),
          },
        },
      );

      return await models.MailCloudflare.currentOrThrow();
    }

    public static async markFailed(error: string) {
      const connection = await models.MailCloudflare.currentOrThrow();

      await models.MailCloudflare.updateOne(
        { _id: connection._id },
        {
          $set: {
            status: MAIL_CLOUDFLARE_STATUSES.ERROR,
            error,
            updatedAt: new Date(),
          },
        },
      );

      return await models.MailCloudflare.currentOrThrow();
    }

    public static async clear() {
      await models.MailCloudflare.deleteMany({});
    }
  }

  mailCloudflareSchema.loadClass(CloudflareConnection);

  return mailCloudflareSchema;
};
