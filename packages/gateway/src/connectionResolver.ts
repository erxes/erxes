import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { userSchema } from '@erxes/api-utils/src/definitions/users';
import { permissionSchema } from '@erxes/api-utils/src/definitions/permissions';
import { appSchema } from '@erxes/api-utils/src/definitions/apps';
import { createGenerateModels } from '@erxes/api-utils/src/core';

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
