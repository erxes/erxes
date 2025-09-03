import { Document } from 'mongoose';

export interface ITag {
  name: string;
  colorCode?: string;
  parentId?: string;
  relatedIds?: string[];
  isGroup?: boolean;
}

export interface ITagDocument extends ITag, Document {
  _id: string;
  createdAt: Date;
}
