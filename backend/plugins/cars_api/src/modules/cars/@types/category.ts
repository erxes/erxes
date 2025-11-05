import { Document } from 'mongoose';
import { IAttachment } from 'erxes-api-shared/core-types';

export interface ICarCategory {
  name: string;
  code: string;
  order: string;
  parentId: string;
  description: string;
  image: IAttachment;
  secondaryImages: IAttachment[];
  productCategoryId: string;
}

export interface ICarCategoryDocument extends ICarCategory, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}
