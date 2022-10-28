import { Connection } from 'mongoose';
import { IModels } from '../index';
import * as _ from 'lodash';
import { generatePermissionGroupModel } from './permissionGroup';
import { generatePermissionGroupUserModel } from './permissionGroupUser';
import { generatePermissionGroupCategoryPermitModel } from './permissionGroupCategoryPermit';

export const generateUserGroupModels = (
  subdomain: string,
  con: Connection,
  models: IModels
): void => {
  generatePermissionGroupModel(subdomain, con, models);
  generatePermissionGroupUserModel(subdomain, con, models);
  generatePermissionGroupCategoryPermitModel(subdomain, con, models);
};
