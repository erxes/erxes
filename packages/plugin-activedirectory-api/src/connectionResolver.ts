import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IConfigModel, loadConfigClass } from './models/Actives';
import { IConfigDocument } from './models/definitions/actives';

export interface IModels {
  AdConfig: IConfigModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  const models = {} as IModels;

  models.AdConfig = db.model<IConfigDocument, IConfigModel>(
    'activedirector_configs',
    loadConfigClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
