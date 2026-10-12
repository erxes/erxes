import { Model } from 'mongoose';
import { IModels } from '~/connectionResolvers';
import { cpNotificationSchema } from 'erxes-api-shared/core-modules';
import { ICPNotificationDocument } from '@/clientportal/types/cpNotification';

export interface ICPNotificationModel extends Model<ICPNotificationDocument> {}

export const loadCPNotificationClass = (models: IModels) => {
  class CPNotification {}

  cpNotificationSchema.loadClass(CPNotification);

  return cpNotificationSchema;
};
