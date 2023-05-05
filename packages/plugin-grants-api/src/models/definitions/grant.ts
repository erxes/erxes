import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IGrantRequest {
  userIds: string[];
  action: string;
}

export interface IGrantResponse extends IGrantRequest, Document {
  userId: string;
  status: 'agree' | 'decline';
  description: string;
}

export interface IGrantRequestDocument extends IGrantRequest, Document {
  _id: string;
}

export interface IGrantResponseDocument extends IGrantResponse, Document {
  _id: string;
}

export const grantSchema = new Schema({
  _id: field({ pkey: true }),
  userIds: field({ type: String, label: 'Members seeking grant' }),
  action: field({ type: String, label: 'Grant action' })
});

export const grantResponsesSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'Response member id' }),
  status: field({
    type: String,
    enum: ['agree', 'decline'],
    label: 'Grant status'
  }),
  description: field({ type: String, label: 'Grant description' })
});
