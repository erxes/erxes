import { Document } from 'mongoose';

export type TConnectionTestStatus = 'success' | 'failed';

export interface IConnectionField {
  key: string;
  label?: string;
  secret: boolean;
  // Plain text, or a sealed `enc:v1:` envelope when `secret`.
  value: string;
}

export interface IConnection {
  name: string;
  icon?: string;
  logo?: string;
  type: string;
  fields: IConnectionField[];
  createdBy?: string;
  updatedBy?: string;
  lastTestedAt?: Date;
  lastTestStatus?: TConnectionTestStatus;
  lastTestMessage?: string;
}

export interface IConnectionDocument extends IConnection, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

/** A field as the UI sends it. A missing `value` keeps the stored one. */
export interface IConnectionFieldInput {
  key: string;
  label?: string;
  secret?: boolean;
  value?: string | null;
}

export interface IConnectionAddInput {
  name: string;
  icon?: string | null;
  logo?: string | null;
  type: string;
  fields?: IConnectionFieldInput[];
}

export interface IConnectionEditInput {
  name?: string;
  icon?: string | null;
  logo?: string | null;
  // The complete list of keys the connection keeps.
  fields?: IConnectionFieldInput[];
}
