import { Schema } from 'mongoose';
import { ZmsLogs } from '.';

interface IZmsLog {
  createdAt: Date;
  zmsId: String;
  action: string;
  object: any;
  status: boolean;
  sentDate: Date;
  sentBy: string;
  response: any;
}
export const zmsLogSchema = new Schema<IZmsLog>({
  createdAt: Date,
  zmsId: String,
  action: String,
  sentData: Schema.Types.Mixed,
  status: String,
  sentDate: Date,
  sendData: Schema.Types.Mixed,
  sentBy: String
  //response: Schema.Types.Mixed
});

export const loadZmsLogClass = () => {
  class ZmsLog {
    public static async getZmsLog(_id: string) {
      const zmsLog = await ZmsLogs.findOne({ _id });

      if (!zmsLog) {
        throw new Error('Zms not found');
      }

      return zmsLog;
    }
  }

  zmsLogSchema.loadClass(ZmsLog);

  return zmsLogSchema;
};
