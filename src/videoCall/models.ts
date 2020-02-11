import { Document, Model, model, Schema } from 'mongoose';
import { field } from '../models/utils';

export interface ICallRecord {
  erxesApiMessageId: string;
  erxesApiConversationId: string;
  roomName: string;
  kind: string;
  privacy: string;
  status?: string;
  recordId?: string;
  token?: string;
}

interface ICallRecordDocument extends ICallRecord, Document {
  _id: string;
}

const callRecordSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiMessageId: String,
  erxesApiConversationId: String,
  roomName: String,
  kind: String,
  privacy: String,
  token: String,
  status: {
    type: String,
    default: 'ongoing',
  },
  recordId: String,
  createdAt: Date,
});

interface ICallRecordModel extends Model<ICallRecordDocument> {
  createCallRecord(doc: ICallRecord): Promise<ICallRecordDocument>;
}

const loadCallRecordClass = () => {
  class CallRecord {
    public static async createCallRecord(doc: ICallRecord) {
      return CallRecords.create({ ...doc, createdAt: Date.now() });
    }
  }

  callRecordSchema.loadClass(CallRecord);

  return callRecordSchema;
};

loadCallRecordClass();

// tslint:disable-next-line
export const CallRecords = model<ICallRecordDocument, ICallRecordModel>('call_records', callRecordSchema);
