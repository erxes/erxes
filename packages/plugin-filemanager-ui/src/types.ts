import { MutationVariables, QueryResponse } from '@erxes/ui/src/types';

// query types
export interface IFolder {
  _id: string;
  name: string;
  createdAt?: Date;
  createdUserId?: string;
  parentId?: string;
}

// query types
export type FilemanagerFoldersQueryResponse = {
  filemanagerFolders: IFolder[];
} & QueryResponse;

// mutation types
export type SaveFilemanagerFolderMutationVariables = {
  _id?: string;
  name: string;
  parentId?: string;
};

export type RemoveFilemanagerFolderMutationResponse = {
  removeMutation: (params: { variables: MutationVariables }) => Promise<void>;
};

export type SaveFilemanagerFolderMutationResponse = {
  saveMutation: (params: {
    variables: SaveFilemanagerFolderMutationVariables;
  }) => Promise<void>;
};
