import { logicSchema } from '@/properties/db/definitions/common';
import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const systemFieldSettingSchema = schemaWrapper(
  new Schema(
    {
      contentType: { type: String, label: 'Content type', required: true },
      code: { type: String, label: 'System field code', required: true },
      isVisible: { type: Boolean, label: 'Visible', default: true },
      isVisibleToCreate: {
        type: Boolean,
        label: 'Visible to create',
        default: false,
      },
      isRequired: { type: Boolean, label: 'Required', default: false },
      logics: { type: [logicSchema], label: 'Logic' },
      updatedBy: { type: String, label: 'Updated By' },
    },
    { timestamps: true },
  ),
);

systemFieldSettingSchema.index({ contentType: 1, code: 1 }, { unique: true });
