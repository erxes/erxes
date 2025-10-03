import { Schema } from 'mongoose';
import { field } from '../utils';

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
