import * as express from 'express';
import { IOrderItem } from '../db/models/definitions/formOrders';
import { IUserDocument } from '../db/models/definitions/users';
import { IDataLoaders } from './dataLoaders';

export interface IContext {
  res: express.Response;
  requestInfo: any;
  user: IUserDocument;
  docModifier: <T>(doc: T) => any;
  brandIdSelector: {};
  userBrandIdsSelector: {};
  commonQuerySelector: {};
  commonQuerySelectorElk: {};
  singleBrandIdSelector: {};
  dataSources: {
    AutomationsAPI: any;
    EngagesAPI: any;
    IntegrationsAPI: any;
    HelpersApi: any;
  };
  dataLoaders: IDataLoaders;
}

export interface IFormOrderInfo {
  amount: number;
  phone: string;
  items: IOrderItem[];
}
