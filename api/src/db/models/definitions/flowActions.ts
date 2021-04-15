import { Document, Schema } from 'mongoose';
import { field } from './utils';

export interface IFlowAction {
  type?: string;
  name?: string;
  description?: string;
  value?: string;
  order: number;
  flowId?: string;
  actionId?: string;
  executeNext?: boolean;
}

export interface IFlowActionDocument extends IFlowAction, Document {
  _id: string;
  createdAt: Date;
}

export interface IFlowActionValueCondition {
  operator: string;
  type: string;
  values: string[];
  action: string;
  value: string;
  variable: any;
  error: string;
}

export interface IFlowActionValue {
  content: string[];
  conditions: IFlowActionValueCondition[];
}

// Mongoose schemas ===========

export const flowActionSchema = new Schema({
  _id: field({ pkey: true }),
  type: field({ type: String, label: 'Type' }),
  name: field({ type: String, label: 'Name' }),
  description: field({ type: String, optional: true, label: 'Description' }),
  flowId: field({ type: String, label: 'Flow' }),
  actionId: field({ type: String, label: 'Flow Action Type' }),
  userId: field({ type: String, label: 'Created by' }),
  value: field({ type: String, optional: true, label: 'Value' }),
  order: field({ type: Number, label: 'Order' }),
  createdAt: field({ type: Date, label: 'Created at' }),
  executeNext: field({ type: Boolean, optional: true, label: 'Execute next' }),
});
