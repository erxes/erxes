import { Document } from 'mongoose';

export interface IRelation {
  createdAt: Date;
  updatedAt: Date;
  entities: {
    contentType: string;
    contentId: string;
  }[];
}

export interface IRelationDocument extends IRelation, Document {
  _id: string;
}
