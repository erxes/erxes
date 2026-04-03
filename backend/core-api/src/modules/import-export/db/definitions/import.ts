import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const importSchema = schemaWrapper(
  new Schema(
    {
      _id: mongooseStringRandomId,
      entityType: {
        type: String,
        required: true,
        label: 'Entity Type',
        index: true,
      },
      pluginName: { type: String, required: true, label: 'Plugin Name' },
      moduleName: { type: String, required: true, label: 'Module Name' },
      collectionName: {
        type: String,
        required: true,
        label: 'Collection Name',
      },
      fileKey: { type: String, required: true, label: 'File Key' },
      fileName: { type: String, required: true, label: 'File Name' },
      status: {
        type: String,
        enum: [
          'pending',
          'validating',
          'processing',
          'completed',
          'failed',
          'cancelled',
        ],
        default: 'pending',
        label: 'Status',
        index: true,
      },
      totalRows: { type: Number, default: 0, label: 'Total Rows' },
      processedRows: { type: Number, default: 0, label: 'Processed Rows' },
      successRows: { type: Number, default: 0, label: 'Success Rows' },
      errorRows: { type: Number, default: 0, label: 'Error Rows' },
      importedIds: {
        type: [String],
        default: [],
        label: 'Imported Record IDs',
      },
      errorFileUrl: { type: String, optional: true, label: 'Error File URL' },
      startedAt: { type: Date, optional: true, label: 'Started At' },
      completedAt: { type: Date, optional: true, label: 'Completed At' },
      userId: { type: String, required: true, label: 'User ID', index: true },
      subdomain: {
        type: String,
        required: true,
        label: 'Subdomain',
        index: true,
      },
      jobId: {
        type: String,
        optional: true,
        label: 'Job ID',
        index: true,
      },
      errorMessage: { type: String, optional: true, label: 'Error Message' },
    },
    { timestamps: true },
  ),
);
