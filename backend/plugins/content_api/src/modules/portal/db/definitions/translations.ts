import { IPostTranslationDocument } from '@/portal/@types/translations';
import { customFieldSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const postTranslationSchema = new Schema<IPostTranslationDocument>({
  _id: mongooseStringRandomId,
  postId: { type: String, required: true },
  language: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  customFieldsData: { type: [customFieldSchema], optional: true },
});

postTranslationSchema.index({ postId: 1, language: 1 }, { unique: true });
