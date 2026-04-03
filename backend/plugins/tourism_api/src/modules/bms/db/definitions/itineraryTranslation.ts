import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IItineraryTranslationDocument } from '@/bms/@types/itineraryTranslation';

const groupDayTranslationSchema = new Schema(
  {
    day: { type: Number, required: true },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
  },
  { _id: false },
);

export const itineraryTranslationSchema =
  new Schema<IItineraryTranslationDocument>(
    {
      _id: mongooseStringRandomId,
      objectId: { type: String, required: true },
      language: { type: String, required: true },
      name: { type: String, default: '' },
      content: { type: String, default: '' },
      foodCost: { type: Number },
      personCost: { type: Schema.Types.Mixed },
      gasCost: { type: Number },
      driverCost: { type: Number },
      guideCost: { type: Number },
      guideCostExtra: { type: Number },
      groupDays: { type: [groupDayTranslationSchema], default: [] },
    },
    { timestamps: true },
  );

itineraryTranslationSchema.index(
  { objectId: 1, language: 1 },
  { unique: true },
);