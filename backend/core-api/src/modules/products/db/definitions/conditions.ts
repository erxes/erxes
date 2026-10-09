import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const productConditionSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      code: { type: String, required: true, unique: true, label: 'Code' },
      name: { type: String, required: true, label: 'Name' },
      description: { type: String, optional: true, label: 'Description' },
    },
    { timestamps: true },
  ),
);
