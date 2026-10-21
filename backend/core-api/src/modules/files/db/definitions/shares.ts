import { Document, Schema } from 'mongoose';
import { mongooseStringRandomId } from 'erxes-api-shared/utils';

export interface IFileShare {
  fileId: string;
  token: string;
  createdBy: string;
  revokedAt?: Date;
}

export interface IFileShareDocument extends IFileShare, Document {
  _id: string;
  createdAt: Date;
}

export const fileShareSchema = new Schema(
  {
    _id: mongooseStringRandomId,
    fileId: { type: String, required: true },
    token: { type: String, required: true },
    createdBy: { type: String, required: true },
    revokedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

fileShareSchema.index({ token: 1 }, { unique: true });
fileShareSchema.index({ fileId: 1, revokedAt: 1 });
