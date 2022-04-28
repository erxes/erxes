import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { IFeedDocument, IThankDocument } from './models/definitions/exm';
import {
  loadFeedClass,
  loadExmThankClass,
  IThankModel,
  IFeedModel
} from './models/exmFeed';

export interface IModels {
  ExmFeed: IFeedModel;
  ExmThanks: IThankModel;
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

  models.ExmFeed = db.model<IFeedDocument, IFeedModel>(
    'exm_feeds',
    loadFeedClass(models)
  );

  models.ExmThanks = db.model<IThankDocument, IThankModel>(
    'exm_thanks',
    loadExmThankClass(models)
  );

  return models;
};
