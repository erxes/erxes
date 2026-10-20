import { schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';
import { FILE_PREVIEW_STATUSES, TFilePreviewStatus } from '@/files/constants';

export interface IFileVersion {
  fileId: string;
  version: number;
  storageKey: string;
  size: number;
  mimeType: string;
  createdBy: string;
  previewStatus?: TFilePreviewStatus;
  thumbnailKey?: string;
  viewerKey?: string;
}

export interface IFileVersionDocument extends IFileVersion, Document {
  _id: string;
  createdAt: Date;
}

export const fileVersionSchema = schemaWrapper(
  new Schema(
    {
      fileId: { type: String, required: true, label: 'File' },
      version: { type: Number, required: true, label: 'Version' },
      storageKey: { type: String, required: true, label: 'Storage key' },
      size: { type: Number, required: true, label: 'Size in bytes' },
      mimeType: { type: String, required: true, label: 'Mime type' },
      createdBy: { type: String, required: true, label: 'Created by' },
      previewStatus: {
        type: String,
        enum: Object.values(FILE_PREVIEW_STATUSES),
        label: 'Preview status',
      },
      thumbnailKey: { type: String, label: 'Thumbnail storage key' },
      viewerKey: { type: String, label: 'Viewer copy storage key' },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
  ),
);

fileVersionSchema.index({ fileId: 1, version: -1 }, { unique: true });
fileVersionSchema.index({ previewStatus: 1, createdAt: 1 });
