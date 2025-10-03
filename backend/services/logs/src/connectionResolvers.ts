import { ILogDocument, IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose, { Model } from 'mongoose';

import { logsSchema } from 'erxes-api-shared/core-modules';

export interface IModels {
  Logs: Model<ILogDocument>;
}

export interface IContext extends IMainContext {
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

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
