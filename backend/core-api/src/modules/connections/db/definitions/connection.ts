import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

// Case-insensitive name uniqueness: "OpenAI" and "openai" are one name.
export const CONNECTION_NAME_COLLATION = { locale: 'en', strength: 2 };

const connectionFieldSchema = new Schema(
  {
    key: { type: String, required: true, label: 'Key' },
    label: { type: String, label: 'Label' },
    secret: { type: Boolean, default: false, label: 'Secret' },
    // Sealed envelope when `secret`; never selected into a GraphQL response.
    value: { type: String, default: '', label: 'Value' },
  },
  { _id: false },
);

export const connectionSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      name: { type: String, required: true, label: 'Name' },
      icon: { type: String, label: 'Icon' },
      logo: { type: String, label: 'Logo' },
      type: { type: String, required: true, index: true, label: 'Type' },
      fields: { type: [connectionFieldSchema], default: [], label: 'Fields' },
      createdBy: { type: String, label: 'Created by' },
      updatedBy: { type: String, label: 'Updated by' },
      lastTestedAt: { type: Date, label: 'Last tested at' },
      lastTestStatus: {
        type: String,
        enum: ['success', 'failed'],
        label: 'Last test status',
      },
      lastTestMessage: { type: String, label: 'Last test message' },
    },
    { timestamps: true },
  ),
);

connectionSchema.index(
  { name: 1 },
  { unique: true, collation: CONNECTION_NAME_COLLATION },
);
