import { mongooseStringRandomId } from 'erxes-api-shared/utils';
import { Schema } from 'mongoose';

export const mediaAssetSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    name: { type: String, label: 'File name', index: true },
    title: { type: String, optional: true },
    alt: { type: String, optional: true },
    caption: { type: String, optional: true },
    description: { type: String, optional: true },
    key: { type: String, label: 'Storage key', required: true, index: true },
    url: { type: String, optional: true },
    previewUrl: { type: String, optional: true },
    storageType: { type: String, optional: true, index: true },
    provider: { type: String, optional: true },
    mimeType: { type: String, label: 'MIME type', index: true },
    fileType: { type: String, label: 'File type', index: true },
    size: { type: Number, label: 'Size' },
    width: { type: Number, optional: true },
    height: { type: Number, optional: true },
    duration: { type: Number, optional: true },
    folderId: { type: String, optional: true, index: true },
    tags: { type: [String], optional: true },
    createdUserId: { type: String, optional: true, index: true },
    deletedAt: { type: Date, optional: true, index: true },
  },
  {
    timestamps: true,
  },
);

mediaAssetSchema.index({ createdAt: -1 });
mediaAssetSchema.index({ name: 'text', title: 'text', alt: 'text' });
