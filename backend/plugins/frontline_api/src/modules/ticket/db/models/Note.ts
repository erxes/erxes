import { noteSchema } from '@/ticket/db/definitions/note';
import { INote, INoteDocument } from '@/ticket/@types/note';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { createNotifications } from '~/utils/notifications';
import { graphqlPubsub } from 'erxes-api-shared/utils';
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
      const subscriberUserIds = new Set<string>();

      if (doc.mentions?.length) {
        doc.mentions
          .filter((id) => id !== doc.createdBy)
          .forEach((id) => mentionUserIds.add(id));
      }

      if (note.contentId) {
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
