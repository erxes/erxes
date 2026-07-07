import { Document } from 'mongoose';

export interface IGolomtBankConfig {
  registerId: string;
  name: string;
  organizationName: string;
  clientId: string;
  ivKey: string;
  sessionKey: string;
  configPassword: string;
  accountId: string;
  golomtCode: string;
  apiUrl: string;
}

export interface IGolomtBankConfigDocument extends IGolomtBankConfig, Document {
  _id: string;
  createdAt: Date;
}
