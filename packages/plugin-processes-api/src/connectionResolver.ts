import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IPlantDocument } from './models/definitions/plants';
import { IPlantModel, loadPlantClass } from './models/Plants';
import { IContext as IMainContext } from '@erxes/api-utils/src';

export interface IModels {
  Plants: IPlantModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
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

  models.Plants = db.model<IPlantDocument, IPlantModel>('tags', loadPlantClass(models));

  return models;
};
