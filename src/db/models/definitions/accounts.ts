import { Document, Schema } from "mongoose";
import { field } from "../utils";

export interface IAccount {
  kind: string;
  token: string;
  tokenSecret?: string;
  expireDate?: string;
  scope?: string;
  name: string;
  uid: string;
}

export interface IAccountDocument extends IAccount, Document {
  _id: string;
}

export const accountSchema = new Schema({
  _id: field({ pkey: true }),
  kind: field({
    type: String
  }),
  token: field({
    type: String
  }),
  tokenSecret: field({
    type: String,
    optional: true
  }),
  scope: field({
    type: String,
    optional: true
  }),
  expireDate: field({
    type: String,
    optional: true
  }),
  name: field({ type: String }),
  uid: field({ type: String })
});
