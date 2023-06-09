import { Schema, Document } from 'mongoose';
import { field } from './utils';

export type IPlan = {
  name: string;
  structureType: string;
  structureTypeId: string;
  indicatorId: string;
  groupId: string;
  cardType: string;
  params: string;
};

export interface IPlanDocument extends Document, IPlan {
  _id: string;
}

export const planSchema = new Schema({
  _id: field({ pkey: true }),
  name: field({ type: String, label: 'Name', unique: true, required: true }),
  structureType: field({
    type: String,
    label: 'Structure Type',
    required: true
  }),
  structureTypeId: field({
    type: String,
    label: 'Structure Type Id',
    required: true
  }),
  indicatorId: field({ type: String, label: 'Indicator Id', optional: true }),
  groupId: field({ type: String, label: 'Indicator Id', optional: true }),
  params: field({ type: Schema.Types.Mixed, label: 'params' }),
  status: field({
    type: String,
    label: 'Status',
    enum: ['active', 'archived'],
    default: 'active'
  })
});
