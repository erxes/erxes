import { Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { IElementTranslationDocument } from '@/bms/@types/elementTranslation';

export const elementTranslationSchema = new Schema<IElementTranslationDocument>(
  {
    _id: mongooseStringRandomId,
    objectId: { type: String, required: true },
    language: { type: String, required: true },
    name: { type: String, default: '' },
    note: { type: String, default: '' },
    cost: { type: Number, optional: true },
  },
  { timestamps: true },
);

// Each element can have one translation per language
elementTranslationSchema.index({ objectId: 1, language: 1 }, { unique: true });
