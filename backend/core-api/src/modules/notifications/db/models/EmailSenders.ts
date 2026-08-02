import {
  emailSenderSchema,
  IEmailSenderDocument,
  TEmailSenderState,
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
    state?: TEmailSenderState;
    verificationToken?: string;
  }): Promise<IEmailSenderDocument | null>;
  revokeSender(email: string, scope: string): Promise<void>;
  listActive(scope: string): Promise<IEmailSenderDocument[]>;
  listClaimed(scope: string): Promise<IEmailSenderDocument[]>;
  confirmByToken(token: string): Promise<IEmailSenderDocument | null>;
  hasActiveDomain(scope: string): Promise<boolean>;
}

const TOKEN_TTL_HOURS = 24;

export const loadEmailSenderClass = (models: IModels) => {
  class EmailSender {
    public static async claimSender(doc: {
      email: string;
      name?: string;
      type?: 'single' | 'domain';
      scope: string;
      providerId?: string;
      state?: TEmailSenderState;
      verificationToken?: string;
    }) {
      const state = doc.state || 'pending';

      return models.EmailSenders.findOneAndUpdate(
        { email: doc.email.toLowerCase().trim(), scope: doc.scope },
        {
          $set: {
            name: doc.name,
            type: doc.type || 'single',
            providerId: doc.providerId,
            state,
            verificationToken: doc.verificationToken,
            ...(doc.verificationToken
              ? { verificationSentAt: new Date() }
              : {}),
            ...(state === 'active' ? { verifiedAt: new Date() } : {}),
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() },
        },
        { upsert: true, new: true },
      );
    }

    public static async confirmByToken(token: string) {
      const cutoff = new Date(Date.now() - TOKEN_TTL_HOURS * 60 * 60 * 1000);

      return models.EmailSenders.findOneAndUpdate(
        {
          verificationToken: token,
          verificationSentAt: { $gte: cutoff },
          state: 'pending',
        },
        {
          $set: {
            state: 'active',
            verifiedAt: new Date(),
            updatedAt: new Date(),
          },
          $unset: { verificationToken: '' },
        },
        { new: true },
      );
    }

    public static async revokeSender(email: string, scope: string) {
      await models.EmailSenders.updateOne(
        { email: email.toLowerCase().trim(), scope },
        { $set: { state: 'revoked', updatedAt: new Date() } },
      );
    }

    public static async listActive(scope: string) {
      return models.EmailSenders.find({ scope, state: 'active' }).lean();
    }

    public static async hasActiveDomain(scope: string) {
      return !!(await models.EmailSenders.exists({
        scope,
        type: 'domain',
        state: 'active',
      }));
    }

    public static async listClaimed(scope: string) {
      return models.EmailSenders.find({
        scope,
        state: { $in: ['pending', 'active'] },
      })
        .sort({ createdAt: -1 })
        .lean();
    }
  }

  emailSenderSchema.loadClass(EmailSender);

  return emailSenderSchema;
};
