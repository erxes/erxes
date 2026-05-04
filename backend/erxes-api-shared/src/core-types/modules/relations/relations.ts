import { Document } from 'mongoose';

export interface IRelation {
  entities: {
    contentType: string;
    contentId: string;
  }[];
}

export interface IRelationDocument extends IRelation, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
