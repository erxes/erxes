import { ILogDocument, MessageType } from '@/broadcast/@types/log';
import { logSchema } from '@/broadcast/db/definitions/log';
import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';

export interface ILogModel extends Model<ILogDocument> {
  createLog(
    engageMessageId: string,
    type: MessageType,
    message: string,
  ): Promise<ILogDocument>;
}

export const loadLogClass = (models: IModels) => {
  class Log {
    public static async createLog(
      engageMessageId: string,
      type: MessageType,
      message: string,
    ) {
      return models.Logs.create({ engageMessageId, message, type });
    }
  }

  logSchema.loadClass(Log);

  return logSchema;
};
