import { ICustomField } from '@erxes/api-utils/src/definitions/common';
import { Schema, Document } from 'mongoose';
import { CAR_SELECT_OPTIONS } from './constants';
import { field, schemaHooksWrapper } from './utils';
import { ILocation, locationSchema } from './itinerary';

export interface ITour {
  name: string;
  content: string;
  duration: string;
  location: [ILocation];
}

export interface ITourDocument extends ITour, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  searchText: string;
}

const STATUS_TYPES = [
  { label: 'running', value: 'running' },
  { label: 'compeleted', value: 'compeleted' },
  { label: 'scheduled', value: 'scheduled' },
  { label: 'cancelled', value: 'cancelled' },
];

const getEnum = (): string[] => {
  return STATUS_TYPES.map(option => option.value);
};

export const tourSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at' }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),

    name: field({ type: String, optional: true, label: 'name' }),
    content: field({ type: String, optional: true, label: 'content' }),
    duration: field({ type: Number, optional: true, label: 'number' }),
    location: field({
      type: [locationSchema],
      optional: true,
      label: 'location',
    }),
    itineraryId: field({ type: String, optional: true, label: 'initeraryId' }),
    startDate: field({ type: Date, optional: true, label: 'date' }),
    endDate: field({ type: Date, optional: true, label: 'date' }),
    groupSize: field({ type: Number, optional: true, label: 'group size' }),
    status: field({
      type: String,
      enum: getEnum(),
      default: '',
      optional: true,
      label: 'status',
      esType: 'keyword',
      selectOptions: STATUS_TYPES,
    }),
    cost: field({ type: Number, optional: true, label: 'cost' }),
  }),
  'erxes_tours'
);
