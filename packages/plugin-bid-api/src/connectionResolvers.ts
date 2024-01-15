import { IContext as IMainContext } from '@erxes/api-utils/src';

export interface IContext extends IMainContext {
  subdomain: string;
}
