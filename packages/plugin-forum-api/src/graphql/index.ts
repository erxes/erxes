import { IContext as IBaseContext } from '@erxes/api-utils/src';
import { IModels } from '../db/models';

export interface ICpUser {
  userId: string;
}

export interface IContext extends IBaseContext {
  subdomain: string;
  models: IModels;
  serverTiming: any;
  cpUser?: ICpUser;
}
