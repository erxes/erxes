import { Schema } from 'mongoose';
import { field } from '~/modules/integrations/call/db/utils';
import { commonFields } from './constant';

export const categorySchema = new Schema({
    _id: field({ pkey: true }),
    description: field({ type: String, optional: true, label: 'Description' }),
    articleIds: field({ type: [String], label: 'Articles' }),
    icon: field({ type: String, optional: true, label: 'Icon' }),
    parentCategoryId: field({
      type: String,
      optional: true,
      label: 'Parent category',
    }),
    topicId: field({ type: String, optional: true, label: 'Topic' }),
    ...commonFields,
  });

categorySchema.index({ code: 1}, { unique: true, sparse: true });