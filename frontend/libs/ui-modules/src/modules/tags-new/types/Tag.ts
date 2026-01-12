export interface ITag {
  _id: string;
  name: string;
  type?: string;
  colorCode?: string;
  createdAt?: string;
  objectCount?: number;
  parentId?: string;
  isGroup?: boolean;
  relatedIds?: string[];
  description?: string;
  totalObjectCount?: number;
}
