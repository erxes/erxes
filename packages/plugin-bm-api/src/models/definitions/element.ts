import { ICustomField } from '@erxes/api-utils/src/definitions/common';
import { Schema, Document } from 'mongoose';
import { CAR_SELECT_OPTIONS } from './constants';
import { field, schemaHooksWrapper } from './utils';
import { ILocation, locationSchema } from './itinerary';

export interface IElement {
  name: string;
  quick?: boolean;
  icon?: string;
  content: string;
  note?: string;
  startTime?: string;
  duration?: string;
  cost?: string;
  images?: string;
  itineraryId?: string;
  location?: ILocation;
  categories?: string[];
}

export interface IElementDocument extends IElement, Document {
  _id: string;
  createdAt: Date;
  modifiedAt: Date;
}

export interface IElementCategory {
  name: string;
  parentId?: string;
}

export interface IElementCategoryDocument extends IElementCategory, Document {
  _id: string;
  order?: string;
  createdAt: Date;
}

export const elementCategorySchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    name: field({ type: String, label: 'Name' }),
    parentId: field({ type: String, label: 'parentId' }),
    createdAt: field({
      type: Date,
      default: new Date(),
      label: 'Created at',
    }),
  }),
  'erxes_elementCategory'
);

export const elementSchema = schemaHooksWrapper(
  new Schema({
    _id: field({ pkey: true }),
    createdAt: field({ type: Date, label: 'Created at' }),
    modifiedAt: field({ type: Date, label: 'Modified at' }),
    name: field({ type: String, optional: true, label: 'name' }),
    quick: field({ type: Boolean, optional: true, label: 'quick' }),
    icon: field({ type: String, optional: true, label: 'icon' }),
    content: field({ type: String, optional: true, label: 'content' }),
    note: field({ type: String, optional: true, label: 'note' }),
    startTime: field({ type: String, optional: true, label: 'startTime' }),
    duration: field({ type: Number, optional: true, label: 'duration' }),
    cost: field({ type: Number, optional: true, label: 'cost' }),
    categories: field({ type: [String], optional: true, label: 'categories' }),
    images: field({ type: [String], optional: true, label: 'images' }),
    itineraryId: field({ type: String, optional: true, label: 'itineraryId' }),
    location: field({
      type: locationSchema,
      optional: true,
      label: 'location',
    }),
  }),
  'erxes_elements'
);
