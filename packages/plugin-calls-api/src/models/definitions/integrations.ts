import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface Operator {
  userId: string;
  gsUsername: string;
  gsPassword: string;
}

export interface IIntegration {
  inboxId: string;
  wsServer: string;
  phone: string;
  operators: [Operator];
  token: string;
}

export interface IIntegrationDocument extends IIntegration, Document {}

export const integrationSchema = new Schema({
  _id: field({ pkey: true }),
  inboxId: field({ type: String, label: 'inbox id' }),
  wsServer: field({ type: String, label: 'web socket server' }),
  phone: field({ type: String, label: 'phone number', unique: true }),
  operators: field({ type: Object, label: 'Operator maps' }),
  token: field({ type: String, label: 'token' }),
});
