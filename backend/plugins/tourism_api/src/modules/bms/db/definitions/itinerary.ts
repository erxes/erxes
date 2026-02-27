import { Schema } from 'mongoose';
import { PAYMENT_STATUS_TYPES } from '@/bms/constants';
import { getEnum } from '@/bms/utils';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const locationSchema = new Schema(
  {
    lat: { type: Number, esType: 'lat' },
    lng: { type: Number, esType: 'lng' },
    name: { type: String, label: 'name' },
    mapId: { type: String, label: 'mapId' },
  },
  { _id: false },
);

const elementOfItinerarySchema = new Schema(
  {
    elementId: { type: String, label: 'elementId' },
    orderOfDay: { type: Number, label: 'orderOfDay' },
  },
  { _id: false },
);

const groupDay = new Schema(
  {
    day: { type: Number, label: 'day' },
    images: { type: [String], label: 'images' },
    content: { type: String, label: 'content' },
    elements: { type: [elementOfItinerarySchema], label: 'elements' },
    elementsQuick: {
      type: [elementOfItinerarySchema],
      label: 'elements',
    },
  },
  { _id: false },
);

const personCostSchema = new Schema(
  {
    persons: { type: String, label: 'persons' },
    price: { type: Number, label: 'price' },
  },
  { _id: false },
);

export const itinerarySchema = new Schema({
  _id: mongooseStringRandomId,
  createdAt: { type: Date, label: 'Created at' },
  modifiedAt: { type: Date, label: 'Modified at' },

  name: { type: String, optional: true, label: 'name' },
  content: { type: String, optional: true, label: 'content' },
  totalCost: { type: Number, optional: true, label: 'total cost' },
  duration: { type: Number, optional: true, label: 'number' },
  groupDays: {
    type: [groupDay],
    optional: true,
    label: 'days',
  },
  location: {
    type: [locationSchema],
    optional: true,
    label: 'location',
  },
  images: { type: [String], optional: true, label: 'images' },
  status: {
    type: String,
    default: '',
    optional: true,
    label: 'status',
    esType: 'keyword',
    selectOptions: PAYMENT_STATUS_TYPES,
  },
  color: { type: String, optional: true, label: 'color' },

  branchId: { type: String, optional: true, label: 'branchId' },

  driverCost: { type: Number, label: 'cost', optional: true },
  guideCost: { type: Number, label: 'cost', optional: true },
  guideCostExtra: { type: Number, label: 'cost', optional: true },
  foodCost: { type: Number, label: 'cost', optional: true },
  gasCost: { type: Number, label: 'cost', optional: true },
  personCost: { type: [personCostSchema], label: 'cost', optional: true },
  extra: { type: Object, label: 'extra', optional: true },
});
