import { Document } from 'mongoose';

export interface IApp {
  name: string;
}

export interface IAppDocument extends IApp, Document {
  _id: string;
  token: string;
  status: string; // 'active' | 'revoked'
  lastUsedAt?: Date;
  createdAt: Date;
}
