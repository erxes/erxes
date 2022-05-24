import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IClientPortalModel,
  loadClientPortalClass
} from './models/ClientPortal';
import { IClientPortalDocument } from './models/definitions/clientPortal';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import {
  IUserModel,
  loadClientPortalUserClass
} from './models/ClientPortalUser';
import { IUserDocument } from './models/definitions/clientPortalUser';
export interface IModels {
  ClientPortals: IClientPortalModel;
  ClientPortalUsers: IUserModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  cpUser?: IUserDocument;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.ClientPortals = db.model<IClientPortalDocument, IClientPortalModel>(
    'client_portals',
    loadClientPortalClass(models)
  );

  models.ClientPortalUsers = db.model<IUserDocument, IUserModel>(
    'client_portal_users',
    loadClientPortalUserClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
