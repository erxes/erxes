import { HydratedDocument } from 'mongoose';

export interface IInstagramAccount {
  kind: string;
  token: string;
  username?: string;
  email: string;
  tokenSecret?: string;
  expireDate?: string;
  scope?: string;
  name: string;
  uid: string;
}

export type IInstagramAccountDocument = HydratedDocument<IInstagramAccount>;
