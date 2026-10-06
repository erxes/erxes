import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const productConditionSchema = new Schema({
  _id: mongooseStringRandomId,
  name: { type: String, required: true, label: 'Name' },
});

// Products point at one group; a sold line picks one of its conditions.
export const productConditionGroupSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      name: { type: String, required: true, label: 'Name' },
      description: { type: String, optional: true, label: 'Description' },
      conditions: {
        type: [productConditionSchema],
        default: [],
        label: 'Conditions',
      },
    },
    { timestamps: true },
  ),
);
