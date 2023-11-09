import { Schema, model } from 'mongoose';

export interface ICallRecord {
  erxesApiConversationId: string;
  erxesApiMessageId: string;
  roomName: string;
  privacy: string;
  token: string;
}

export const recordSchema: Schema<ICallRecord> = new Schema<ICallRecord>({
  erxesApiConversationId: String,
  erxesApiMessageId: String,
  roomName: String,
  privacy: String,
  token: String
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
