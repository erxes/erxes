import { ITranslationDocument } from '@/portal/@types/translations';
import { customFieldSchema } from 'erxes-api-shared/core-modules';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const translationSchema = new Schema<ITranslationDocument>({
  _id: mongooseStringRandomId,
  postId: { type: String, required: true },
  language: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  customFieldsData: { type: [customFieldSchema], optional: true },
  type: {
    type: String,
    required: true,
    enum: [
      'post',
      'category',
      'menu',
      'page',
      'tag',
      'knowledgeBaseCategory',
      'knowledgeBaseTopic',
      'knowledgeBaseArticle',
    ],
    default: 'post',
  },
});

translationSchema.index({ postId: 1, language: 1, type: 1 }, { unique: true });
