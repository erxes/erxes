import { Document } from 'mongoose';

export type MediaAssetFileType =
  | 'image'
  | 'video'
  | 'audio'
  | 'document'
  | 'other';

export interface IMediaAsset {
  name: string;
  title?: string;
  alt?: string;
  caption?: string;
  description?: string;
  key: string;
  url?: string;
  previewUrl?: string;
  storageType?: string;
  provider?: string;
  mimeType: string;
  fileType: MediaAssetFileType;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  folderId?: string;
  tags?: string[];
  createdUserId?: string;
  deletedAt?: Date;
}

export interface IMediaAssetDocument extends IMediaAsset, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
