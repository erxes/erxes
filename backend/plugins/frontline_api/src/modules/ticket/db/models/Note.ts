import { noteSchema } from '@/ticket/db/definitions/note';
import { INote, INoteDocument, TNoteType } from '@/ticket/@types/note';
import { FilterQuery, Model } from 'mongoose';
import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { createNotifications } from '~/utils/notifications';

/**
 * Client portal authors are stored as `cp:<id>`, so they can never be mixed
 * into fields that hold erxes user ids.
 */
export const isClientPortalAuthor = (createdBy?: string) =>
  !!createdBy?.startsWith('cp:');

export interface INoteModel extends Model<INoteDocument> {
  getNote(_id: string): Promise<INoteDocument>;
  getNotes(filter: FilterQuery<INoteDocument>): Promise<INoteDocument[]>;
  createNote({
    doc,
    subdomain,
    userId,
  }: {
    doc: INote;
    subdomain: string;
    userId: string;
  }): Promise<INoteDocument>;
  updateNote(doc: INoteDocument): Promise<INoteDocument>;
  removeNote({
    _id,
    userId,
  }: {
    _id: string;
    userId: string;
  }): Promise<{ ok: number }>;
}

export const loadNoteClass = (models: IModels) => {
  class Note {
    public static async getNote(_id: string) {
      const node = await models.Note.findOne({ _id });

      if (!node) {
        throw new Error('Note not found');
      }

      return node;
    }

    public static async getNotes(
      filter: FilterQuery<INoteDocument>,
    ): Promise<INoteDocument[]> {
      return models.Note.find(filter);
    }

    public static async createNote({
      doc,
      subdomain,
      userId,
    }: {
      doc: INote;
      subdomain: string;
      userId: string;
    }): Promise<INoteDocument> {
      const type: TNoteType = doc.type === 'comment' ? 'comment' : 'note';

      if (doc.contentId && !doc.statusId) {
        const ticket = await models.Ticket.findOne(
          { _id: doc.contentId },
          { statusId: 1 },
        ).lean();
        if (ticket?.statusId) {
          doc.statusId = ticket.statusId;
        }
      }

      const note = await models.Note.create({ ...doc, type });

      await models.Activity.createActivity({
        action: 'CREATED',
        contentId: doc.contentId,
        module: type === 'comment' ? 'COMMENT' : 'NOTE',
        metadata: {
          previousValue: undefined,
          newValue: note._id,
        },
        createdBy: doc.createdBy,
      });

      const mentionUserIds = new Set<string>();
      const subscriberUserIds = new Set<string>();

      if (doc.mentions?.length) {
        doc.mentions
          .filter((id) => id !== doc.createdBy)
          .forEach((id) => mentionUserIds.add(id));
      }

      // `subscribedUserIds` only ever holds erxes user ids, so a comment left
      // by the requester in the client portal must not land in it.
      if (note.contentId && !isClientPortalAuthor(userId)) {
        await models.Ticket.updateOne(
          { _id: note.contentId },
          { $addToSet: { subscribedUserIds: userId } },
          { new: true },
        );
      }

      mentionUserIds.forEach((id) => subscriberUserIds.delete(id));

      if (mentionUserIds.size > 0) {
        await createNotifications({
          contentType: 'ticket',
          contentTypeId: note.contentId,
          fromUserId: userId,
          subdomain,
          notificationType: 'note',
          userIds: Array.from(mentionUserIds),
          action: 'create',
        });
      }

      if (subscriberUserIds.size > 0) {
        await createNotifications({
          contentType: 'ticket',
          contentTypeId: note.contentId,
          fromUserId: userId,
          subdomain,
          notificationType: 'updateTicket',
          userIds: Array.from(subscriberUserIds),
          action: 'updated',
        });
      }

      if (type === 'comment') {
        // The team reads comments off `ticketActivityChanged`; the client
        // portal has no activity feed, so it gets its own topic.
        await graphqlPubsub.publish(
          `ticketCommentInserted:${note.contentId}`,
          { ticketCommentInserted: note },
        );

        if (isClientPortalAuthor(doc.createdBy)) {
          await Note.notifyTeamOfPortalComment({ note, subdomain, userId });
        }
      }

      return note;
    }

    /**
     * A comment written in the client portal has no erxes author to notify
     * from, so the whole team following the ticket is told instead.
     */
    private static async notifyTeamOfPortalComment({
      note,
      subdomain,
      userId,
    }: {
      note: INoteDocument;
      subdomain: string;
      userId: string;
    }) {
      const ticket = await models.Ticket.findOne(
        { _id: note.contentId },
        { assigneeId: 1, assignedMembers: 1, subscribedUserIds: 1 },
      ).lean();

      if (!ticket) {
        return;
      }

      const recipientIds = new Set<string>(
        [
          ticket.assigneeId,
          ...(ticket.assignedMembers || []),
          ...(ticket.subscribedUserIds || []),
        ].filter((id): id is string => !!id && !isClientPortalAuthor(id)),
      );

      if (recipientIds.size === 0) {
        return;
      }

      await createNotifications({
        contentType: 'ticket',
        contentTypeId: note.contentId,
        fromUserId: userId,
        subdomain,
        notificationType: 'ticketComment',
        userIds: Array.from(recipientIds),
        action: 'create',
      });
    }

    public static async updateNote(doc: INoteDocument) {
      const { _id, ...rest } = doc;

      return await models.Note.findOneAndUpdate({ _id }, { $set: { ...rest } });
    }

    public static async removeNote({
      _id,
      userId,
    }: {
      _id: string;
      userId: string;
    }) {
      const note = await models.Note.findOne({ _id });

      if (!note) {
        throw new Error('Note not found');
      }

      if (note.createdBy !== userId) {
        throw new Error('You are not authorized to remove this note');
      }

      return models.Note.deleteOne({ _id });
    }
  }

  return noteSchema.loadClass(Note);
};
