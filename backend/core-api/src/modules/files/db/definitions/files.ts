import { schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';
import {
  FILE_PREVIEW_STATUSES,
  FILE_STATUSES,
  TFilePreviewStatus,
  TFileStatus,
} from '@/files/constants';
import { fileAccessGrantSchema, IFileAccessGrant } from '@/files/db/definitions/folders';

export interface IFile {
  folderId?: string;
  name: string;
  ext?: string;
  mimeType: string;
  size: number;
  status: TFileStatus;
  currentVersionId?: string;
  storageKey?: string;
  previewStatus?: TFilePreviewStatus;
  thumbnailKey?: string;
  viewerKey?: string;
  access: IFileAccessGrant[];
  readers: string[];
  managers: string[];
  createdBy: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface IFileDocument extends IFile, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const fileSchema = schemaWrapper(
  new Schema(
    {
      folderId: { type: String, label: 'Folder' },
      name: { type: String, required: true, label: 'Name' },
      ext: { type: String, label: 'Extension' },
      mimeType: { type: String, required: true, label: 'Mime type' },
      size: { type: Number, required: true, label: 'Size in bytes' },
      status: {
        type: String,
        enum: Object.values(FILE_STATUSES),
        required: true,
        label: 'Status',
      },
      currentVersionId: { type: String, label: 'Current version' },
      storageKey: { type: String, label: 'Storage key of current version' },
      previewStatus: {
        type: String,
        enum: Object.values(FILE_PREVIEW_STATUSES),
        label: 'Preview status',
      },
      thumbnailKey: { type: String, label: 'Thumbnail storage key' },
      viewerKey: { type: String, label: 'Viewer copy storage key' },
      access: { type: [fileAccessGrantSchema], default: [], label: 'Access list' },
      readers: { type: [String], default: [], label: 'Can view' },
      managers: { type: [String], default: [], label: 'Can manage' },
      createdBy: { type: String, required: true, label: 'Created by' },
      deletedAt: { type: Date, label: 'Moved to trash at' },
      deletedBy: { type: String, label: 'Moved to trash by' },
    },
    { timestamps: true },
  ),
);

fileSchema.index({ folderId: 1, deletedAt: 1, name: 1 });
fileSchema.index({ deletedAt: 1 });
fileSchema.index({ readers: 1, deletedAt: 1, status: 1 });
fileSchema.index({ managers: 1, deletedAt: 1 });
fileSchema.index({ 'access.key': 1 });
fileSchema.index({ status: 1, createdAt: 1 });
