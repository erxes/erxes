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
  /** Meta app that minted `token`. Absent on pre-split accounts. */
  appId?: string;
}

export type IFacebookAccountDocument = HydratedDocument<IFacebookAccount>;
