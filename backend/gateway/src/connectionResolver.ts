import mongoose from 'mongoose';
import { createGenerateModels } from 'erxes-api-shared/utils';
import { userSchema } from 'erxes-api-shared/core-modules';
import { permissionSchema } from 'erxes-api-shared/core-modules';
import { appSchema } from 'erxes-api-shared/core-modules';
import { IUserDocument } from 'erxes-api-shared/core-types';
export interface IMainContext {
  res: any;
  requestInfo: any;
  user: IUserDocument;
}

export interface IModels {
  Users: any;
  Permissions: any;
  Apps: any;
  Clients: any;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Users = db.model('users', userSchema);
  models.Permissions = db.model('permissions', permissionSchema);
  models.Apps = db.model('apps', appSchema);
  models.Clients = db.model('clients', appSchema);

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
