import { Document } from 'mongoose';

export type HrmConfigValue = unknown;

export interface IHrmConfig {
  code: string;
  subId?: string;
  value?: HrmConfigValue;
}

export interface IHrmConfigDocument extends IHrmConfig, Document {
  _id: string;
}
