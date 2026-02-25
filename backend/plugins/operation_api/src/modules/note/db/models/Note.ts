import { noteSchema } from '@/note/db/definitions/note';
import { INote, INoteDocument } from '@/note/types';
import { FilterQuery, Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { createNotifications } from '~/utils/notifications';

export interface INoteModel extends Model<INoteDocument> {
  getNote(_id: string): Promise<INoteDocument>;
  getNotes(filter: FilterQuery<INoteDocument>): Promise<INoteDocument[]>;
  createNote({
    doc,
    subdomain,
  }: {
    doc: INote;
    subdomain: string;
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
      const Note = await models.Note.findOne({ _id }).lean();

      if (!Note) {
        throw new Error('Note not found');
      }

      return Note;
    }

    public static async getNotes(
      filter: FilterQuery<INoteDocument>,
    ): Promise<INoteDocument[]> {
      return models.Note.find(filter);
    }

    public static async createNote({
      doc,
      subdomain,
    }: {
      doc: INote;
      subdomain: string;
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

      if (doc.mentions && doc.mentions.length > 0) {
        const userIds = doc.mentions.filter(
          (userId) => userId !== doc.createdBy,
        );

        let contentType = 'task';

        const project = await models.Project.exists({
          _id: doc.contentId,
        });

        if (project) {
          contentType = 'project';
        }

        const triage = await models.Triage.exists({
          _id: doc.contentId,
        });

        if (triage) {
          contentType = 'triage';
        }

        await createNotifications({
          contentType,
          contentTypeId: doc.contentId,
          fromUserId: doc.createdBy,
          subdomain,
          notificationType: 'note',
          userIds,
          action: 'note',
          models,
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
