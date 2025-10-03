import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const entitySchema = new Schema(
  {
    contentType: {
      type: String,
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

export const relationSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    entities: {
      type: [entitySchema],
      validate: [
        (entities: any) => {
          return entities.length === 2;
        },
        'Exactly two entities are required.',
      ],

      label: 'Entities',
    },
  },
  {
    timestamps: true,
  },
);

relationSchema.index({ 'entities.contentType': 1, 'entities.contentId': 1 });
