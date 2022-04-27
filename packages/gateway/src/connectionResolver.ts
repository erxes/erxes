import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { userSchema } from '@erxes/api-utils/src/definitions/users';
import { connect } from './db';
import { permissionSchema } from '@erxes/api-utils/src/definitions/permissions';
import { appSchema } from '@erxes/api-utils/src/definitions/apps';

export interface IModels {
  Users: any;
  Permissions: any;
  Apps: any;
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

  const mainDb: any = await connect();

  loadClasses(mainDb);

  return models;
};

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Users = db.model('users', userSchema);
  models.Permissions = db.model('permissions', permissionSchema);
  models.Apps = db.model('apps', appSchema);

  return models;
};
