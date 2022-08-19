import { Model } from 'mongoose';
import { IModels } from '../connectionResolver';
import { INote, INoteDocument, noteSchema } from './definitions/notes';

export interface INoteModel extends Model<INoteDocument> {
  getNote(_id: string): INoteDocument;
  createNote(doc: any): INoteDocument;
  updateNote(_id: string, doc: any): INoteDocument;
}

export const loadClass = (models: IModels) => {
  class Note {
    public static async getNote(_id: string) {
      const note = models.Notes.findOne({ _id }).lean();

      if(!note) {
        throw new Error('Note not found')
      }
      return note;
    }

    public static async createNote(doc: INote) {
      return models.Notes.create({ ...doc, createdAt: new Date() });
    }

    public static async updateNote(_id: string, doc: INote) {
      await models.Notes.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } }
      );

      return models.Notes.findOne({ _id }).lean();
    }
  }

  noteSchema.loadClass(Note);

  return noteSchema;
};