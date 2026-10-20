import { schemaWrapper } from 'erxes-api-shared/utils';
import { Document, Schema } from 'mongoose';
import {
  FILE_ACCESS_ROLES,
  FILE_PRINCIPAL_TYPES,
  TFileAccessRole,
  TFilePrincipalType,
} from '@/files/constants';

export interface IFileAccessGrant {
  type: TFilePrincipalType;
  id?: string;
  role: TFileAccessRole;
  key: string;
}

export const fileAccessGrantSchema = new Schema(
  {
    type: { type: String, enum: Object.values(FILE_PRINCIPAL_TYPES), required: true },
    id: { type: String },
    role: { type: String, enum: Object.values(FILE_ACCESS_ROLES), required: true },
    key: { type: String, required: true },
  },
  { _id: false },
);

export interface IFilesAccessFields {
  readers: string[];
  contributors: string[];
  managers: string[];
}

export interface IFileFolderAppearance {
  color?: string;
  icon?: string;
  coverFileId?: string;
}

export interface IFileFolder extends IFilesAccessFields {
  name: string;
  appearance?: IFileFolderAppearance;
  parentId?: string;
  // Root first; one indexed query finds a whole subtree.
  ancestorIds: string[];
  // Own grants only; inherited access lives in the readers arrays.
  access: IFileAccessGrant[];
  restricted?: boolean;
  rootKey?: string;
  createdBy: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface IFileFolderDocument extends IFileFolder, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export const fileFolderSchema = schemaWrapper(
  new Schema(
    {
      name: { type: String, required: true, label: 'Name' },
      parentId: { type: String, label: 'Parent folder' },
      ancestorIds: { type: [String], default: [], label: 'Ancestor folders' },
      appearance: {
        type: new Schema(
          { color: String, icon: String, coverFileId: String },
          { _id: false },
        ),
        label: 'Card appearance',
      },
      access: {
        type: [fileAccessGrantSchema],
        default: [],
        label: 'Access list',
      },
      restricted: { type: Boolean, label: 'Does not inherit access' },
      rootKey: { type: String, label: 'Space root' },
      readers: { type: [String], default: [], label: 'Can view' },
      contributors: { type: [String], default: [], label: 'Can upload' },
      managers: { type: [String], default: [], label: 'Can manage' },
      createdBy: { type: String, required: true, label: 'Created by' },
      deletedAt: { type: Date, label: 'Moved to trash at' },
      deletedBy: { type: String, label: 'Moved to trash by' },
    },
    { timestamps: true },
  ),
);

fileFolderSchema.index({ parentId: 1, deletedAt: 1, name: 1 });
fileFolderSchema.index({ ancestorIds: 1 });
fileFolderSchema.index({ deletedAt: 1 });
fileFolderSchema.index({ rootKey: 1 }, { unique: true, sparse: true });
fileFolderSchema.index({ readers: 1, deletedAt: 1 });
fileFolderSchema.index({ managers: 1, deletedAt: 1 });
fileFolderSchema.index({ 'access.key': 1 });
