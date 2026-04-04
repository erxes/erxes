import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { ITourCategoryTranslationDocument } from '@/bms/@types/tourCategoryTranslation';

export const tourCategoryTranslationSchema =
  new Schema<ITourCategoryTranslationDocument>(
    {
      _id: mongooseStringRandomId,
      objectId: { type: String, required: true },
      language: { type: String, required: true },
      name: { type: String, default: '' },
    },
    { timestamps: true },
  );

tourCategoryTranslationSchema.index(
  { objectId: 1, language: 1 },
  { unique: true },
);