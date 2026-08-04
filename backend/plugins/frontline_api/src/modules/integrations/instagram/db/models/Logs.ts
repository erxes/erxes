import { Model } from 'mongoose';

import { IModels } from '~/connectionResolvers';
import {
  IInstagramLogDocument,
  IInstagramLogInput,
} from '@/integrations/instagram/@types/logs';
import { logSchema } from '../definitions/logs';

export interface IInstagramLogModel extends Model<IInstagramLogDocument> {
  createLog({
    type,
    value,
    specialValue,
  }: IInstagramLogInput): IInstagramLogDocument;
}

export const loadInstagramLogClass = (models: IModels) => {
  class Log {
    public static async createLog({
      type,
      value,
      specialValue,
    }: IInstagramLogInput) {
      return models.InstagramLogs.create({
        type,
        value,
        specialValue,
        createdAt: new Date(),
      });
    }
  }

  logSchema.loadClass(Log);

  return logSchema;
};
