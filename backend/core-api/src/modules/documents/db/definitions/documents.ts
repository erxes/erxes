import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema, Types } from 'mongoose';

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
    },
    {
      timestamps: true,
    },
  ),
);

documentSchema.add({
  _id: {
    ...mongooseStringRandomId,
    cast: (value: unknown) => {
      if (value instanceof Types.ObjectId) return value;
      return Schema.Types.String.cast()(value);
    },
  },
});

documentSchema.index({ contentType: 1 });
