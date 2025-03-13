import { Schema, Document } from 'mongoose';
import { field } from './utils';
import { Operator } from './integrations';

export interface IOperator {
  userId: string;
  extension: string;
  status: string;
}
export interface IOperatorDocuments extends IOperator, Document {}

export const operatorSchema = new Schema({
  userId: field({ type: String, label: 'user id', unique: true }),
  extension: field({ type: String, label: 'Operator extension' }),
  status: field({
    type: String,
    label: 'Operator extension',
    enum: ['unAvailable', 'idle', 'pause', 'unpause'],
    default: 'unAvailable',
  }),
});
