import { Schema } from 'mongoose';
import { field, schemaWrapper } from '~/modules/integrations/call/db/utils';
import { commonFields } from './constant';

export const topicSchema = schemaWrapper(
    new Schema({
      _id: field({ pkey: true }),
      description: field({ type: String, optional: true, label: 'Description' }),
      brandId: field({ type: String, optional: true, label: 'Brand' }),
  
      categoryIds: field({
        type: [String],
        required: false,
        label: 'Categories',
      }),
  
      color: field({ type: String, optional: true, label: 'Color' }),
      backgroundImage: field({
        type: String,
        optional: true,
        label: 'Background image',
      }),
  
      languageCode: field({
        type: String,
        optional: true,
        label: 'Language codes',
      }),
  
      notificationSegmentId: field({
        type: String,
        required: false,
      }),
  
      
  
      ...commonFields,
    }),
  );

topicSchema.index({ code: 1}, { unique: true, sparse: true });