import { ExpectedError } from 'erxes-api-shared/utils';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  INotificationTemplateDocument,
  notificationTemplateSchema,
} from '@/notificationTemplates/db/definitions/notificationTemplates';
import { getSystemEmailTemplate } from '@/notificationTemplates/registry';
import {
  TTemplateContent,
  validateTemplateContent,
} from '@/notificationTemplates/render';

export const NOTIFICATION_TEMPLATE_CONFLICT = 'NOTIFICATION_TEMPLATE_CONFLICT';

class NotificationTemplateConflictError extends ExpectedError {
  readonly extensions = { code: NOTIFICATION_TEMPLATE_CONFLICT };

  constructor() {
    super(
      'Someone saved this template after you opened it. Reload to see their version.',
      NOTIFICATION_TEMPLATE_CONFLICT,
    );
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export interface INotificationTemplateModel
  extends Model<INotificationTemplateDocument> {
  saveDraft(
    key: string,
    doc: TTemplateContent,
    userId: string,
    draftRevision: number,
  ): Promise<INotificationTemplateDocument>;
  publish(
    key: string,
    doc: TTemplateContent,
    userId: string,
    draftRevision: number,
  ): Promise<INotificationTemplateDocument | null>;
  revert(key: string): Promise<INotificationTemplateDocument | null>;
  recordFallback(key: string, reason: string): Promise<void>;
}

export const loadNotificationTemplateClass = (models: IModels) => {
  class NotificationTemplate {
    public static async saveDraft(
      key: string,
      { subject, preheader, content, contentJson }: TTemplateContent,
      userId: string,
      draftRevision: number,
    ) {
      const doc = { subject, preheader, content, contentJson };

      validateTemplateContent(getSystemEmailTemplate(key), doc);

      try {
        const template =
          await models.NotificationTemplates.findOneAndUpdate(
            { key, draftRevision },
            {
              $set: {
                draft: { ...doc, savedBy: userId, savedAt: new Date() },
              },
              $inc: { draftRevision: 1 },
            },
            // only the first save of a template may create its row
            { new: true, upsert: draftRevision === 0 },
          );

        if (template) {
          return template;
        }
      } catch (e) {
        // a first save racing another first save hits the unique key
        if (e.code !== 11000) {
          throw e;
        }
      }

      throw new NotificationTemplateConflictError();
    }

    public static async publish(
      key: string,
      doc: TTemplateContent,
      userId: string,
      draftRevision: number,
    ) {
      const saved = await models.NotificationTemplates.saveDraft(
        key,
        doc,
        userId,
        draftRevision,
      );

      const template = await models.NotificationTemplates.findOneAndUpdate(
        { key, draftRevision: saved.draftRevision },
        {
          $set: {
            published: saved.draft,
            publishedRevision: saved.draftRevision,
          },
          $inc: { version: 1 },
        },
        { new: true },
      );

      if (!template) {
        throw new NotificationTemplateConflictError();
      }

      return template;
    }

    // back to the built-in file; the draft stays for the next edit
    public static async revert(key: string) {
      getSystemEmailTemplate(key);

      return models.NotificationTemplates.findOneAndUpdate(
        { key },
        { $unset: { published: 1, publishedRevision: 1 } },
        { new: true },
      );
    }

    public static async recordFallback(key: string, reason: string) {
      await models.NotificationTemplates.updateOne(
        { key },
        {
          $inc: { fallbackCount: 1 },
          $set: { lastFallbackAt: new Date(), lastFallbackReason: reason },
        },
      );
    }
  }

  notificationTemplateSchema.loadClass(NotificationTemplate);

  return notificationTemplateSchema;
};
