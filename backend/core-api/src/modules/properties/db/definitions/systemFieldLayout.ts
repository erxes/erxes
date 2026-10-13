import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

// One per content type: where its Basic information fields sit.
export const systemFieldLayoutSchema = schemaWrapper(
  new Schema(
    {
      contentType: {
        type: String,
        label: 'Content type',
        required: true,
        unique: true,
      },
      layout: { type: [[String]], label: 'Rows of system field codes' },
      updatedBy: { type: String, label: 'Updated By' },
    },
    { timestamps: true },
  ),
);
