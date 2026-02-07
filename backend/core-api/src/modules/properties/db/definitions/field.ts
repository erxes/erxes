import { logicSchema } from '@/properties/db/definitions/common';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

const fieldOptionSchema = new Schema(
  {
    label: { type: String, required: true },
    value: { type: String, required: true },
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  { _id: false },
);

export const fieldSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, label: 'Name', required: true },
      code: {
        type: String,
        label: 'Code or Field Name',
        required: true,
        index: true,
      },
      groupId: {
        type: String,
        label: 'Group ID',
        required: true,
        index: true,
      },
      contentType: { type: String, label: 'Content type', required: true },
      contentTypeId: { type: String, label: 'Content type ID' },

      type: { type: String, label: 'Type', required: true },
      order: { type: Number, label: 'Order', index: true },

      logics: { type: [logicSchema], label: 'Logic' },
      validations: { type: Schema.Types.Mixed, label: 'Validation' },
      configs: { type: Schema.Types.Mixed, label: 'Configs' },

      options: { type: [fieldOptionSchema], label: 'Options' },
      icon: { type: String, label: 'Icon' },

      createdBy: { type: String, label: 'Created By' },
      updatedBy: { type: String, label: 'Updated By' },
    },
    { timestamps: true },
  ),
);
