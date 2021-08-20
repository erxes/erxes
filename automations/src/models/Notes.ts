import { Document, Model, model, Schema } from 'mongoose';

export interface INote {
  automationId: string;
  triggerId: string;
  actionId: string;
  description: string;
  createdAt: Date;
  createdBy: string;
}

export interface INoteDocument extends INote, Document {
  _id: string;
}

const noteSchema = new Schema({
  automationId: { type: String, required: true },
  triggerId: { type: String },
  actionId: { type: String },
  description: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), required: true }
});

export interface INoteModel extends Model<INoteDocument> {
  createNote(doc: any): INoteDocument;
}

export const loadClass = () => {
  class Note {
    public static async createNote(doc: INote) {
      return Notes.create({ createdAt: new Date(), ...doc });
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
