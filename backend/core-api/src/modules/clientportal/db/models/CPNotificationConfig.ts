import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { cpNotificationConfigSchema } from 'erxes-api-shared/core-modules';
import { ICPNotificationConfigDocument } from '@/clientportal/types/cpNotificationConfig';

export interface ICPNotificationConfigModel
  extends Model<ICPNotificationConfigDocument> {}

export const loadCPNotificationConfigClass = (models: IModels) => {
  class CPNotificationConfig {}

  cpNotificationConfigSchema.loadClass(CPNotificationConfig);

  return cpNotificationConfigSchema;
};
