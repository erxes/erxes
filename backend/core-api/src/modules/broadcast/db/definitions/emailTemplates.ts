import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const broadcastEmailTemplateSchema = new Schema(
  {
    _id: mongooseStringRandomId,

    name: { type: String, label: 'Name', required: true },
    description: { type: String, label: 'Description' },
    contentJson: {
      type: Schema.Types.Mixed,
      label: 'Content JSON',
      required: true,
    },

    createdBy: { type: String, label: 'Created user id' },
  },
  {
    timestamps: true,
  },
);
