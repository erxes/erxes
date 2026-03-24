import { logicSchema } from '@/properties/db/definitions/common';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const fieldGroupSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, label: 'Name', required: true },
      code: { type: String, label: 'Code', required: true, index: true },
      description: { type: String, label: 'Description' },
      contentType: { type: String, label: 'Content type' },

      order: { type: Number, label: 'Order', index: true },

      logics: { type: [logicSchema], label: 'Logic' },
      configs: { type: Schema.Types.Mixed, label: 'Configs' },

      createdBy: { type: String, label: 'Created By' },
      updatedBy: { type: String, label: 'Updated By' },
    },
    { timestamps: true },
  ),
);
