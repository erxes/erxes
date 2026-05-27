import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { ITourTranslationDocument } from '@/bms/@types/tourTranslation';

const pricingOptionTranslationSchema = new Schema(
  {
    optionId: { type: String, required: true },
    title: { type: String, default: '' },
    note: { type: String, default: '' },
    accommodationType: { type: String, default: '' },
    pricePerPerson: { type: Number },
    domesticFlightPerPerson: { type: Number },
    singleSupplement: { type: Number },
  },
  { _id: false },
);

export const tourTranslationSchema = new Schema<ITourTranslationDocument>(
  {
    _id: mongooseStringRandomId,
    objectId: { type: String, required: true },
    language: { type: String, required: true },
    name: { type: String, default: '' },
    refNumber: { type: String, default: '' },
    content: { type: String, default: '' },
    info1: { type: String, default: '' },
    info2: { type: String, default: '' },
    info3: { type: String, default: '' },
    info4: { type: String, default: '' },
    info5: { type: String, default: '' },
    pricingOptions: { type: [pricingOptionTranslationSchema], default: [] },
  },
  { timestamps: true },
);

tourTranslationSchema.index({ objectId: 1, language: 1 }, { unique: true });
