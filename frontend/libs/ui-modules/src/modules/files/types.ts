export type TFilesRole = 'viewer' | 'contributor' | 'manager';

export type TFilesPrincipalType = 'user' | 'entity' | 'everyone';

export type TFilesSpace = 'personal' | 'org' | 'shared';

export interface IFilesAccessGrant {
  type: TFilesPrincipalType;
  id?: string | null;
  role: TFilesRole;
}

export interface IFile {
  _id: string;
  folderId?: string | null;
  name: string;
  ext?: string;
  mimeType: string;
  size: number;
  status: string;
  currentVersionId?: string | null;
  previewStatus?: TFilePreviewStatus | null;
  thumbnailUrl?: string | null;
  myRole?: TFilesRole | null;
  sharedWith?: IFilesAccessGrant[] | null;
  publicLink?: boolean | null;
  access?: IFilesAccessGrant[] | null;
  inheritedAccess?: IFilesAccessGrant[] | null;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export type TFilePreviewStatus = 'pending' | 'ready' | 'failed' | 'none';

export interface IFilesFolderAppearance {
  color?: string | null;
  icon?: string | null;
  coverFileId?: string | null;
}

export interface IFilesFolder {
  _id: string;
  name: string;
  parentId?: string | null;
  ancestorIds?: string[];
  appearance?: IFilesFolderAppearance | null;
  coverUrl?: string | null;
  myRole?: TFilesRole | null;
  space?: Exclude<TFilesSpace, 'shared'> | null;
  sharedWith?: IFilesAccessGrant[] | null;
  createdBy?: string;
  access?: IFilesAccessGrant[] | null;
  inheritedAccess?: IFilesAccessGrant[] | null;
  restricted?: boolean | null;
  createdAt?: string;
  deletedAt?: string | null;
}

export interface IFilesSharedWithMe {
  folders: IFilesFolder[];
  files: IFile[];
}

export interface IFilesVersion {
  _id: string;
  fileId: string;
  version: number;
  size: number;
  mimeType: string;
  createdBy?: string;
  createdAt?: string;
}

export interface IFilesShare {
  _id: string;
  fileId: string;
  token: string;
  createdAt?: string;
}

export interface IFilesUsage {
  usedBytes: number;
  reservedBytes: number;
  quotaBytes?: number | null;
  maxFileSize: number;
}

export interface IFilesSignedPart {
  partNumber: number;
  url: string;
}

export interface IFilesUploadSession {
  uploadId: string;
  fileId: string;
  partSize: number;
  totalParts: number;
  singleUploadUrl?: string | null;
  parts: IFilesSignedPart[];
}

export type TFileUploadStatus =
  | 'queued'
  | 'uploading'
  | 'completing'
  | 'paused'
  | 'done'
  | 'failed';

export interface IFileUploadItem {
  localId: string;
  name: string;
  size: number;
  folderId?: string;
  replaceFileId?: string;
  status: TFileUploadStatus;
  uploadedBytes: number;
  error?: string;
  fileId?: string;
}
