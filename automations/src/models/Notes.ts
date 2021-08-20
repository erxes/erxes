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
  automationId: { type: String },
  triggerId: { type: String },
  actionId: { type: String },
  description: { type: String, required: true },
  updatedBy: { type: String },
  updatedAt: { type: Date },
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now(), required: true }
});

export interface INoteModel extends Model<INoteDocument> {
  createNote(doc: any): INoteDocument;
  updateNote(_id: string, doc: any): INoteDocument;
}

export const loadClass = () => {
  class Note {
    public static async createNote(doc: INote) {
      return Notes.create({ createdAt: new Date(), ...doc });
    }

    public static async updateNote(_id: string, doc: INote) {
      await Notes.updateOne(
        { _id },
        { $set: { updatedAt: new Date(), ...doc } }
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
