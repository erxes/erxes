import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { logSchema } from '@/integrations/facebook/db/definitions/logs';
import {
  IFacebookLogDocument,
  IFacebookLogInput,
} from '@/integrations/facebook/@types/logs';

export interface IFacebookLogModel extends Model<IFacebookLogDocument> {
  createLog({
    type,
    value,
    specialValue,
  }: IFacebookLogInput): IFacebookLogDocument;
}

export const loadFacebookLogClass = (models: IModels) => {
  class Log {
    public static async createLog({
      type,
      value,
      specialValue,
    }: IFacebookLogInput) {
      return models.FacebookLogs.create({
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
