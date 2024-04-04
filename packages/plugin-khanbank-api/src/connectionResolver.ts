import {
  IKhanbankConfigModel,
  loadKhanbankConfigClass,
} from './models/KhanbankConfigs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import { IKhanbankConfigDocument } from './models/definitions/khanbankConfigs';
import Khanbank from './khanbank/khanbank';

export interface IModels {
  KhanbankConfigs: IKhanbankConfigModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.KhanbankConfigs = db.model<
    IKhanbankConfigDocument,
    IKhanbankConfigModel
  >('khanbank_configs', loadKhanbankConfigClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
