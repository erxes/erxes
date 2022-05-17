import * as express from 'express';
import { IUserDocument } from '../models/definitions/clientPortal';

export interface IContext {
  res: express.Response;
  requestInfo: any;
  user: IUserDocument;
}
