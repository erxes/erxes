import { mongooseStringRandomId, schemaWrapper } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const exportSchema = schemaWrapper(
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
      fileFormat: {
        type: String,
        enum: ['csv', 'xlsx'],
        default: 'csv',
        label: 'File Format',
      },
      fileKeys: {
        type: [String],
        default: [],
        label: 'File Keys',
      },
      filters: { type: Schema.Types.Mixed, optional: true, label: 'Filters' },
      ids: { type: [String], default: [], label: 'Selected IDs' },
      selectedFields: {
        type: [String],
        default: [],
        label: 'Selected Fields',
      },
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
      lastCursor: {
        type: String,
        optional: true,
        label: 'Last Cursor',
      },
    },
    { timestamps: true },
  ),
);
