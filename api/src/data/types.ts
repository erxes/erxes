import * as express from 'express';
import { IUserDocument } from '../db/models/definitions/users';

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
  };
}
