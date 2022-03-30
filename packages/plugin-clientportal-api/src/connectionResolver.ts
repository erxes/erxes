import * as mongoose from 'mongoose';
import { mainDb } from './configs';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IClientPortalModel,
  loadClientPortalClass,
} from './models/ClientPortal';
import { IClientPortalDocument } from './models/definitions/clientPortal';
export interface IModels {
  ClientPortals: IClientPortalModel;
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

  models.ClientPortals = db.model<IClientPortalDocument, IClientPortalModel>(
    'client_portals',
    loadClientPortalClass(models)
  );

  return models;
};
