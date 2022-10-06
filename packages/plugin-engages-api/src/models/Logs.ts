import { Document, Model, Schema } from 'mongoose';
import { IModels } from '../connectionResolver';

export type MessageType = 'regular' | 'success' | 'failure';
export const LOG_MESSAGE_TYPES = ['regular', 'success', 'failure'];

export interface ILog {
  engageMessageId: string;
  message: string;
  type: MessageType;
}

export interface ILogDocument extends ILog, Document {}

export interface ILogModel extends Model<ILogDocument> {
  createLog(
    engageMessageId: string,
    type: MessageType,
    message: string
  ): Promise<ILogDocument>;
}

export const logSchema = new Schema({
  createdAt: { type: Date, default: new Date(), label: 'Created at' },
  engageMessageId: { type: String, label: 'Engage message id', index: true },
  message: { type: String, label: 'Message' },
  type: { type: String, label: 'Message type', enum: LOG_MESSAGE_TYPES }
});

export const loadLogClass = (models: IModels, subdomain: string) => {
  class Log {
    public static async createLog(
      engageMessageId: string,
      type: MessageType,
      message: string
    ) {
      return models.Logs.create({ engageMessageId, message, type });
    }
  }

  logSchema.loadClass(Log);

  return logSchema;
};
