import { Schema, Document } from 'mongoose';
import { field } from './utils';

export interface IGrantRequest {
  userIds: string[];
  action: string;
  params: string;
  requesterId: string;
  status: 'waiting' | 'done' | 'declined';
}

export interface IGrantResponse {
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
  requesterId: field({ type: String, label: 'Requester Id' }),
  userIds: field({ type: [String], label: 'Members seeking grant' }),
  action: field({ type: String, label: 'Grant action' }),
  params: field({ type: String, label: 'Grant params' }),
  status: field({
    type: String,
    label: 'request status',
    enum: ['waiting', 'done', 'declined'],
    default: 'waiting'
  })
});

export const grantResponsesSchema = new Schema({
  _id: field({ pkey: true }),
  userId: field({ type: String, label: 'Response member id' }),
  requestId: field({ type: String, label: 'Request id' }),
  status: field({
    type: String,
    enum: ['agree', 'decline'],
    label: 'Grant status'
  }),
  description: field({ type: String, label: 'Grant description' })
});
