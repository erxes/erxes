import { Schema } from 'mongoose';
import { locationSchema } from '@/bms/db/definitions/itinerary';
import { TOUR_STATUS_TYPES } from '@/bms/constants';
import { getEnum } from '@/bms/utils';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const guideItemSchema = new Schema(
  {
    guideId: { type: String, optional: true },
    type: { type: String, optional: true },
  },
  { _id: false },
);
export const tourSchema = new Schema({
  _id: mongooseStringRandomId,

  createdAt: { type: Date, label: 'Created at' },
  modifiedAt: { type: Date, label: 'Modified at' },
  refNumber: { type: String, optional: true, label: 'refnumber' },
  name: { type: String, optional: true, label: 'name' },
  groupCode: { type: String, optional: true, label: 'groupCode' },
  content: { type: String, optional: true, label: 'content' },
  duration: { type: Number, optional: true, label: 'number' },
  location: {
    type: [locationSchema],
    optional: true,
    label: 'location',
  },
  itineraryId: { type: String, optional: true, label: 'initeraryId' },
  startDate: { type: Date, optional: true, label: 'date' },
  endDate: { type: Date, optional: true, label: 'date' },
  groupSize: { type: Number, optional: true, label: 'group size' },
  guides: { type: [guideItemSchema], optional: true, label: 'guides' },
  status: {
    type: String,
    default: '',
    optional: true,
    label: 'status',
    esType: 'keyword',
  },
  date_status: {
    type: String,
    default: '',
    optional: true,
    label: 'date status',
    esType: 'keyword',
    selectOptions: getEnum(TOUR_STATUS_TYPES),
  },
  cost: { type: Number, optional: true, label: 'cost' },
  tagIds: { type: [String], optional: true, label: 'tagIds' },
  viewCount: { type: Number, optional: true, label: 'viewCount' },
  advancePercent: {
    type: Number,
    optional: true,
    label: 'advancePercent',
  },
  joinPercent: {
    type: Number,
    optional: true,
    label: 'joinPercent',
  },
  advanceCheck: {
    type: Boolean,
    optional: true,
    label: 'advanceCheck',
  },

  branchId: { type: String, optional: true, label: 'branchId' },

  info1: { type: String, optional: true, label: 'info' },
  info2: { type: String, optional: true, label: 'info' },
  info3: { type: String, optional: true, label: 'info' },
  info4: { type: String, optional: true, label: 'info' },
  info5: { type: String, optional: true, label: 'info' },

  extra: { type: Object, optional: true, label: 'extra' },

  images: { type: [String], optional: true, label: 'images' },
  imageThumbnail: { type: String, optional: true, label: 'images' },
});
