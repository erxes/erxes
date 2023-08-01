import { Document, Model, model, Schema } from 'mongoose';
import { field } from './utils';

export interface IRecording {
  id: string;
  url?: string;
  expires?: number;
}

export interface ICallRecord {
  erxesApiMessageId: string;
  erxesApiConversationId: string;
  roomName: string;
  kind: string;
  privacy: string;
  status?: string;
  token?: string;
  recordings?: IRecording[];
}

interface ICallRecordDocument extends ICallRecord, Document {
  _id: string;
}

const recordingSchema: Schema = new Schema(
  {
    id: String,
    url: String,
    expires: Number
  },
  {
    _id: false
  }
);

const callRecordSchema: Schema = new Schema({
  _id: field({ pkey: true }),
  erxesApiMessageId: String,
  erxesApiConversationId: String,
  recordings: [recordingSchema],
  roomName: String,
  kind: String,
  privacy: String,
  token: String,
  status: {
    type: String,
    default: 'ongoing'
  },
  createdAt: Date
});

interface ICallRecordModel extends Model<ICallRecordDocument> {
  createCallRecord(doc: ICallRecord): Promise<ICallRecordDocument>;
}

const loadCallRecordClass = () => {
  class CallRecord {
    public static async createCallRecord(
      doc: ICallRecord
    ): Promise<ICallRecordDocument> {
      return CallRecords.create({ ...doc, createdAt: Date.now() });
    }
  }

  callRecordSchema.loadClass(CallRecord);

  return callRecordSchema;
};

loadCallRecordClass();

export const CallRecords: ICallRecordModel = model<
  ICallRecordDocument,
  ICallRecordModel
>('call_records', callRecordSchema);
