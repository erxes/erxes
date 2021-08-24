import { Document, Model, model, Schema } from 'mongoose';

export interface INote {
  automationId: string;
  triggerId: string;
  actionId: string;
  description: string;
  createdAt: Date;
}

export interface IHistoryDocument extends INote, Document {
  _id: string;
}

const historySchema = new Schema({
  automationId: { type: String, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), required: true }
});

export interface IHistoryModel extends Model<IHistoryDocument> {
  createHistory(doc: any): IHistoryDocument;
}

export const loadClass = () => {
  class History {
    public static async createHistory(doc: INote) {
      return AutomationHistories.create({ createdAt: new Date(), ...doc });
    }
  }

  historySchema.loadClass(History);

  return historySchema;
};

loadClass();

// tslint:disable-next-line
const AutomationHistories = model<IHistoryDocument, IHistoryModel>(
  'automations_histories',
  historySchema
);

export default AutomationHistories;
