export interface ITag {
  _id: string;
  type: string;
  name: string;
  colorCode: string;
  objectCount?: number;
  parentId?: string;
  order?: string;
  totalObjectCount?: number;
  selectedBy?: any;
}

export type ITagTypes =
  | 'conversation'
  | 'customer'
  | 'engageMessage'
  | 'company'
  | 'integration'
  | 'automations';

// queries

export type TagsQueryResponse = {
  tags: ITag[];
  loading: boolean;
  fetchMore: any;
  refetch: () => void;
};
