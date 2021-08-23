import { Document, Model, model, Schema } from 'mongoose';

export interface INote {
  automationId: string;
  triggerId: string;
  actionId: string;
  description: string;
  createdAt: Date;
  createdBy: string;
}

export interface IHistoryDocument extends INote, Document {
  _id: string;
}

const historySchema = new Schema({
  automationId: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), required: true }
});

export interface IHistoryModel extends Model<IHistoryDocument> {
  createNote(doc: any): IHistoryDocument;
}

export const loadClass = () => {
  class History {
    public static async createNote(doc: INote) {
      return Histories.create({ createdAt: new Date(), ...doc });
    }
  }

  historySchema.loadClass(History);

  return historySchema;
};

loadClass();

// tslint:disable-next-line
export const Histories = model<IHistoryDocument, IHistoryModel>(
  'automations_histories',
  historySchema
);
