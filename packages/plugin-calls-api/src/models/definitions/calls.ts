import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface ICalls {
  name: string;
  createdAt: Date;
  expiryDate: Date;
  checked: boolean;
  typeId: string;
}

export interface ICallsDocument extends ICalls, Document {}

export const callsSchema = new Schema({
  name: field({ type: String, label: 'name' }),
  createdAt: field({ type: Date, label: 'created date' }),
  expiryDatee: field({ type: Date, label: 'expired date' }),
  checked: field({ type: Boolean, label: 'is checked' }),
  typeId: field({ type: String, label: 'type id' })
});
