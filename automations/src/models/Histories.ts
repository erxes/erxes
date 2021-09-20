import { Document, Model, model, Schema } from 'mongoose';

export interface IHistories {
  automationId: string;
  triggerId: string;
  triggerType: string;
  actionId: string;
  description: string;
  createdAt: Date;
}

export interface IHistoryDocument extends IHistories, Document {
  _id: string;
}

const historySchema = new Schema({
  automationId: { type: String, required: true },
  triggerId: { type: String },
  triggerType: { type: String },
  actionId: { type: String },
  actionType: { type: String },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now(), required: true },
  target: Object
});

export interface IHistoryModel extends Model<IHistoryDocument> {
  createHistory(doc: any): IHistoryDocument;
}

export const loadClass = () => {
  class History {
    public static async createHistory(doc: IHistories) {
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
