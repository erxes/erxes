import { MutationVariables, QueryResponse } from '@erxes/ui/src/types';

import { IUser } from '@erxes/ui/src/auth/types';

// query types
export interface IFolder {
  _id: string;
  name: string;
  order: string;
  hasChild?: boolean;
  createdAt?: Date;
  createdUserId?: string;
  parentId?: string;
  parent?: IFolder;
  sharedUsers: IUser[];
}

export interface IFile {
  _id: string;
  name: string;
  type: string;
  contentType?: string;
  contentTypeId?: string;
  createdAt?: Date;
  createdUserId?: string;
  documentId?: string;
  folderId: string;
  url: string;
  info: {
    name: string;
    size: number;
    type: string;
  };
  permissionUnitId: string;
  permissionUserIds: string[];
  relatedFileIds: string[];
  relatedFiles: IFile[];
  sharedUsers: IUser[];
}
export interface IAccessRequests {
  _id: string;
  file: IFile;
  createdAt?: Date;
  description?: string;
  fileId?: string;
  fromUserId?: string;
  fromUser?: IUser;
  toUser?: IUser;
  status: string;
}

export interface ILogs {
  _id: string;
  contentType?: string;
  contentTypeId?: string;
  createdAt?: Date;
  description?: string;
  user?: IUser;
  userId?: string;
}

export interface IRelatedFiles {
  _id: string;
  contentType: string;
  contentTypeId: string;
  fileIds: string[];
  files: IFile[];
}

// query types
export type FilemanagerFoldersQueryResponse = {
  filemanagerFolders: IFolder[];
} & QueryResponse;

export type GetRelatedFilesContentTypeQueryResponse = {
  filemanagerGetRelatedFilesContentType: IRelatedFiles[];
} & QueryResponse;

export type FilemanagerFilesQueryResponse = {
  filemanagerFiles: IFile[];
} & QueryResponse;

// mutation types
export type SaveFilemanagerFolderMutationVariables = {
  _id?: string;
  name: string;
  parentId?: string;
};

export type SaveFileMutationVariables = {
  name: string;
  type: string;
  folderId: string;
  url?: string;
  contentType: string;
  contentTypeId: string;
  documentId: string;
};

export type RelateFileMutationVariables = {
  sourceId: string;
  targetIds: string[];
};

export type RelateFileContentTypeMutationVariables = {
  contentType: string;
  contentTypeId: string;
  fileIds: string[];
};

export type RequestAccessMutationVariables = {
  fileId: string;
  description?: string;
};

export type ConfirmRequestMutationVariables = {
  requestId: string;
};

export type RemoveFilemanagerFolderMutationResponse = {
  removeMutation: (params: { variables: MutationVariables }) => Promise<void>;
};

export type RemoveFileMutationResponse = {
  removeFileMutation: (params: {
    variables: MutationVariables;
  }) => Promise<void>;
};

export type SaveFilemanagerFolderMutationResponse = {
  saveMutation: (params: {
    variables: SaveFilemanagerFolderMutationVariables;
  }) => Promise<void>;
};

export type SaveFileMutationResponse = {
  saveFileMutation: (params: {
    variables: SaveFileMutationVariables;
  }) => Promise<void>;
};

export type RelateFileMutationResponse = {
  relateFileMutation: (params: {
    variables: RelateFileMutationVariables;
  }) => Promise<void>;
};

export type RelateFileContentTypeMutationResponse = {
  relateFileContentTypeMutation: (params: {
    variables: RelateFileContentTypeMutationVariables;
  }) => Promise<void>;
};

export type RequestAccessMutationResponse = {
  requestAccessMutation: (params: {
    variables: RequestAccessMutationVariables;
  }) => Promise<void>;
};

export type ConfirmRequestMutationResponse = {
  confirmRequestMutation: (params: {
    variables: ConfirmRequestMutationVariables;
  }) => Promise<void>;
};

export type RequestAckMutationResponse = {
  requestAckMutation: (params: {
    variables: RequestAccessMutationVariables;
  }) => Promise<void>;
};

export type AckRequestMutationResponse = {
  ackRequestMutation: (params: { variables: { _id: string } }) => Promise<void>;
};
