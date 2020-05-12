import { Document, Model, model, Schema } from 'mongoose';

export type MessageType = 'regular' | 'success' | 'failure';

export interface ILog {
  engageMessageId: string;
  message: string;
  type: MessageType;
}

export interface ILogDocument extends ILog, Document {}

export interface ILogModel extends Model<ILogDocument> {
  createLog(engageMessageId: string, type: MessageType, message: string): Promise<void>;
}

export const logSchema = new Schema({
  createdAt: { type: Date, default: new Date() },
  engageMessageId: { type: String },
  message: { type: String },
  type: { type: String },
});

export const loadLogClass = () => {
  class Log {
    public static async createLog(engageMessageId: string, type: MessageType, message: string) {
      return Logs.create({ engageMessageId, message, type });
    }
  }

  logSchema.loadClass(Log);

  return logSchema;
};

loadLogClass();

// tslint:disable-next-line
const Logs = model<ILogDocument, ILogModel>('engage_logs', logSchema);

export default Logs;
