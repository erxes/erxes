import { IAttachment } from "@erxes/ui/src/types";

export interface IWebSite {
  _id: string;
  name: string;
  description?: string;
  domain?: string;
  url?: string;
  icon?: string;
  createdAt?: Date;
  kind: string;
}

export interface IPostDocument {
  clientPortalId: string;
  type: string;
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  categoryIds?: string[];
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  tagIds?: string[];
  authorId?: string;
  featured?: boolean;
  featuredDate?: Date | null;
  scheduledDate?: Date;
  autoArchiveDate?: Date;
  publishedDate?: Date;
  viewCount?: number;
  reactions?: string[];
  reactionCounts?: { [key: string]: number };
  thumbnail?: IAttachment;
  images?: IAttachment[];
  video?: IAttachment;
  audio?: IAttachment;
  documents?: IAttachment[];
  attachments?: IAttachment[];
  videoUrl?: string;
  customFieldsData?: {
    [key: string]: any;
  };
}

export interface IPost extends IPostDocument {
  _id: string;
}


export interface ICms {
  _id: string;
  name?: string;
  createdAt?: Date;
  expiryDate?: Date;
  totalObjectCount?: number;
  checked?: boolean;
  typeId?: string;
  currentType?: IType;
}

export interface IType {
  _id: string;
  name: string;
}

// queries
export type CmsQueryResponse = {
  cmss: ICms[];
  refetch: () => void;
  loading: boolean;
};
export type TypeQueryResponse = {
  cmsTypes: IType[];
  refetch: () => void;
  loading: boolean;
};

// mutations
export type MutationVariables = {
  _id?: string;
  name: string;
  createdAt?: Date;
  expiryDate?: Date;
  checked?: boolean;
  type?: string;
};
export type AddMutationResponse = {
  addMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
};

export type EditTypeMutationResponse = {
  typesEdit: (params: { variables: MutationVariables }) => Promise<any>;
};

export type RemoveTypeMutationResponse = {
  typesRemove: (params: { variables: { _id: string } }) => Promise<any>;
};
