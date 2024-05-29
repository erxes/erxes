import { Schema, model } from 'mongoose';

export interface IRecording {
  id: string;
  url?: string;
  expires?: number;
}

export interface ICallRecord {
  contentType: string;
  contentTypeId: string;
  messageId: string;
  roomName: string;
  privacy: string;
  status: string;
  token: string;

  recordings?: IRecording[];
}

const recordingSchema = new Schema(
  {
    id: String,
    url: String,
    expires: Number
  },
  {
    _id: false
  }
);

export const recordSchema: Schema<ICallRecord> = new Schema<ICallRecord>({
  contentType: String,
  contentTypeId: String,
  messageId: String,
  roomName: String,
  privacy: String,
  status: {
    type: String,
    default: 'ongoing'
  },
  token: String,
  kind: String,

  recordings: [recordingSchema],
  createdAt: {
    type: Date,
    default: new Date()
  }
});

export const loadRecordClass = () => {
  class Record {
    static async createCallRecord(args: ICallRecord) {
      const record = await Records.create(args);

      return record;
    }
  }
  recordSchema.loadClass(Record);
  return recordSchema;
};

export const Records = model<any, any>('dailyco_records', loadRecordClass());
