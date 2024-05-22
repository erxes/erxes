import { Schema, Document } from 'mongoose';
import { field } from './utils';
import { Operator } from './integrations';

export interface IOperator {
  userId: string;
  firstname: string;
  lastname: string;
}
export interface IOperatorDocuments extends IOperator, Document {}

export const operatorSchema = new Schema({
  userId: field({ type: String, label: 'user id', unique: true }),
  firstname: field({ type: String, label: 'Operator firstname' }),
  lastname: field({ type: String, label: 'Operator lastname' }),
  extension: field({ type: String, label: 'Operator extension' }),
  status: field({
    type: String,
    label: 'Operator extension',
    enum: ['unAvailable', 'idle', 'paused', 'unPaused'],
    default: 'unAvailable',
  }),
});
