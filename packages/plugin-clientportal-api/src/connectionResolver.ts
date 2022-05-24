import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  IClientPortalModel,
  loadClientPortalClass
} from './models/ClientPortal';
import { IClientPortalDocument } from './models/definitions/clientPortal';
import { createGenerateModels, getEnv } from '@erxes/api-utils/src/core';
import {
  IUserModel,
  loadClientPortalUserClass
} from './models/ClientPortalUser';
import { IUserDocument } from './models/definitions/clientPortalUser';
export interface IModels {
  ClientPortals: IClientPortalModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  cpModels: ICPModels;
  cpUser?: IUserDocument;
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

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);

/////////////////////////// cp ////////////////////////////
export interface ICPModels {
  ClientPortalUsers: IUserModel;
}

export let cpModels: ICPModels | null = null;

export const loadCPClasses = (db: mongoose.Connection): ICPModels => {
  cpModels = {} as ICPModels;

  cpModels.ClientPortalUsers = db.model<IUserDocument, IUserModel>(
    'client_portal_users',
    loadClientPortalUserClass(cpModels)
  );

  return cpModels;
};

export const createGenerateCPModels = <ICPModels>(cpModels, loadClasses) => {
  return async (clientPortalId: string): Promise<ICPModels> => {
    if (cpModels) {
      return cpModels;
    }

    const connectionOptions: mongoose.ConnectionOptions = {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      family: 4
    };

    const MONGO_URL = getEnv({ name: 'MONGO_URL' });

    const db = await mongoose.createConnection(
      MONGO_URL.replace('erxes', `erxes_clientportal_${clientPortalId}`),
      connectionOptions
    );

    console.log('&&&&&&&&&&&&&&&&&&&&&&&&&&&&& ', db);

    cpModels = loadClasses(db, clientPortalId);

    return cpModels;
  };
};

export const generateCPModels = createGenerateCPModels<ICPModels>(
  cpModels,
  loadCPClasses
);
