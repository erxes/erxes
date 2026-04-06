import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import {
  IWebActivityLog,
  IWebActivityLogDocument,
} from '@/webbuilder/@types/webActivityLog';
import { webActivityLogSchema } from '../definitions/webActivityLog';

export interface IWebActivityLogModel extends Model<IWebActivityLogDocument> {
  createLog(doc: IWebActivityLog): Promise<IWebActivityLogDocument>;
  getLogsForWeb(webId: string): Promise<IWebActivityLogDocument[]>;
}

export const loadWebActivityLogClass = (models: IModels) => {
  class WebActivityLog {
    public static async createLog(doc: IWebActivityLog) {
      return models.WebActivityLogs.create(doc);
    }

    public static async getLogsForWeb(webId: string) {
      return models.WebActivityLogs.find({ webId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean();
    }
  }

  webActivityLogSchema.loadClass(WebActivityLog);
  return webActivityLogSchema;
};
