import * as express from 'express';
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
    EngagesAPI: any;
    IntegrationsAPI: any;
    HelpersApi: any;
  };
  dataLoaders: IDataLoaders;
}
