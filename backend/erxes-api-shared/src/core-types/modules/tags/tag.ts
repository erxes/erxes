import { Document } from 'mongoose';

export interface ITag {
  name: string;
  type: string;
  colorCode?: string;
  objectCount?: number;
  parentId?: string;
}

export interface ITagDocument extends ITag, Document {
  _id: string;
  createdAt: Date;
  order?: string;
  relatedIds?: string[];
}
