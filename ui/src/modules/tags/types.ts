export interface ITag {
  _id: string;
  type: string;
  name: string;
  colorCode: string;
  objectCount?: number;
}

export interface ITagSaveParams {
  tag?: ITag;
  doc: {
    _id?: string;
    name: string;
    type: string;
    colorCode: string;
  };
  callback?: () => void;
}

export type ITagTypes =
  | 'conversation'
  | 'customer'
  | 'engageMessage'
  | 'company'
  | 'integration';

// queries

export type TagsQueryResponse = {
  tags: ITag[];
  loading: boolean;
  refetch: () => void;
};

// mutations

export type MutationVariables = {
  _id?: string;
  name: string;
  type: string;
  colorCode: string;
};

export type AddMutationResponse = {
  addMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type EditMutationResponse = {
  editMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

export type RemoveMutationResponse = {
  removeMutation: (params: { variables: { ids: string[] } }) => Promise<any>;
};

export type TagMutationVariables = {
  type: string;
  targetIds: string[];
  tagIds: string[];
};

export type TagMutationResponse = {
  tagMutation: (params: { variables: TagMutationVariables }) => Promise<any>;
};
