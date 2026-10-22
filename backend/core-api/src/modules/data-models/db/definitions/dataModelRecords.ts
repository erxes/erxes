import { schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';
import type { IDataModelRecordDocument } from '../../records/types';

export const createDataModelRecordSchema = () => {
  const schema = schemaWrapper(
    new Schema<IDataModelRecordDocument>(
      {
        dataModelId: { type: String, required: true, immutable: true },
        propertiesData: {
          type: Schema.Types.Mixed,
          required: true,
          default: () => ({}),
        },
        version: { type: Number, required: true, default: 1, min: 1 },
        createdBy: { type: String, required: true, immutable: true },
        updatedBy: { type: String, required: true },
        deletedAt: { type: Date, default: null },
        deletedBy: { type: String, default: null },
      },
      { timestamps: true, minimize: false },
    ),
  );
  schema.index({ deletedAt: 1, createdAt: -1, _id: -1 });
  schema.index({ 'propertiesData.$**': 1 });
  return schema;
};
