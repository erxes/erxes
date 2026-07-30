import {
  emailSenderSchema,
  IEmailSenderDocument,
} from 'erxes-api-shared/core-modules';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface IEmailSenderModel extends Model<IEmailSenderDocument> {
  claimSender(doc: {
    email: string;
    name?: string;
    type?: 'single' | 'domain';
    scope: string;
    providerId?: string;
  }): Promise<IEmailSenderDocument | null>;
  revokeSender(email: string, scope: string): Promise<void>;
  listActive(scope: string): Promise<IEmailSenderDocument[]>;
}

export const loadEmailSenderClass = (models: IModels) => {
  class EmailSender {
    /**
     * Records that this organization registered the address. Re-claiming an
     * address it already revoked brings it back rather than failing on the
     * unique index.
     */
    public static async claimSender(doc: {
      email: string;
      name?: string;
      type?: 'single' | 'domain';
      scope: string;
      providerId?: string;
    }) {
      return models.EmailSenders.findOneAndUpdate(
        { email: doc.email.toLowerCase().trim(), scope: doc.scope },
        {
          $set: {
            name: doc.name,
            type: doc.type || 'single',
            providerId: doc.providerId,
            state: 'active',
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true, new: true },
      );
    }

    /**
     * Drops the organization's claim without touching the provider — the sender
     * may well belong to another organization on the same account too.
     */
    public static async revokeSender(email: string, scope: string) {
      await models.EmailSenders.updateOne(
        { email: email.toLowerCase().trim(), scope },
        { $set: { state: 'revoked', updatedAt: new Date() } },
      );
    }

    public static async listActive(scope: string) {
      return models.EmailSenders.find({ scope, state: 'active' }).lean();
    }
  }

  emailSenderSchema.loadClass(EmailSender);

  return emailSenderSchema;
};
