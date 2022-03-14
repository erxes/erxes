import { Model, model } from 'mongoose';
import { INote, INoteDocument, noteSchema } from './definitions/notes';

export interface INoteModel extends Model<INoteDocument> {
  getNote(_id: string): INoteDocument;
  createNote(doc: any): INoteDocument;
  updateNote(_id: string, doc: any): INoteDocument;
}

export const loadClass = () => {
  class Note {
    public static async getNote(_id: string) {
      const note = Notes.findOne({ _id }).lean();

      if(!note) {
        throw new Error('Note not found')
      }
      return note;
    }

    public static async createNote(doc: INote) {
      return Notes.create({ ...doc, createdAt: new Date() });
    }

    public static async updateNote(_id: string, doc: INote) {
      await Notes.updateOne(
        { _id },
        { $set: { ...doc, updatedAt: new Date() } }
      );

      return Notes.findOne({ _id }).lean();
    }
  }

  noteSchema.loadClass(Note);

  return noteSchema;
};

loadClass();

// tslint:disable-next-line
export const Notes = model<INoteDocument, INoteModel>(
  'automations_notes',
  noteSchema
);
