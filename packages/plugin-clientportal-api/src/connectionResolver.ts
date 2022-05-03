import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IClientPortalModel,
  loadClientPortalClass,
} from './models/ClientPortal';
import { IClientPortalDocument } from './models/definitions/clientPortal';
import { createGenerateModels } from '@erxes/api-utils/src/core';
export interface IModels {
  ClientPortals: IClientPortalModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.ClientPortals = db.model<IClientPortalDocument, IClientPortalModel>(
    'client_portals',
    loadClientPortalClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(models, loadClasses);