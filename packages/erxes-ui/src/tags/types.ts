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

// queries

export type TagsQueryResponse = {
  tags: ITag[];
  loading: boolean;
  refetch: () => void;
};
