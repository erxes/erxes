import { Model } from 'mongoose';
import {
  installationLogSchema,
  IInstallationLogDocument
} from './definitions/installationLogs';
import { IModels } from '../../connectionResolver';

export interface IInstallationLogModel extends Model<IInstallationLogDocument> {
  createLog(doc): IInstallationLogDocument;
}

export const loadInstallationLogClass = (models: IModels) => {
  class InstallationLog {
    public static async createLog(doc) {
      console.log('00000000000000');

      return models.InstallationLogs.create({
        date: new Date(),
        ...doc
      });
    }
  }

  installationLogSchema.loadClass(InstallationLog);

  return installationLogSchema;
};
