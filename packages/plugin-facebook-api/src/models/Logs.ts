import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import { ILogDocument, ILogInput, logSchema } from './definitions/logs';

export interface ILogModel extends Model<ILogDocument> {
  createLog({ type, value, specialValue }: ILogInput): ILogDocument;
}

export const loadLogClass = (models: IModels) => {
  class Log {
    public static async createLog({ type, value, specialValue }: ILogInput) {
      return models.Logs.create({
        type,
        value,
        specialValue,
        createdAt: new Date()
      });
    }
  }

  logSchema.loadClass(Log);

  return logSchema;
};
