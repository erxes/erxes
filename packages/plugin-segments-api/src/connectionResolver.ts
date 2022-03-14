import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { ISegmentDocument } from './models/definitions/segments';
import { ISegmentModel, loadClass } from './models/Segments';
import { IContext as IMainContext } from '@erxes/api-utils/src';

export interface IModels {
  Segments: ISegmentModel;
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

  models.Segments = db.model<ISegmentDocument, ISegmentModel>('segments', loadClass(models));

  return models;
};
