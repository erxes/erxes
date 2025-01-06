import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface Operator {
  userId: string;
  gsUsername: string;
  gsPassword: string;
  gsForwardAgent: boolean;
}

export interface IIntegration {
  erxesApiId: String;
  operators: [Operator];
}

export interface IIntegrationDocument extends IIntegration, Document {}

export const integrationSchema = new Schema({
  _id: field({ pkey: true }),
  erxesApiId: field({ type: String, label: 'integration id' }),
  operators: field({ type: Object, label: 'Operator maps' }),
  name: field({ type: String, label: 'integration name for web users' }),
});
