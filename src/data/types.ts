import * as express from 'express';
import { IUserDocument } from '../db/models/definitions/users';

export interface IContext {
  res: express.Response;
  user: IUserDocument;
  docModifier: <T>(doc: T) => any;
  brandIdSelector: {};
  commonQuerySelector: {};
  dataSources: {
    EngagesAPI: any;
    IntegrationsAPI: any;
  };
}
