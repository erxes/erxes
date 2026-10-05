import { noteSchema } from '@/ticket/db/definitions/note';
import { INote, INoteDocument } from '@/ticket/@types/note';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { createNotifications } from '~/utils/notifications';

const isClientPortalAuthor = (userId: string) =>
  Boolean(userId) && userId.startsWith('cp:');

const isTeamMemberId = (id?: string | null): id is string =>
  typeof id === 'string' && id.length > 0 && !isClientPortalAuthor(id);

export const findCustomerReplyRecipients = async (
  models: IModels,
  ticketId: string,
): Promise<string[]> => {
  const ticket = await models.Ticket.findOne(
    { _id: ticketId },
    { assigneeId: 1, assignedMembers: 1, subscribedUserIds: 1, pipelineId: 1 },
  ).lean();

  if (!ticket) {
    return [];
  }

  const recipients = new Set(
    [
      ticket.assigneeId,
      ...(ticket.assignedMembers ?? []),
      ...(ticket.subscribedUserIds ?? []),
    ].filter(isTeamMemberId),
  );

  if (recipients.size) {
    return Array.from(recipients);
  }

  const pipeline = await models.Pipeline.findOne(
    { _id: ticket.pipelineId },
    { userId: 1 },
  ).lean();

  const ownerId = pipeline?.userId;

  return isTeamMemberId(ownerId) ? [ownerId] : [];
};

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
      if (doc.contentId && !doc.statusId) {
        const ticket = await models.Ticket.findOne(
          { _id: doc.contentId },
          { statusId: 1 },
        ).lean();
        if (ticket?.statusId) {
          doc.statusId = ticket.statusId;
        }
      }

      const note = await models.Note.create(doc);

      await models.Activity.createActivity({
        action: 'CREATED',
        contentId: doc.contentId,
        module: 'NOTE',
        metadata: {
          previousValue: undefined,
          newValue: note._id,
        },
        createdBy: doc.createdBy,
      });

      const mentionUserIds = new Set<string>();

      if (doc.mentions?.length) {
        doc.mentions
          .filter((id) => id !== doc.createdBy)
          .forEach((id) => mentionUserIds.add(id));
      }

      if (note.contentId && !isClientPortalAuthor(userId)) {
        await models.Ticket.updateOne(
          { _id: note.contentId },
          { $addToSet: { subscribedUserIds: userId } },
          { new: true },
        );
      }

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

      if (note.contentId && isClientPortalAuthor(userId)) {
        const recipients = (
          await findCustomerReplyRecipients(models, note.contentId)
        ).filter((id) => !mentionUserIds.has(id));

        if (recipients.length > 0) {
          await createNotifications({
            contentType: 'ticket',
            contentTypeId: note.contentId,
            fromUserId: userId,
            subdomain,
            notificationType: 'ticketCustomerReply',
            userIds: recipients,
            action: 'replied',
          });
        }
      }

      return note;
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
