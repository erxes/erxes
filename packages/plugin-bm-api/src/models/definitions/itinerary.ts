import { ICustomField } from '@erxes/api-utils/src/definitions/common';
import { Schema, Document } from 'mongoose';
import { CAR_SELECT_OPTIONS } from './constants';
import { field, schemaHooksWrapper } from './utils';
import { IElement } from './element';

const getEnum = (): string[] => {
  return STATUS_TYPES.map(option => option.value);
};
const STATUS_TYPES = [
  { label: 'published', value: 'published' },
  { label: 'draft', value: 'draft' },
];

export interface ILocation {
  lat: string;
  lng: string;
}
export interface IItinerary {
  name: string;
  content: string;
  duration: number;
  elements: IElement[];
  location: ILocation[];
  images: String[];
  status: String;
}

export interface IItineraryDocument extends IItinerary, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
  ownerId: string;
  searchText: string;
}

export const locationSchema = new Schema(
  {
    lat: field({ type: String, esType: 'lat' }),
    lng: field({ type: String, esType: 'lng' }),
    name: field({ type: String, label: 'name' }),
  },
  { _id: false }
);
const elementOfItinerarySchema = new Schema(
  {
    elementId: field({ type: String, label: 'elementId' }),
    day: field({ type: Number, label: 'elementId' }),
    orderOfDay: field({ type: Number, label: 'orderOfDay' }),
  },
  { _id: false }
);

export const initnarySchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at' }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),

    name: field({ type: String, optional: true, label: 'name' }),
    content: field({ type: String, optional: true, label: 'content' }),
    duration: field({ type: Number, optional: true, label: 'number' }),
    elements: field({
      type: [elementOfItinerarySchema],
      optional: true,
      label: 'number',
    }),
    location: field({
      type: [locationSchema],
      optional: true,
      label: 'location',
    }),
    images: field({ type: [String], optional: true, label: 'images' }),
    status: field({
      type: String,
      enum: getEnum(),
      default: '',
      optional: true,
      label: 'status',
      esType: 'keyword',
      selectOptions: STATUS_TYPES,
    }),
  }),
  'erxes_itineraries'
);
