export interface ITag {
  _id: string;
  type: string;
  name: string;
  colorCode: string;
  objectCount?: number;
  parentId?: string;
  order?: string;
  totalObjectCount?: number;
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

export type TagMutationResponse = {
  tagMutation: (params: { variables: TagMutationVariables }) => Promise<any>;
};

export type TagMutationVariables = {
  type: string;
  targetIds: string[];
  tagIds: string[];
};
