import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

import { IConfigModel, loadConfigClass } from './models/Configs';
import { IConfigDocument } from './models/definitions/configs';

export interface IModels {
  Configs: IConfigModel;
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

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'pms_configs',
    loadConfigClass(models, subdomain)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
