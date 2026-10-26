import { schemaWrapper } from 'erxes-api-shared/utils';
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
      commentState: { type: String },
    },
    {
      timestamps: true,
    },
  ),
);

documentSchema.add({
  _id: {
    type: Schema.Types.Mixed,
    default: () => new Types.ObjectId(),
    required: true,
    validate: (value: unknown) =>
      typeof value === 'string' || value instanceof Types.ObjectId,
  },
});

documentSchema.index({ contentType: 1 });
