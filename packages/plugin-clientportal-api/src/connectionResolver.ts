import {
  ICPNotificationModel,
  loadNotificationClass
} from './models/ClientPortalNotifications';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';

import {
  IClientPortalModel,
  loadClientPortalClass
} from './models/ClientPortal';
import {
  IUserModel,
  loadClientPortalUserClass
} from './models/ClientPortalUser';
import { IClientPortalDocument } from './models/definitions/clientPortal';
import { IUserDocument } from './models/definitions/clientPortalUser';
import { ICPNotificationDocument } from './models/definitions/clientPortalNotifications';

export interface IModels {
  ClientPortals: IClientPortalModel;
  ClientPortalUsers: IUserModel;
  ClientPortalNotifications: ICPNotificationModel;
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

  models.ClientPortalNotifications = db.model<
    ICPNotificationDocument,
    ICPNotificationModel
  >('client_portal_notifications', loadNotificationClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
