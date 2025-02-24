import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IClient {
  name: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  whiteListedIps: string[];
}

export interface IClientDocument extends IClient, Document {
  _id: string;
  createdAt: Date;
}

// Mongoose schemas ===========

export const clientSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name', unique: true, required: true }),
  clientId: field({ type: String, label: 'Client id', unique: true }),
  clientSecret: field({ type: String, label: 'Client secret' }),
  refreshToken: field({ type: String, label: 'Refresh token' }),
  whiteListedIps: field({ type: [String], label: 'White listed ips' }),
  createdAt: field({ type: Date, label: 'Created at', default: Date.now })
});
