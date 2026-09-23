import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { mailDraftSchema } from '@/integrations/mail/db/definitions/drafts';
import {
  IMailDraft,
  IMailDraftDocument,
  IMailDraftEdit,
  IMailDraftInput,
} from '@/integrations/mail/@types/draft';
import { IMailMessageDocument } from '@/integrations/mail/@types/message';
import {
  MAIL_DELIVERY_STATUSES,
  MAIL_DRAFT_SENDING_STALE_MS,
  MAIL_DRAFT_STATUSES,
} from '@/integrations/mail/constants';
import { isDuplicateKeyError } from '@/integrations/mail/utils/mongoErrors';

export interface IMailDraftModel extends Model<IMailDraftDocument> {
  getConversationDrafts(conversationId: string): Promise<IMailDraft[]>;
  createDraft(doc: IMailDraftInput): Promise<IMailDraftDocument>;
  saveDraft(_id: string, doc: IMailDraftEdit): Promise<IMailDraftDocument>;
  removeDraft(_id: string): Promise<IMailDraftDocument>;
  approveDraft(
    _id: string,
    subdomain: string,
  ): Promise<{ draft: IMailDraftDocument; message: IMailMessageDocument }>;
}

const sendingStaleBefore = (now: number) =>
  new Date(now - MAIL_DRAFT_SENDING_STALE_MS);

const actionableDraftFilter = (_id: string, now = Date.now()) => ({
  _id,
  $or: [
    { status: MAIL_DRAFT_STATUSES.PENDING },
    {
      status: MAIL_DRAFT_STATUSES.SENDING,
      updatedAt: { $lt: sendingStaleBefore(now) },
    },
  ],
});

export const loadMailDraftClass = (models: IModels) => {
  // skipcq: JS-0327
  class Draft {
    public static async getConversationDrafts(conversationId: string) {
      const staleBefore = sendingStaleBefore(Date.now()).getTime();

      const drafts = await models.MailDrafts.find({
        inboxConversationId: conversationId,
        status: {
          $in: [MAIL_DRAFT_STATUSES.PENDING, MAIL_DRAFT_STATUSES.SENDING],
        },
      })
        .sort({ createdAt: 1 })
        .lean<IMailDraft[]>();

      return drafts.map((draft) =>
        draft.status === MAIL_DRAFT_STATUSES.SENDING &&
        draft.updatedAt.getTime() < staleBefore
          ? { ...draft, status: MAIL_DRAFT_STATUSES.PENDING }
          : draft,
      );
    }

    public static async createDraft(doc: IMailDraftInput) {
      const now = new Date();

      try {
        return await models.MailDrafts.findOneAndUpdate(
          { sourceMessageId: doc.sourceMessageId },
          {
            $setOnInsert: {
              ...doc,
              status: MAIL_DRAFT_STATUSES.PENDING,
              createdAt: now,
              updatedAt: now,
            },
          },
          { upsert: true, new: true },
        );
      } catch (e) {
        const existing = isDuplicateKeyError(e, 'sourceMessageId')
          ? await models.MailDrafts.findOne({
              sourceMessageId: doc.sourceMessageId,
            })
          : null;

        if (!existing) {
          throw e;
        }

        return existing;
      }
    }

    public static async saveDraft(_id: string, doc: IMailDraftEdit) {
      const update: Record<string, unknown> = {
        body: doc.body,
        status: MAIL_DRAFT_STATUSES.PENDING,
        updatedAt: new Date(),
      };

      if (doc.subject !== undefined) {
        update.subject = doc.subject;
      }

      const saved = await models.MailDrafts.findOneAndUpdate(
        actionableDraftFilter(_id),
        { $set: update },
        { new: true },
      );

      return saved ?? Draft.explainUnavailable(_id, 'edited');
    }

    public static async removeDraft(_id: string) {
      const removed = await models.MailDrafts.findOneAndDelete(
        actionableDraftFilter(_id),
      );

      return removed ?? Draft.explainUnavailable(_id, 'discarded');
    }

    public static async approveDraft(_id: string, subdomain: string) {
      const draft = await Draft.claimForSending(_id);

      let message: IMailMessageDocument;

      try {
        message = await models.MailMessages.createSendMail(
          {
            integrationId: draft.inboxIntegrationId,
            conversationId: draft.inboxConversationId,
            customerId: draft.customerId,
            subject: draft.subject,
            body: draft.body,
            to: draft.to,
            replyToMessageId: draft.replyToMessageId,
            references: draft.references ?? [],
            shouldResolve: draft.shouldResolve,
            draftId: draft._id,
          },
          subdomain,
        );
      } catch (e) {
        const replied = await models.MailMessages.exists({
          draftId: draft._id,
          deliveryStatus: { $ne: MAIL_DELIVERY_STATUSES.PENDING },
        });

        await models.MailDrafts.updateOne(
          { _id: draft._id, status: MAIL_DRAFT_STATUSES.SENDING },
          {
            $set: {
              status: replied
                ? MAIL_DRAFT_STATUSES.SENT
                : MAIL_DRAFT_STATUSES.PENDING,
              updatedAt: new Date(),
            },
          },
        );

        throw e;
      }

      const sent = await models.MailDrafts.findOneAndUpdate(
        { _id: draft._id },
        { $set: { status: MAIL_DRAFT_STATUSES.SENT, updatedAt: new Date() } },
        { new: true },
      );

      return { draft: sent ?? draft, message };
    }

    private static async claimForSending(_id: string) {
      const now = new Date();

      const claimed = await models.MailDrafts.findOneAndUpdate(
        actionableDraftFilter(_id, now.getTime()),
        { $set: { status: MAIL_DRAFT_STATUSES.SENDING, updatedAt: now } },
        { new: true },
      );

      return claimed ?? Draft.explainUnavailable(_id, 'sent');
    }

    private static async explainUnavailable(
      _id: string,
      verb: 'edited' | 'discarded' | 'sent',
    ): Promise<never> {
      const existing = await models.MailDrafts.findOne({ _id }).lean();

      if (!existing) {
        throw new Error('Draft not found');
      }

      if (existing.status === MAIL_DRAFT_STATUSES.SENDING) {
        throw new Error(
          verb === 'sent'
            ? 'This draft is already being sent'
            : `This draft is being sent and can no longer be ${verb}`,
        );
      }

      throw new Error('This draft has already been sent');
    }
  }

  mailDraftSchema.loadClass(Draft);

  return mailDraftSchema;
};
