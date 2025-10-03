import { HydratedDocument } from 'mongoose';
export interface IFacebookAccount {
  _id: string;
  kind: string;
  token: string;
  tokenSecret?: string;
  expireDate?: string;
  scope?: string;
  name: string;
  uid: string;
}

export type IFacebookAccountDocument = HydratedDocument<IFacebookAccount>;
