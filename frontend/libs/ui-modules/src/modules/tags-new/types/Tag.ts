export interface ITag {
  _id: string;
  name: string;
  type: string | null;
  colorCode?: string;
  createdAt?: string;
  objectCount?: number;
  parentId?: string;
  isGroup?: boolean;
  relatedIds?: string[];
  description?: string;
  totalObjectCount?: number;
  __typename?: 'Tag';
}

export interface ITagTypes {
  tagsGetTypes: Record<
    string,
    {
      description: string;
      contentType: string;
    }[]
  >;
}
