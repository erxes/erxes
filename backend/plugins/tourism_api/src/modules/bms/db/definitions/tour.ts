import { Schema } from 'mongoose';
import { locationSchema } from '@/bms/db/definitions/itinerary';
import { TOUR_STATUS_TYPES } from '@/bms/constants';
import { getEnum } from '~/modules/bms/utils/utils';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export const tourCategorySchema = new Schema({
  _id: mongooseStringRandomId,
  name: { type: String, label: 'Name' },
  code: { type: String, optional: true, label: 'code' },
  order: { type: String, optional: true, label: 'order', index: true },
  parentId: { type: String, label: 'parentId', index: true },
  branchId: { type: String, optional: true, label: 'branchId', index: true },
  attachment: { type: Object, optional: true, label: 'attachment' },
  createdAt: {
    type: Date,
    default: Date.now,
    label: 'Created at',
  },
  modifiedAt: {
    type: Date,
    default: Date.now,
    label: 'Modified at',
  },
});

export const guideItemSchema = new Schema(
  {
    guideId: { type: String, optional: true },
    type: { type: String, optional: true },
  },
  { _id: false },
);

export const pricingOptionSchema = new Schema(
  {
    _id: { type: String, required: true },

    title: { type: String, required: true },

    minPersons: {
      type: Number,
      required: true,
      min: 1,
    },

    maxPersons: {
      type: Number,
      min: 1,
      validate: {
        validator(value: number) {
          return !value || value >= this.minPersons;
        },
        message: 'Max persons must be greater than or equal to min persons',
      },
    },

    pricePerPerson: {
      type: Number,
      required: true,
      min: 0.01,
    },

    accommodationType: {
      type: String,
      set: (v: string) => v?.trim().toLowerCase(),
    },

    domesticFlightPerPerson: {
      type: Number,
      min: 0,
    },

    singleSupplement: {
      type: Number,
      min: 0,
    },

    note: { type: String },
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
  dateType: {
    type: String,
    enum: ['fixed', 'flexible'],
    default: 'fixed',
    optional: true,
    label: 'date type',
  },
  startDate: { type: Date, optional: true, label: 'date' },
  endDate: { type: Date, optional: true, label: 'date' },
  availableFrom: {
    type: Date,
    optional: true,
    label: 'available from',
  },
  availableTo: { type: Date, optional: true, label: 'available to' },
  groupSize: { type: Number, optional: true, label: 'group size' },
  guides: { type: [guideItemSchema], optional: true, label: 'guides' },
  status: {
    type: String,
    default: '',
    optional: true,
    label: 'status',
  },
  date_status: {
    type: String,
    default: '',
    optional: true,
    label: 'date status',
    selectOptions: getEnum(TOUR_STATUS_TYPES),
  },
  cost: { type: Number, optional: true, label: 'cost' },
  categoryIds: { type: [String], optional: true, label: 'categoryIds' },
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
  personCost: {
    type: Object,
    optional: true,
    label: 'personCost',
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
  attachment: { type: Object, optional: true, label: 'attachment' },

  pricingOptions: {
    type: [pricingOptionSchema],
    required: true,
    validate: {
      validator: (v: (typeof pricingOptionSchema)[]) => v.length > 0,
      message: 'At least one pricing option is required',
    },
  },

  startingPrice: {
    type: Number,
  },
});

tourSchema.pre('save', function (next) {
  if (Array.isArray(this.pricingOptions) && this.pricingOptions.length > 0) {
    const prices = this.pricingOptions
      .map((p: { pricePerPerson?: number }) => p.pricePerPerson)
      .filter((price): price is number => typeof price === 'number');

    if (prices.length > 0) {
      this.startingPrice = Math.min(...prices);
    } else {
      this.startingPrice = undefined;
    }
  } else {
    this.startingPrice = undefined;
  }

  next();
});

tourSchema.index({ startingPrice: 1 });
tourSchema.index({ categoryIds: 1 });
tourSchema.index({ categories: 1 });
tourSchema.index({ tagIds: 1 });
tourSchema.index({ categoryId: 1 });
