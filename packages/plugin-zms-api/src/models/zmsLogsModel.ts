import { Schema } from 'mongoose';
import { ZmsLogs } from '.';

interface IZmsLog {
  createdAt: Date;
  ipAddress: string;
  action: string;
  object: any;
  status: boolean;
  sentDate: Date;
  sentBy: string;
  response: any;
}
export const zmsLogSchema = new Schema<IZmsLog>({
  createdAt: Date,
  ipAddress: String,
  action: String,
  object: Schema.Types.Mixed,
  status: Boolean,
  sentDate: Date,
  sentBy: String,
  response: Schema.Types.Mixed
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

    // create
    public static async createZms(doc) {
      return ZmsLogs.create({
        ...doc,
        createdAt: new Date()
      });
    }
  }

  zmsLogSchema.loadClass(ZmsLog);

  return zmsLogSchema;
};
