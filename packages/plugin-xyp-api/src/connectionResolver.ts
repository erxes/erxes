import { IContext as IMainContext } from '@erxes/api-utils/src';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IXypData, IXypconfigDocument } from './models/definitions/xypdata';
import { IXypDataModel, loadxypConfigClass } from './models/xypdata';

export interface IModels {
  XypData: IXypDataModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  cpUser: any;
}

export let models: IModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb);

  return models;
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.XypData = db.model<IXypconfigDocument, IXypDataModel>(
    'xyp_data',
    loadxypConfigClass(models)
  );

  return models;
};
