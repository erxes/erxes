import { Schema } from 'mongoose';
import { locationSchema } from '@/bms/db/definitions/itinerary';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const elementCategorySchema = new Schema({
  _id: mongooseStringRandomId,
  name: { type: String, label: 'Name' },
  parentId: { type: String, label: 'parentId' },
  createdAt: {
    type: Date,
    default: new Date(),
    label: 'Created at',
  },
});

export const elementSchema = new Schema({
  _id: mongooseStringRandomId,
  createdAt: { type: Date, label: 'Created at' },
  modifiedAt: { type: Date, label: 'Modified at' },
  name: { type: String, optional: true, label: 'name' },
  quick: { type: Boolean, optional: true, label: 'quick' },
  visibleName: { type: Boolean, optional: true, label: 'visibleName' },
  icon: { type: String, optional: true, label: 'icon' },
  content: { type: String, optional: true, label: 'content' },
  note: { type: String, optional: true, label: 'note' },
  startTime: { type: String, optional: true, label: 'startTime' },
  duration: { type: Number, optional: true, label: 'duration' },
  cost: { type: Number, optional: true, label: 'cost' },
  categories: { type: [String], optional: true, label: 'categories' },
  images: { type: [String], optional: true, label: 'images' },
  itineraryId: { type: String, optional: true, label: 'itineraryId' },
  branchId: { type: String, optional: true, label: 'branchId' },
  location: {
    type: locationSchema,
    optional: true,
    label: 'location',
  },
  orderCheck: { type: Boolean, optional: true, label: 'orderCheck' },
  additionalInfo: {
    type: Object,
    optional: true,
    label: 'additionalInfo',
  },
});
