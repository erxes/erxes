import { Schema } from 'mongoose';

const entitySchema = new Schema(
  {
    contentType: {
      type: String,
      required: true,
      index: true,
    },
    contentId: {
      type: String,
      required: true,
      index: true,
    },
  },
  { _id: false },
);

export const relationSchema = new Schema(
  {
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
