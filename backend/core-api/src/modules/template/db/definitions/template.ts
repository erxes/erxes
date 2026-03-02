import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import { ITemplateDocument } from '../../@types';

export const relatedContent = new Schema(
  {
    contentType: { type: String, required: true },
    content: { type: [String], required: true },
  },
  { _id: false },
);

export const templateSchema = schemaWrapper(
  new Schema<ITemplateDocument>(
    {
      name: { type: String, required: true },
      description: { type: String },
      content: { type: String, required: true },
      contentType: { type: String, required: true },
      relatedContents: { type: [relatedContent], default: [], optional: true },

      categoryIds: { type: [String], optional: true },

      createdBy: { type: String },
      updatedBy: { type: String },
    },
    { timestamps: true },
  ),
);
