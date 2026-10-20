import { schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';

/**
 * One in-flight upload. Lives in Mongo, not process memory, so any replica can
 * sign, resume or complete it. Not TTL-indexed on purpose: the sweep must see
 * an expired session to abort it in storage and give its quota back.
 */
export interface IFileUpload {
  fileId: string;
  versionId: string;
  // Absent for a single PUT upload (file fits in one part).
  s3UploadId?: string;
  storageKey: string;
  size: number;
  partSize: number;
  totalParts: number;
  createdBy: string;
  expiresAt: Date;
}

export interface IFileUploadDocument extends IFileUpload, Document {
  _id: string;
  createdAt: Date;
}

export const fileUploadSchema = schemaWrapper(
  new Schema(
    {
      fileId: { type: String, required: true, label: 'File' },
      versionId: { type: String, required: true, label: 'Version' },
      s3UploadId: { type: String, label: 'Storage multipart upload id' },
      storageKey: { type: String, required: true, label: 'Storage key' },
      size: { type: Number, required: true, label: 'Size in bytes' },
      partSize: { type: Number, required: true, label: 'Part size' },
      totalParts: { type: Number, required: true, label: 'Total parts' },
      createdBy: { type: String, required: true, label: 'Created by' },
      expiresAt: { type: Date, required: true, label: 'Expires at' },
    },
    { timestamps: { createdAt: true, updatedAt: false } },
  ),
);

fileUploadSchema.index({ fileId: 1 });
fileUploadSchema.index({ expiresAt: 1 });
