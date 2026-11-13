import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const documentSchema = schemaWrapper(
  new Schema(
    {
      createdUserId: { type: String },
      contentType: { type: String },
      subType: { type: String, optional: true },
      name: { type: String },
      tagIds: { type: [String] },
      content: { type: String },
      replacer: { type: String },
      code: { type: String, optional: true },
      commentState: { type: String },
    },
    {
      timestamps: true,
    },
  ),
);

documentSchema.index({ contentType: 1 });
