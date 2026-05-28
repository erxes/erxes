import { Schema } from 'mongoose';

import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';

export const agentAssistantSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      name: { type: String, label: 'Name', required: true },
      description: { type: String, label: 'Description', optional: true },
      modelProvider: { type: String, label: 'Model Provider', required: true },
      apiKey: { type: String, label: 'API Key', required: true },
      status: {
        type: String,
        label: 'Status',
        enum: ['active', 'inactive'],
        default: 'inactive',
      },
    },
    {
      timestamps: true,
    },
  ),
);
