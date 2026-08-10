import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { Document } from 'mongoose';

export interface IPackageProduct {
  productId: string;
  quantity: number;
}

export interface IPackage {
  name?: string;
  description?: string;
  coverImage?: string;
  products: IPackageProduct[];
  tagIds?: string[];
  price?: number;
  percent?: number;
  status?: string;
}

export interface IPackageDocument extends IPackage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPackageParams extends ICursorPaginateParams {
  searchValue?: string;
  status?: string;
  ids?: string[];
  tagIds?: string[];
}
