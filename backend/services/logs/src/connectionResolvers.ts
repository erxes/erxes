import {
  ILogDocument,
  IMainContext,
  IUserDocument,
} from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose, { Model } from 'mongoose';

import {
  activityLogSchema,
  IActivityLogDocument,
  logsSchema,
  userSchema,
} from 'erxes-api-shared/core-modules';

export interface IModels {
  Logs: Model<ILogDocument>;
  ActivityLogs: Model<IActivityLogDocument>;
  Users: Model<IUserDocument>;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.ActivityLogs = db.model<
    IActivityLogDocument,
    Model<IActivityLogDocument>
  >('activity_logs', activityLogSchema);

  models.Users = db.model<IUserDocument, Model<IUserDocument>>(
    'users',
    userSchema,
  );

  const db_name = db.name;

  const logDb = db.useDb(`${db_name}_logs`);

  models.Logs = logDb.model<ILogDocument, Model<ILogDocument>>(
    'logs',
    logsSchema,
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses, {
  ignoreChangeStream: true,
});
