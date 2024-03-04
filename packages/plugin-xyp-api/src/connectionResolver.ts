import { IContext as IMainContext } from '@erxes/api-utils/src';
import * as mongoose from 'mongoose';
import { IXypData, IXypconfigDocument } from './models/definitions/xypdata';
import { IXypDataModel, loadxypConfigClass } from './models/xypdata';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  XypData: IXypDataModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  cpUser: any;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.XypData = db.model<IXypconfigDocument, IXypDataModel>(
    'xyp_data',
    loadxypConfigClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
